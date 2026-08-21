import argparse
import io
import json
import unittest
from types import SimpleNamespace
from unittest import mock

import _extract_path  # noqa: F401
import agent
from agent import SubmitResult, extract_url, main, run_tool_loop


class ScriptedChat:
    def __init__(self, responses: list) -> None:
        self._responses = iter(responses)
        self.appended: list = []

    def stream(self):
        response = next(self._responses)
        yield response, SimpleNamespace(content=None, tool_calls=[])

    def append(self, item) -> None:
        self.appended.append(item)


def _tool_response(name: str = "submit_resource", arguments: str = "{}", content: str = ""):
    call = SimpleNamespace(
        id="call-1",
        function=SimpleNamespace(name=name, arguments=arguments),
    )
    return SimpleNamespace(tool_calls=[call], content=content, usage=None)


def _text_response(content: str):
    return SimpleNamespace(tool_calls=[], content=content, usage=None)


class ExtractUrlTests(unittest.TestCase):
    @mock.patch("agent.make_chat")
    @mock.patch("agent.run_tool_loop")
    def test_unparseable_url_is_hostname(self, mock_loop, mock_chat) -> None:
        for url in ("not-a-url", ""):
            with self.subTest(url=url):
                result = extract_url(url)
                self.assertEqual(result.fail, "hostname")
                self.assertEqual(result.detail, "could not parse hostname")
                self.assertIsNone(result.payload)
        mock_chat.assert_not_called()
        mock_loop.assert_not_called()

    @mock.patch("agent.reset_submit")
    @mock.patch("agent.load_system_prompt", return_value="prompt")
    @mock.patch("agent.web_search")
    @mock.patch("agent.make_chat")
    @mock.patch("agent.run_tool_loop")
    def test_success_returns_payload(
        self, mock_loop, mock_chat, _web, _prompt, mock_reset
    ) -> None:
        payload = {"ok": True, "resource": {"name": "Jenesse Center"}}
        mock_loop.return_value = SubmitResult(payload=payload)
        mock_chat.return_value.append = mock.Mock()
        result = extract_url("https://jenesse.org/")
        self.assertEqual(result.payload, payload)
        self.assertIsNone(result.fail)
        mock_reset.assert_called_once()

    @mock.patch("agent.reset_submit")
    @mock.patch("agent.load_system_prompt", return_value="prompt")
    @mock.patch("agent.web_search")
    @mock.patch("agent.make_chat")
    @mock.patch("agent.run_tool_loop")
    def test_no_submit_and_loop_cap_propagate(
        self, mock_loop, mock_chat, _web, _prompt, mock_reset
    ) -> None:
        mock_chat.return_value.append = mock.Mock()
        mock_loop.return_value = SubmitResult(fail="no_submit", detail="site has no name")
        result = extract_url("https://jenesse.org/")
        self.assertEqual(result.fail, "no_submit")
        self.assertEqual(result.detail, "site has no name")
        mock_reset.assert_called()

        mock_loop.return_value = SubmitResult(
            fail="loop_cap",
            detail="loop cap reached without a successful submit",
        )
        result = extract_url("https://jenesse.org/")
        self.assertEqual(result.fail, "loop_cap")


class MainTests(unittest.TestCase):
    def _run(self, result: SubmitResult) -> tuple[str | None, str, str]:
        with (
            mock.patch("agent.parse_args") as mock_args,
            mock.patch("agent.extract_url") as mock_extract,
            mock.patch("sys.stdout", new=io.StringIO()) as stdout,
            mock.patch("sys.stderr", new=io.StringIO()) as stderr,
        ):
            mock_args.return_value = argparse.Namespace(
                url="https://jenesse.org/", debug=False
            )
            mock_extract.return_value = result
            exit_msg = None
            try:
                main()
            except SystemExit as exc:
                exit_msg = str(exc)
            return exit_msg, stdout.getvalue(), stderr.getvalue()

    def test_hostname_exit(self) -> None:
        exit_msg, stdout, stderr = self._run(
            SubmitResult(fail="hostname", detail="could not parse hostname")
        )
        self.assertEqual(exit_msg, "could not parse hostname")
        self.assertEqual(stdout, "")

    def test_no_submit_prints_detail_on_stderr(self) -> None:
        exit_msg, stdout, stderr = self._run(
            SubmitResult(fail="no_submit", detail="site has no name")
        )
        self.assertEqual(exit_msg, "extraction finished without a successful submit")
        self.assertEqual(stdout, "")
        self.assertIn("site has no name", stderr)

    def test_no_submit_empty_detail(self) -> None:
        exit_msg, stdout, stderr = self._run(SubmitResult(fail="no_submit", detail=""))
        self.assertEqual(exit_msg, "extraction finished without a successful submit")
        self.assertEqual(stdout, "")
        self.assertEqual(stderr, "")

    def test_loop_cap_exit(self) -> None:
        exit_msg, stdout, _stderr = self._run(
            SubmitResult(
                fail="loop_cap",
                detail="loop cap reached without a successful submit",
            )
        )
        self.assertEqual(exit_msg, "loop cap reached without a successful submit")
        self.assertEqual(stdout, "")

    def test_success_prints_json(self) -> None:
        payload = {"ok": True, "resource": {"name": "Jenesse Center"}}
        exit_msg, stdout, _stderr = self._run(SubmitResult(payload=payload))
        self.assertIsNone(exit_msg)
        self.assertEqual(json.loads(stdout), payload)


class RunToolLoopTests(unittest.TestCase):
    @mock.patch("agent.tool_result", side_effect=lambda output, tool_call_id: output)
    def test_no_client_side_tools_is_no_submit(self, _tool_result) -> None:
        chat = ScriptedChat([_text_response("site has no name")])
        result = run_tool_loop(chat, False, lambda name, args: "{}")
        self.assertEqual(result.fail, "no_submit")
        self.assertEqual(result.detail, "site has no name")
        self.assertIsNone(result.payload)

    @mock.patch("agent.get_tool_call_type", return_value="client_side_tool")
    @mock.patch("agent.tool_result", side_effect=lambda output, tool_call_id: output)
    def test_loop_cap_after_failed_submits(self, _tool_result, _kind) -> None:
        chat = ScriptedChat([_tool_response() for _ in range(agent.CLIENT_SIDE_LOOP_CAP)])
        result = run_tool_loop(
            chat, False, lambda name, args: json.dumps({"ok": False, "errors": ["no"]})
        )
        self.assertEqual(result.fail, "loop_cap")
        self.assertEqual(result.detail, "loop cap reached without a successful submit")

    @mock.patch("agent.get_tool_call_type", return_value="client_side_tool")
    @mock.patch("agent.tool_result", side_effect=lambda output, tool_call_id: output)
    def test_successful_submit_returns_payload(self, _tool_result, _kind) -> None:
        payload = {"ok": True, "resource": {"name": "Jenesse Center"}}
        chat = ScriptedChat([_tool_response()])
        result = run_tool_loop(chat, False, lambda name, args: json.dumps(payload))
        self.assertEqual(result.payload, payload)
        self.assertIsNone(result.fail)


class DiscoverAdapterTests(unittest.TestCase):
    @mock.patch("discover.make_chat")
    @mock.patch("discover.load_search_prompt", return_value="prompt")
    @mock.patch("discover.run_tool_loop")
    def test_prints_model_text_then_exits(self, mock_loop, _prompt, mock_chat) -> None:
        from discover import discover

        mock_chat.return_value.append = mock.Mock()
        mock_loop.return_value = SubmitResult(fail="no_submit", detail="no LA orgs")
        stderr = io.StringIO()
        with mock.patch("sys.stderr", stderr):
            with self.assertRaises(SystemExit) as raised:
                discover("food pantry")
        self.assertEqual(
            str(raised.exception),
            "discover did not call submit_candidates successfully",
        )
        self.assertIn("no LA orgs", stderr.getvalue())


class SearchExtractLoopTests(unittest.TestCase):
    @mock.patch("run_search.extract_url")
    @mock.patch("run_search.load_jsonl", return_value=[])
    @mock.patch("run_search.load_data_json", return_value={})
    @mock.patch("run_search.discover")
    def test_logs_reason_and_continues(
        self, mock_discover, _data, _pending, mock_extract
    ) -> None:
        from candidates import Candidate, CandidateList
        import run_search

        mock_discover.return_value = CandidateList(
            query="food",
            candidates=[
                Candidate(name="A", url="https://a.org/", why="a"),
                Candidate(name="B", url="https://b.org/", why="b"),
            ],
        )
        mock_extract.side_effect = [
            SubmitResult(fail="no_submit", detail="no name on site"),
            SubmitResult(payload={"ok": True, "resource": {"name": "B"}}),
        ]
        stdout = io.StringIO()
        stderr = io.StringIO()
        with (
            mock.patch("sys.argv", ["run_search.py", "food"]),
            mock.patch("sys.stdout", stdout),
            mock.patch("sys.stderr", stderr),
        ):
            run_search.main()
        self.assertIn("no name on site", stderr.getvalue())
        self.assertEqual(json.loads(stdout.getvalue()), {"ok": True, "resource": {"name": "B"}})


class RefreshExtractLoopTests(unittest.TestCase):
    @mock.patch("run_refresh.append_jsonl")
    @mock.patch("run_refresh.save_state")
    @mock.patch("run_refresh.load_jsonl", return_value=[])
    @mock.patch("run_refresh.load_state", return_value={})
    @mock.patch("run_refresh.load_data_json")
    @mock.patch("agent.extract_url")
    def test_logs_reason_and_skips_write(
        self, mock_extract, mock_data, _state, _pending, mock_save, mock_append
    ) -> None:
        import run_refresh

        mock_data.return_value = {
            "0": {"name": "Jenesse Center", "website": "https://jenesse.org/"}
        }
        mock_extract.return_value = SubmitResult(fail="hostname", detail="could not parse hostname")
        stderr = io.StringIO()
        with (
            mock.patch("sys.argv", ["run_refresh.py", "--id", "0", "--force"]),
            mock.patch("sys.stderr", stderr),
        ):
            run_refresh.main()
        self.assertIn("could not parse hostname", stderr.getvalue())
        mock_append.assert_not_called()
        mock_save.assert_not_called()


if __name__ == "__main__":
    unittest.main()

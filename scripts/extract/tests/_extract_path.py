import sys
from pathlib import Path

EXTRACT_DIR = Path(__file__).resolve().parents[1]
_extract = str(EXTRACT_DIR)
if _extract not in sys.path:
    sys.path.insert(0, _extract)

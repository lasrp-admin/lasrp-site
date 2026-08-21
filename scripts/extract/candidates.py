from pydantic import BaseModel, Field, HttpUrl

MAX_CANDIDATES = 5

class Candidate(BaseModel):
    name: str = Field(description="Organization name")
    url: HttpUrl = Field(description="Official website URL")
    why: str = Field(description="One sentence: why this org matches the query")

class CandidateList(BaseModel):
    query: str = Field(description="The user query you searched")
    candidates: list[Candidate] = Field(
        default_factory=list,
        description=f"At most {MAX_CANDIDATES} official org websites",
        max_length=MAX_CANDIDATES,
    )
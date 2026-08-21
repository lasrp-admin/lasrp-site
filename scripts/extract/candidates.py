from pydantic import BaseModel, Field, HttpUrl
from settings import settings

class Candidate(BaseModel):
    name: str = Field(description="Organization name")
    url: HttpUrl = Field(description="Official website URL")
    why: str = Field(description="One sentence: why this org matches the query")

class CandidateList(BaseModel):
    query: str = Field(description="The user query you searched")
    candidates: list[Candidate] = Field(
        default_factory=list,
        description=f"At most {settings.max_candidates} official org websites",
        max_length=settings.max_candidates,
    )

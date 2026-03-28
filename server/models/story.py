from pydantic import BaseModel


class StoryCreate(BaseModel):
    title: str
    content: str
    author: str = ""
    date: str = ""
    personIds: list[str] = []
    tags: list[str] = []
    type: str = "memory"


class StoryUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    author: str | None = None
    date: str | None = None
    personIds: list[str] | None = None
    tags: list[str] | None = None
    type: str | None = None


class StoryResponse(BaseModel):
    id: str
    title: str
    content: str
    author: str = ""
    date: str = ""
    personIds: list[str] = []
    tags: list[str] = []
    type: str = "memory"
    createdAt: str | None = None

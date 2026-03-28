from pydantic import BaseModel


class InviteCreate(BaseModel):
    email: str | None = None


class InviteResponse(BaseModel):
    id: str
    code: str
    createdBy: str
    createdByName: str = ""
    email: str | None = None
    used: bool = False
    usedBy: str | None = None
    createdAt: str | None = None

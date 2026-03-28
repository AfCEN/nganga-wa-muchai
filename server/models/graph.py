from pydantic import BaseModel


class GraphNode(BaseModel):
    id: str
    name: str
    generation: int = 1
    role: str = ""
    photo: str | None = None


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    type: str


class GraphResponse(BaseModel):
    nodes: list[GraphNode] = []
    edges: list[GraphEdge] = []

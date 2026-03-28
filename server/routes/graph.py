from fastapi import APIRouter, Depends, HTTPException
from neo4j import AsyncSession

from ..db import get_session
from ..models.graph import GraphResponse

router = APIRouter(prefix="/api", tags=["graph"])


@router.get("/graph", response_model=GraphResponse)
async def get_graph(session: AsyncSession = Depends(get_session)):
    # Fetch all person nodes
    nodes_result = await session.run(
        "MATCH (p:Person) RETURN p.id as id, p.name as name, p.generation as generation, p.role as role, p.photo as photo"
    )
    nodes = [
        {
            "id": r["id"],
            "name": r["name"],
            "generation": r["generation"] or 1,
            "role": r["role"] or "",
            "photo": r["photo"],
        }
        async for r in nodes_result
    ]

    # Fetch all connections
    edges_result = await session.run(
        """
        MATCH (a:Person)-[r:CONNECTED_TO]->(b:Person)
        RETURN r.connId as id, a.id as source, b.id as target, r.type as type
        """
    )
    edges = [dict(r) async for r in edges_result]

    return {"nodes": nodes, "edges": edges}


@router.get("/people/{person_id}/path/{target_id}")
async def find_path(
    person_id: str, target_id: str, session: AsyncSession = Depends(get_session)
):
    result = await session.run(
        """
        MATCH path = shortestPath(
            (a:Person {id: $source})-[:CONNECTED_TO*]-(b:Person {id: $target})
        )
        RETURN [n IN nodes(path) | {id: n.id, name: n.name}] as people,
               [r IN relationships(path) | {type: r.type}] as connections
        """,
        source=person_id,
        target=target_id,
    )
    record = await result.single()
    if not record:
        raise HTTPException(404, "No path found between these people")
    return {"people": record["people"], "connections": record["connections"]}

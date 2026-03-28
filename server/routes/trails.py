from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from neo4j import AsyncSession

from ..auth import get_current_user
from ..db import get_session
from ..models.trail import TrailCreate, TrailResponse, TrailUpdate

router = APIRouter(prefix="/api/trails", tags=["trails"])


def _trail_from_node(node) -> dict:
    t = dict(node)
    return {
        "id": t.get("id", ""),
        "title": t.get("title", ""),
        "description": t.get("description", ""),
        "storyIds": [],
        "createdAt": str(t["createdAt"]) if t.get("createdAt") else None,
    }


@router.get("", response_model=list[TrailResponse])
async def list_trails(session: AsyncSession = Depends(get_session)):
    result = await session.run("MATCH (t:StoryTrail) RETURN t ORDER BY t.createdAt DESC")
    trails = []
    async for record in result:
        trails.append(_trail_from_node(record["t"]))

    if trails:
        links_result = await session.run(
            """
            MATCH (s:Story)-[r:PART_OF_TRAIL]->(t:StoryTrail)
            RETURN t.id as trailId, s.id as storyId, r.order as ord
            ORDER BY r.order
            """
        )
        links = {}
        async for r in links_result:
            links.setdefault(r["trailId"], []).append(r["storyId"])
        for trail in trails:
            trail["storyIds"] = links.get(trail["id"], [])

    return trails


@router.get("/{trail_id}", response_model=TrailResponse)
async def get_trail(trail_id: str, session: AsyncSession = Depends(get_session)):
    result = await session.run(
        "MATCH (t:StoryTrail {id: $id}) RETURN t", id=trail_id
    )
    record = await result.single()
    if not record:
        raise HTTPException(404, "Trail not found")
    trail = _trail_from_node(record["t"])

    stories_result = await session.run(
        """
        MATCH (s:Story)-[r:PART_OF_TRAIL]->(t:StoryTrail {id: $id})
        RETURN s.id as storyId ORDER BY r.order
        """,
        id=trail_id,
    )
    trail["storyIds"] = [r["storyId"] async for r in stories_result]
    return trail


@router.post("", response_model=TrailResponse, status_code=201)
async def create_trail(data: TrailCreate, session: AsyncSession = Depends(get_session), current_user: dict = Depends(get_current_user)):
    trail_id = f"t_{uuid4().hex[:10]}"
    result = await session.run(
        """
        CREATE (t:StoryTrail {
            id: $id, title: $title, description: $description,
            createdAt: datetime()
        })
        RETURN t
        """,
        id=trail_id,
        title=data.title,
        description=data.description,
    )
    record = await result.single()
    trail = _trail_from_node(record["t"])

    if data.storyIds:
        await session.run(
            """
            UNWIND range(0, size($storyIds) - 1) AS idx
            WITH idx, $storyIds[idx] AS sid
            MATCH (s:Story {id: sid}), (t:StoryTrail {id: $trailId})
            CREATE (s)-[:PART_OF_TRAIL {order: idx}]->(t)
            """,
            storyIds=data.storyIds,
            trailId=trail_id,
        )
        trail["storyIds"] = data.storyIds

    return trail


@router.put("/{trail_id}", response_model=TrailResponse)
async def update_trail(
    trail_id: str, data: TrailUpdate, session: AsyncSession = Depends(get_session), current_user: dict = Depends(get_current_user)
):
    updates = {k: v for k, v in data.model_dump().items() if v is not None and k != "storyIds"}
    if updates:
        set_clauses = ", ".join(f"t.{k} = ${k}" for k in updates)
        query = f"MATCH (t:StoryTrail {{id: $id}}) SET {set_clauses}, t.updatedAt = datetime() RETURN t"
        result = await session.run(query, id=trail_id, **updates)
        record = await result.single()
        if not record:
            raise HTTPException(404, "Trail not found")

    if data.storyIds is not None:
        await session.run(
            "MATCH (s:Story)-[r:PART_OF_TRAIL]->(t:StoryTrail {id: $id}) DELETE r",
            id=trail_id,
        )
        if data.storyIds:
            await session.run(
                """
                UNWIND range(0, size($storyIds) - 1) AS idx
                WITH idx, $storyIds[idx] AS sid
                MATCH (s:Story {id: sid}), (t:StoryTrail {id: $trailId})
                CREATE (s)-[:PART_OF_TRAIL {order: idx}]->(t)
                """,
                storyIds=data.storyIds,
                trailId=trail_id,
            )

    result = await session.run("MATCH (t:StoryTrail {id: $id}) RETURN t", id=trail_id)
    record = await result.single()
    if not record:
        raise HTTPException(404, "Trail not found")
    trail = _trail_from_node(record["t"])

    stories_result = await session.run(
        """
        MATCH (s:Story)-[r:PART_OF_TRAIL]->(t:StoryTrail {id: $id})
        RETURN s.id as storyId ORDER BY r.order
        """,
        id=trail_id,
    )
    trail["storyIds"] = [r["storyId"] async for r in stories_result]
    return trail


@router.delete("/{trail_id}", status_code=204)
async def delete_trail(trail_id: str, session: AsyncSession = Depends(get_session), current_user: dict = Depends(get_current_user)):
    result = await session.run(
        "MATCH (t:StoryTrail {id: $id}) DETACH DELETE t RETURN count(t) as deleted",
        id=trail_id,
    )
    record = await result.single()
    if record["deleted"] == 0:
        raise HTTPException(404, "Trail not found")

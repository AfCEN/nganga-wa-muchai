from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from neo4j import AsyncSession

from ..auth import get_current_user
from ..db import get_session
from ..models.story import StoryCreate, StoryResponse, StoryUpdate

router = APIRouter(prefix="/api/stories", tags=["stories"])


async def _story_with_person_ids(session: AsyncSession, story_dict: dict) -> dict:
    """Fetch personIds via APPEARS_IN relationships."""
    result = await session.run(
        "MATCH (p:Person)-[:APPEARS_IN]->(s:Story {id: $id}) RETURN p.id as pid",
        id=story_dict["id"],
    )
    records = [r async for r in result]
    story_dict["personIds"] = [r["pid"] for r in records]
    return story_dict


def _story_from_node(node) -> dict:
    s = dict(node)
    return {
        "id": s.get("id", ""),
        "title": s.get("title", ""),
        "content": s.get("content", ""),
        "author": s.get("author", ""),
        "date": s.get("date", ""),
        "tags": s.get("tags", []),
        "type": s.get("type", "memory"),
        "personIds": [],
        "createdAt": str(s["createdAt"]) if s.get("createdAt") else None,
    }


@router.get("", response_model=list[StoryResponse])
async def list_stories(session: AsyncSession = Depends(get_session)):
    result = await session.run("MATCH (s:Story) RETURN s ORDER BY s.createdAt DESC")
    stories = []
    async for record in result:
        story = _story_from_node(record["s"])
        stories.append(story)

    # Batch fetch all person links
    if stories:
        links_result = await session.run(
            "MATCH (p:Person)-[:APPEARS_IN]->(s:Story) RETURN s.id as storyId, p.id as personId"
        )
        links = {}
        async for r in links_result:
            links.setdefault(r["storyId"], []).append(r["personId"])
        for story in stories:
            story["personIds"] = links.get(story["id"], [])

    return stories


@router.get("/{story_id}", response_model=StoryResponse)
async def get_story(story_id: str, session: AsyncSession = Depends(get_session)):
    result = await session.run("MATCH (s:Story {id: $id}) RETURN s", id=story_id)
    record = await result.single()
    if not record:
        raise HTTPException(404, "Story not found")
    story = _story_from_node(record["s"])
    return await _story_with_person_ids(session, story)


@router.post("", response_model=StoryResponse, status_code=201)
async def create_story(data: StoryCreate, session: AsyncSession = Depends(get_session), current_user: dict = Depends(get_current_user)):
    story_id = f"s_{uuid4().hex[:10]}"
    author = data.author or current_user.get("displayName", "")
    result = await session.run(
        """
        CREATE (s:Story {
            id: $id, title: $title, content: $content,
            author: $author, date: $date, tags: $tags,
            type: $type, createdBy: $createdBy, createdAt: datetime()
        })
        RETURN s
        """,
        id=story_id,
        title=data.title,
        content=data.content,
        author=author,
        createdBy=current_user["id"],
        date=data.date,
        tags=data.tags,
        type=data.type,
    )
    record = await result.single()
    story = _story_from_node(record["s"])

    # Create APPEARS_IN relationships
    if data.personIds:
        await session.run(
            """
            UNWIND $personIds AS pid
            MATCH (p:Person {id: pid}), (s:Story {id: $storyId})
            CREATE (p)-[:APPEARS_IN]->(s)
            """,
            personIds=data.personIds,
            storyId=story_id,
        )
        story["personIds"] = data.personIds

    return story


@router.put("/{story_id}", response_model=StoryResponse)
async def update_story(
    story_id: str, data: StoryUpdate, session: AsyncSession = Depends(get_session), current_user: dict = Depends(get_current_user)
):
    updates = {k: v for k, v in data.model_dump().items() if v is not None and k != "personIds"}
    if updates:
        set_clauses = ", ".join(f"s.{k} = ${k}" for k in updates)
        query = f"MATCH (s:Story {{id: $id}}) SET {set_clauses}, s.updatedAt = datetime() RETURN s"
        result = await session.run(query, id=story_id, **updates)
        record = await result.single()
        if not record:
            raise HTTPException(404, "Story not found")

    # Update person links if provided
    if data.personIds is not None:
        await session.run(
            "MATCH (p:Person)-[r:APPEARS_IN]->(s:Story {id: $id}) DELETE r",
            id=story_id,
        )
        if data.personIds:
            await session.run(
                """
                UNWIND $personIds AS pid
                MATCH (p:Person {id: pid}), (s:Story {id: $storyId})
                CREATE (p)-[:APPEARS_IN]->(s)
                """,
                personIds=data.personIds,
                storyId=story_id,
            )

    # Return updated story
    result = await session.run("MATCH (s:Story {id: $id}) RETURN s", id=story_id)
    record = await result.single()
    if not record:
        raise HTTPException(404, "Story not found")
    story = _story_from_node(record["s"])
    return await _story_with_person_ids(session, story)


@router.delete("/{story_id}", status_code=204)
async def delete_story(story_id: str, session: AsyncSession = Depends(get_session), current_user: dict = Depends(get_current_user)):
    result = await session.run(
        "MATCH (s:Story {id: $id}) DETACH DELETE s RETURN count(s) as deleted",
        id=story_id,
    )
    record = await result.single()
    if record["deleted"] == 0:
        raise HTTPException(404, "Story not found")

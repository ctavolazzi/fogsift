from fastapi import APIRouter, HTTPException
from typing import Optional

from .schema import (
    MemoryCreateRequest,
    MemoryRememberResponse,
    MemorySearchRequest,
    MemorySearchResponse,
    MemoryStatsResponse,
    MemoryFragment as MemoryFragmentSchema,
)
from .service import MemoryService

router = APIRouter(prefix="/api/memory", tags=["memory"])

# Injected at startup by main.py
memory_service: Optional[MemoryService] = None


def _require_service() -> MemoryService:
    if memory_service is None:
        raise HTTPException(status_code=503, detail="Memory service not initialized")
    return memory_service


def _to_schema(fragment) -> MemoryFragmentSchema:
    return MemoryFragmentSchema(
        id=fragment.id,
        content=fragment.content,
        topic=fragment.topic,
        type=fragment.type,
        importance=fragment.importance,
        tags=fragment.tags,
        created_at=fragment.created_at,
        updated_at=fragment.updated_at,
    )


@router.post("/remember", response_model=MemoryRememberResponse)
async def remember(request: MemoryCreateRequest):
    svc = _require_service()
    fragment = svc.remember(
        content=request.content,
        topic=request.topic,
        type_=request.type,
        importance=request.importance,
        tags=request.tags,
    )
    return MemoryRememberResponse(
        success=True,
        fragment_id=fragment.id,
        message=f"Stored in topic '{fragment.topic}'",
    )


@router.get("/recall", response_model=list[MemoryFragmentSchema])
async def recall(
    topic: Optional[str] = None,
    memory_type: Optional[str] = None,
    min_importance: float = 0.0,
    limit: int = 10,
    offset: int = 0,
):
    svc = _require_service()
    fragments = svc.recall(
        topic=topic,
        type_=memory_type,
        min_importance=min_importance,
        limit=limit,
        offset=offset,
    )
    return [_to_schema(f) for f in fragments]


@router.post("/search", response_model=MemorySearchResponse)
async def search(request: MemorySearchRequest):
    svc = _require_service()
    results = svc.search(
        query=request.query,
        topic=request.topic,
        type_=request.type,
        limit=request.limit,
        min_importance=request.min_importance,
    )
    return MemorySearchResponse(
        results=[_to_schema(f) for f in results],
        count=len(results),
        query=request.query,
    )


@router.get("/stats", response_model=MemoryStatsResponse)
async def stats():
    svc = _require_service()
    return MemoryStatsResponse(**svc.stats())


@router.get("/{fragment_id}", response_model=MemoryFragmentSchema)
async def get_memory(fragment_id: str):
    svc = _require_service()
    fragment = svc.get(fragment_id)
    if fragment is None:
        raise HTTPException(status_code=404, detail="Memory not found")
    return _to_schema(fragment)


@router.delete("/{fragment_id}")
async def forget(fragment_id: str):
    svc = _require_service()
    if not svc.forget(fragment_id):
        raise HTTPException(status_code=404, detail="Memory not found")
    return {"success": True, "fragment_id": fragment_id}

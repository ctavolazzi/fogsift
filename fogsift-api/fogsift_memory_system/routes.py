"""
Fogsift Memory System - API Routes
HTTP Endpoints for FastAPI.
"""

import logging
import sqlite3
from fastapi import APIRouter, HTTPException, Depends
from pydantic import ValidationError

from .models import (
    FragmentCreate, FragmentResponse, RecallRequest, RecallResponse,
    LinkCreate, LinkResponse, FragmentStats,
)

logger = logging.getLogger("fogsift_memory.routes")

router = APIRouter(prefix="/api/memory", tags=["Memory"])

# Injected at startup by main.py
memory_service = None


def get_service():
    if not memory_service:
        raise HTTPException(status_code=500, detail="Memory service not initialized")
    return memory_service


@router.post("/remember", response_model=FragmentResponse)
async def remember(request: FragmentCreate, service=Depends(get_service)):
    """Store a new memory fragment."""
    try:
        return service.remember(request)
    except ValidationError as e:
        raise HTTPException(status_code=422, detail="Invalid fragment data")
    except Exception:
        logger.exception("remember() failed")
        raise HTTPException(status_code=500, detail="Failed to store fragment")


@router.post("/recall", response_model=RecallResponse)
async def recall(request: RecallRequest, service=Depends(get_service)):
    """Search for relevant memory fragments."""
    try:
        return service.recall(request)
    except Exception:
        logger.exception("recall() failed")
        raise HTTPException(status_code=500, detail="Search failed")


@router.delete("/forget/{fragment_id}")
async def forget(fragment_id: str, service=Depends(get_service)):
    """Delete a memory fragment."""
    if not fragment_id.strip():
        raise HTTPException(status_code=400, detail="Invalid fragment ID")
    success = service.forget(fragment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Fragment not found")
    return {"success": True, "deleted_id": fragment_id}


@router.post("/link", response_model=LinkResponse)
async def link_fragments(request: LinkCreate, service=Depends(get_service)):
    """Create a relationship graph link between two fragments."""
    try:
        return service.link(request)
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=400,
            detail="One or both fragment IDs do not exist",
        )
    except Exception:
        logger.exception("link() failed")
        raise HTTPException(status_code=500, detail="Failed to create link")


@router.get("/stats", response_model=FragmentStats)
async def get_stats(service=Depends(get_service)):
    """Get system statistics and knowledge base shape."""
    try:
        return service.get_stats()
    except Exception:
        logger.exception("get_stats() failed")
        raise HTTPException(status_code=500, detail="Failed to retrieve stats")


@router.get("/topic/{topic}", response_model=RecallResponse)
async def get_by_topic(topic: str, service=Depends(get_service)):
    """Get all memory fragments for a specific topic."""
    if not topic.strip():
        raise HTTPException(status_code=400, detail="Topic must not be empty")
    req = RecallRequest(topic=topic, token_budget=5000)
    return service.recall(req)


@router.get("/health")
async def health_check():
    """System health check."""
    return {"status": "online", "system": "Fogsift Memory L1/L2"}

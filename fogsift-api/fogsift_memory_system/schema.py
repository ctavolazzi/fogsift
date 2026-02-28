from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class MemoryCreateRequest(BaseModel):
    content: str
    topic: str = "general"
    type: str = "fact"
    importance: float = Field(default=0.5, ge=0.0, le=1.0)
    tags: list[str] = []


class MemoryFragment(BaseModel):
    id: str
    content: str
    topic: str
    type: str
    importance: float
    tags: list[str]
    created_at: datetime
    updated_at: datetime


class MemoryRememberResponse(BaseModel):
    success: bool
    fragment_id: str
    message: str = ""


class MemorySearchRequest(BaseModel):
    query: str
    topic: Optional[str] = None
    type: Optional[str] = None
    limit: int = Field(default=10, ge=1, le=100)
    min_importance: float = Field(default=0.0, ge=0.0, le=1.0)


class MemorySearchResponse(BaseModel):
    results: list[MemoryFragment]
    count: int
    query: str


class MemoryStatsResponse(BaseModel):
    total_memories: int
    topics: dict[str, int]
    types: dict[str, int]
    avg_importance: float

"""
Fogsift Memory System - Data Models
Pydantic schemas for fragments, links, and search operations
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class FragmentType(str, Enum):
    """Fragment classification types"""
    CLIENT_PATTERN = "client_pattern"        # Recurring client problem shape
    SOLUTION_APPROACH = "solution_approach"  # How you solved something
    DECISION = "decision"                    # Why you chose A over B
    ERROR = "error"                          # Mistake pattern (never forget)
    PREFERENCE = "preference"                # Your style/process rules
    PROCEDURE = "procedure"                  # Repeatable workflow


class LinkRelationType(str, Enum):
    """Types of relationships between fragments"""
    RELATED = "related"              # Contextually connected
    CAUSED_BY = "caused_by"          # A happened because of B
    RESOLVED_BY = "resolved_by"      # A was fixed by applying B
    PART_OF = "part_of"              # A is a component of B
    CONTRADICTS = "contradicts"      # A and B conflict
    INFORMS = "informs"              # A provides context for B


class TTLTier(str, Enum):
    """Fragment temperature based on usage"""
    HOT = "hot"      # Recently referenced
    WARM = "warm"    # Occasionally referenced
    COLD = "cold"    # Rarely referenced


class FragmentCreate(BaseModel):
    """Input model for creating a fragment"""
    content: str                                    # 1-3 sentences of the memory
    topic: str                                      # Organizational category (e.g., "redis", "auth", "frontend")
    type: FragmentType                              # Classification
    keywords: Optional[List[str]] = None            # Auto-extracted if not provided
    importance: Optional[float] = Field(None, ge=0.0, le=1.0)  # 0.0-1.0, defaults by type
    scope: str = "permanent"                        # "permanent" or "session"
    source: Optional[Dict[str, Any]] = None         # Metadata about origin (client_id, session_id, etc)


class FragmentResponse(BaseModel):
    """Output model for a fragment"""
    id: str
    content: str
    topic: str
    type: FragmentType
    keywords: List[str]
    importance: float
    scope: str
    ttl_tier: TTLTier
    created_at: datetime
    last_referenced: Optional[datetime]
    reference_count: int
    source: Optional[Dict[str, Any]]

    class Config:
        from_attributes = True


class LinkCreate(BaseModel):
    """Input model for creating a relationship between fragments"""
    from_id: str                        # Source fragment ID
    to_id: str                          # Target fragment ID
    relation_type: LinkRelationType     # Type of connection


class LinkResponse(BaseModel):
    """Output model for a link"""
    id: str
    from_id: str
    to_id: str
    relation_type: LinkRelationType
    created_at: datetime

    class Config:
        from_attributes = True


class RecallRequest(BaseModel):
    """Input model for searching memories"""
    keywords: Optional[List[str]] = None       # Exact keyword match (L1)
    text: Optional[str] = None                 # Natural language query
    topic: Optional[str] = None                # Filter by topic
    type: Optional[FragmentType] = None        # Filter by fragment type
    token_budget: int = 1000                   # Max tokens to return
    threshold: float = 0.5                     # Min similarity score (for future L3)
    include_links: bool = False                # Return connected fragments


class RecallResponse(BaseModel):
    """Output model for search results"""
    success: bool
    fragments: List[FragmentResponse]
    total_tokens: int
    search_path: List[str]  # ["L1:3", "L2:2"] to show which layers returned results
    query_time_ms: float


class FragmentStats(BaseModel):
    """Statistics about memory system"""
    total_fragments: int
    by_type: Dict[str, int]
    by_tier: Dict[str, int]
    by_topic: Dict[str, int]
    oldest_fragment: Optional[datetime]
    newest_fragment: Optional[datetime]


class ErrorResponse(BaseModel):
    """Standard error response"""
    success: bool = False
    error: str
    details: Optional[Dict[str, Any]]

"""
Fogsift Memory System - Data Models
Pydantic schemas for fragments, links, and search operations
"""

from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, List, Dict, Any, Annotated
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
    content: str = Field(..., min_length=1, max_length=10_000)
    topic: str = Field(..., min_length=1, max_length=100)
    type: FragmentType
    keywords: Optional[List[str]] = Field(default=None, max_length=20)
    importance: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    scope: str = Field(default="permanent", pattern=r"^(permanent|session)$")
    source: Optional[Dict[str, Any]] = None

    @field_validator("keywords")
    @classmethod
    def validate_keyword_lengths(cls, v):
        if v is not None:
            for kw in v:
                if len(kw) > 100:
                    raise ValueError("Each keyword must be 100 characters or fewer")
        return v


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
    from_id: str = Field(..., min_length=1, max_length=50)
    to_id: str = Field(..., min_length=1, max_length=50)
    relation_type: LinkRelationType


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
    keywords: Optional[List[str]] = Field(default=None, max_length=20)
    text: Optional[str] = Field(default=None, max_length=1_000)
    topic: Optional[str] = Field(default=None, max_length=100)
    type: Optional[FragmentType] = None
    token_budget: int = Field(default=1000, ge=100, le=50_000)
    threshold: float = Field(default=0.5, ge=0.0, le=1.0)
    include_links: bool = False

    @model_validator(mode="after")
    def require_search_criterion(self) -> "RecallRequest":
        has_keywords = bool(self.keywords)
        has_text = bool(self.text and self.text.strip())
        has_topic = bool(self.topic)
        has_type = self.type is not None
        if not any([has_keywords, has_text, has_topic, has_type]):
            raise ValueError(
                "At least one search criterion is required: keywords, text, topic, or type"
            )
        return self


class RecallResponse(BaseModel):
    """Output model for search results"""
    success: bool
    fragments: List[FragmentResponse]
    total_tokens: int
    search_path: List[str]  # ["L1:3", "L2:2"] shows which layers fired
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
    details: Optional[Dict[str, Any]] = None

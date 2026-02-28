from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
import uuid


@dataclass
class MemoryFragment:
    content: str
    topic: str
    type: str
    importance: float
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    tags: list = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)

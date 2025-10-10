from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class DisasterBase(BaseModel):
    type: str
    title: str
    description: Optional[str] = None
    severity: str
    latitude: float
    longitude: float
    magnitude: Optional[float] = None
    affected_area: Optional[float] = None
    casualties: Optional[int] = None
    status: str = "active"
    source: str
    source_url: Optional[str] = None
    external_id: Optional[str] = None
    occurred_at: datetime

class DisasterCreate(DisasterBase):
    pass

class DisasterUpdate(BaseModel):
    type: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    magnitude: Optional[float] = None
    affected_area: Optional[float] = None
    casualties: Optional[int] = None
    status: Optional[str] = None
    source_url: Optional[str] = None

class DisasterResponse(DisasterBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    created_at: datetime
    updated_at: datetime

class WeatherAlertBase(BaseModel):
    alert_type: str
    title: str
    description: Optional[str] = None
    severity: str
    latitude: float
    longitude: float
    area_desc: Optional[str] = None
    urgency: str
    certainty: str
    expires_at: Optional[datetime] = None
    issued_at: datetime
    source: str = "NWS"
    source_id: Optional[str] = None

class WeatherAlertCreate(WeatherAlertBase):
    pass

class WeatherAlertResponse(WeatherAlertBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    created_at: datetime

class NewsArticleBase(BaseModel):
    title: str
    content: Optional[str] = None
    summary: Optional[str] = None
    url: str
    source: str
    published_at: datetime
    disaster_keywords: Optional[str] = None
    location: Optional[str] = None

class NewsArticleCreate(NewsArticleBase):
    pass

class NewsArticleResponse(NewsArticleBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    created_at: datetime

class UserBase(BaseModel):
    email: str
    username: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_at: datetime

class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
    context: Optional[dict] = None

class DisasterFilter(BaseModel):
    type: Optional[str] = None
    severity: Optional[List[str]] = None
    status: Optional[List[str]] = None
    source: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    min_latitude: Optional[float] = None
    max_latitude: Optional[float] = None
    min_longitude: Optional[float] = None
    max_longitude: Optional[float] = None

class MapBounds(BaseModel):
    north: float
    south: float
    east: float
    west: float

class DisasterStats(BaseModel):
    total_disasters: int
    active_disasters: int
    by_type: dict
    by_severity: dict
    recent_count: int

from pydantic import BaseModel, EmailStr, Field, validator, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# Fix for Pydantic warning
class BaseSchema(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

# Enums
class AnalysisType(str, Enum):
    DESCRIPTIVE = "descriptive"
    CORRELATION = "correlation"
    TREND = "trend"
    PREDICTION = "prediction"
    CLUSTERING = "clustering"

class InsightType(str, Enum):
    AI_GENERATED = "ai_generated"
    PREDICTION = "prediction"
    RECOMMENDATION = "recommendation"
    PATTERN = "pattern"

class PriorityLevel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

# User schemas
class UserBase(BaseSchema):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=72)
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) > 72:
            raise ValueError('Password cannot be longer than 72 characters')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(char.islower() for char in v):
            raise ValueError('Password must contain at least one lowercase letter')
        return v

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Authentication schemas - FIXED VERSION
class LoginRequest(BaseSchema):
    email: EmailStr
    password: str = Field(..., max_length=72)

class Token(BaseSchema):
    access_token: str
    refresh_token: Optional[str] = Field(None)  # Explicitly set to None
    token_type: str = "bearer"
    expires_in: Optional[int] = None
    
    class Config:
        from_attributes = True
        extra = 'ignore'  # Ignore extra fields

class TokenData(BaseSchema):
    email: Optional[str] = None

class RefreshTokenRequest(BaseSchema):
    refresh_token: str

# Dataset schemas
class DatasetBase(BaseSchema):
    name: str
    description: Optional[str] = None

class DatasetCreate(DatasetBase):
    pass

class DatasetResponse(DatasetBase):
    id: int
    user_id: int
    file_size: int
    row_count: int
    column_count: int
    columns: List[str]
    file_metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    status: str
    analyses: Optional[List['AnalysisResponse']] = []
    
    class Config:
        from_attributes = True

# Analysis schemas
class AnalysisRequest(BaseSchema):
    dataset_id: int
    columns: Optional[List[str]] = None
    parameters: Optional[Dict[str, Any]] = {}

class CorrelationRequest(AnalysisRequest):
    method: str = "pearson"

class TrendAnalysisRequest(BaseSchema):
    dataset_id: int
    time_column: str
    value_column: str
    period: str = "daily"

class VisualizationRequest(BaseSchema):
    dataset_id: int
    chart_type: str
    column: Optional[str] = None
    x_column: Optional[str] = None
    y_column: Optional[str] = None
    bins: Optional[int] = 10

class AnalysisResponse(BaseSchema):
    id: int
    dataset_id: int
    analysis_type: str
    parameters: Optional[Dict[str, Any]] = None
    results: Dict[str, Any]
    status: str
    created_at: datetime
    execution_time: Optional[float] = None
    
    class Config:
        from_attributes = True

# Insight schemas
class InsightRequest(BaseSchema):
    dataset_id: int
    focus_areas: Optional[List[str]] = None
    business_context: Optional[str] = ""

class InsightResponse(BaseSchema):
    id: int
    dataset_id: int
    user_id: int
    insight_type: InsightType
    title: str
    content: Dict[str, Any]
    confidence_score: float
    priority: Optional[PriorityLevel] = None
    tags: Optional[List[str]] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Prediction schemas
class PredictionRequest(BaseSchema):
    dataset_id: int
    target_column: str
    features: Optional[List[str]] = None
    model_type: str = "regression"
    future_periods: int = 5

class PredictionResponse(BaseSchema):
    id: int
    predictions: Dict[str, Any]
    insights: Dict[str, Any]
    confidence_score: float
    created_at: datetime

# Recommendation schemas
class RecommendationRequest(BaseSchema):
    dataset_id: int
    business_goal: str
    constraints: Optional[List[str]] = None

class RecommendationResponse(BaseSchema):
    id: int
    title: str
    description: str
    impact: str
    effort: str
    timeframe: str
    confidence: float
    priority: PriorityLevel
    created_at: datetime

# Health check schema
class HealthResponse(BaseSchema):
    status: str
    service: str
    version: str
    timestamp: datetime
    dependencies: Dict[str, str]

# API response schemas
class APIResponse(BaseSchema):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    errors: Optional[List[str]] = None

class PaginatedResponse(BaseSchema):
    items: List[Any]
    total: int
    page: int
    size: int
    pages: int

# File upload schemas
class FileUploadResponse(BaseSchema):
    filename: str
    file_id: str
    file_size: int
    columns: List[str]
    row_count: int
    preview_data: List[Dict[str, Any]]

# Export schemas
class ExportRequest(BaseSchema):
    dataset_id: int
    format: str = "csv"
    include_analysis: bool = False

class ExportResponse(BaseSchema):
    export_id: str
    download_url: str
    expires_at: datetime

# Update forward references
DatasetResponse.update_forward_refs()
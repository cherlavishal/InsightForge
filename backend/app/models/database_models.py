from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships - defined after all classes are defined
    datasets = relationship("Dataset", back_populates="user", cascade="all, delete-orphan")
    insights = relationship("Insight", back_populates="user", cascade="all, delete-orphan")
    actions = relationship("UserAction", back_populates="user", cascade="all, delete-orphan")

class Dataset(Base):
    __tablename__ = "datasets"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)  # Size in bytes
    columns = Column(JSON, nullable=True)  # Store column names as JSON array
    row_count = Column(Integer, nullable=False)
    column_count = Column(Integer, nullable=False)
    file_metadata = Column(JSON, nullable=True)  # Changed from 'metadata' to 'file_metadata'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="datasets")
    analyses = relationship("Analysis", back_populates="dataset", cascade="all, delete-orphan")
    insights = relationship("Insight", back_populates="dataset", cascade="all, delete-orphan")

class Analysis(Base):
    __tablename__ = "analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=False)
    analysis_type = Column(String, nullable=False)  # e.g., 'descriptive', 'correlation'
    parameters = Column(JSON, nullable=True)  # Store analysis parameters
    results = Column(JSON, nullable=False)  # Store analysis results
    status = Column(String, default="pending")  # pending, processing, completed, failed
    error_message = Column(Text, nullable=True)
    execution_time = Column(Float, nullable=True)  # Execution time in seconds
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    dataset = relationship("Dataset", back_populates="analyses")

class Insight(Base):
    __tablename__ = "insights"
    
    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    insight_type = Column(String, nullable=False)  # e.g., 'ai_generated', 'prediction'
    title = Column(String, nullable=False)
    content = Column(JSON, nullable=False)  # Store insight content
    confidence_score = Column(Float, default=0.0)
    priority = Column(String, nullable=True)  # high, medium, low
    tags = Column(JSON, nullable=True)  # Store tags as JSON array
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    dataset = relationship("Dataset", back_populates="insights")
    user = relationship("User", back_populates="insights")
    actions = relationship("UserAction", back_populates="insight", cascade="all, delete-orphan")

class UserAction(Base):
    __tablename__ = "user_actions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    insight_id = Column(Integer, ForeignKey("insights.id"), nullable=True)
    recommendation_id = Column(Integer, nullable=True)  # If recommendations are separate
    action_type = Column(String, nullable=False)  # 'implement', 'schedule', 'dismiss', 'bookmark', 'like'
    status = Column(String, nullable=False)  # 'pending', 'completed', 'cancelled', 'active'
    scheduled_for = Column(DateTime(timezone=True), nullable=True)  # For scheduled actions
    completed_at = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    action_metadata = Column(JSON, nullable=True)  # Changed from 'metadata' to 'action_metadata'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="actions")
    insight = relationship("Insight", back_populates="actions")

class Cache(Base):
    __tablename__ = "cache"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True, nullable=False)
    value = Column(JSON, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
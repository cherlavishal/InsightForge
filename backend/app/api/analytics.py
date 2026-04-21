import json
import pandas as pd
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any, List
import logging

from app.database import get_db
from app.models.database_models import User, Dataset, Analysis
from app.models.schemas import (
    AnalysisRequest, AnalysisResponse, 
    CorrelationRequest, TrendAnalysisRequest,
    VisualizationRequest
)
from app.core.data_processor import DataProcessor
from app.services.analytics_service import AnalyticsService
from app.core.data_processor import clean_dict_for_json

# Import auth properly
from . import auth

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analytics", tags=["analytics"])

def safe_json_loads(data):
    """Safely parse JSON string or return as is if already dict"""
    if data is None:
        return {}
    if isinstance(data, dict):
        return data
    if isinstance(data, str):
        try:
            return json.loads(data)
        except json.JSONDecodeError:
            logger.error(f"Failed to parse JSON: {data[:100]}...")
            return {"error": "Failed to parse results", "raw": data[:200]}
    return {}

@router.post("/descriptive", response_model=AnalysisResponse)
async def descriptive_analysis(
    request: AnalysisRequest,
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Generate descriptive statistics for a dataset"""
    dataset = db.query(Dataset).filter(
        Dataset.id == request.dataset_id,
        Dataset.user_id == current_user.id
    ).first()
    
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    try:
        # Load data
        if dataset.file_path.endswith('.csv'):
            df = pd.read_csv(dataset.file_path)
        elif dataset.file_path.endswith('.json'):
            df = pd.read_json(dataset.file_path)
        else:
            df = pd.read_excel(dataset.file_path)
        
        # Process data
        processor = DataProcessor(df)
        service = AnalyticsService(processor)
        
        # Generate descriptive stats
        stats = service.descriptive_statistics(request.columns)
        
        # Clean stats for JSON serialization
        stats = clean_dict_for_json(stats)
        
        # Save analysis
        analysis = Analysis(
            dataset_id=dataset.id,
            analysis_type="descriptive",
            parameters=json.dumps({"columns": request.columns}),
            results=json.dumps(stats),
            status="completed"
        )
        
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        
        # Manually create response with parsed JSON
        response = AnalysisResponse(
            id=analysis.id,
            dataset_id=analysis.dataset_id,
            analysis_type=analysis.analysis_type,
            parameters=safe_json_loads(analysis.parameters),
            results=safe_json_loads(analysis.results),
            status=analysis.status,
            created_at=analysis.created_at,
            execution_time=analysis.execution_time
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.post("/correlation", response_model=AnalysisResponse)
async def correlation_analysis(
    request: CorrelationRequest,
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Calculate correlation matrix for specified columns"""
    dataset = db.query(Dataset).filter(
        Dataset.id == request.dataset_id,
        Dataset.user_id == current_user.id
    ).first()
    
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    try:
        # Load data
        if dataset.file_path.endswith('.csv'):
            df = pd.read_csv(dataset.file_path)
        elif dataset.file_path.endswith('.json'):
            df = pd.read_json(dataset.file_path)
        else:
            df = pd.read_excel(dataset.file_path)
        
        # Process data
        processor = DataProcessor(df)
        service = AnalyticsService(processor)
        
        # Calculate correlations
        correlations = service.correlation_analysis(request.columns, request.method)
        
        # Clean correlations for JSON serialization
        correlations = clean_dict_for_json(correlations)
        
        # Save analysis
        analysis = Analysis(
            dataset_id=dataset.id,
            analysis_type="correlation",
            parameters=json.dumps({
                "columns": request.columns,
                "method": request.method
            }),
            results=json.dumps(correlations),
            status="completed"
        )
        
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        
        # Manually create response with parsed JSON
        response = AnalysisResponse(
            id=analysis.id,
            dataset_id=analysis.dataset_id,
            analysis_type=analysis.analysis_type,
            parameters=safe_json_loads(analysis.parameters),
            results=safe_json_loads(analysis.results),
            status=analysis.status,
            created_at=analysis.created_at,
            execution_time=analysis.execution_time
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Correlation analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Correlation analysis failed: {str(e)}")

@router.post("/trend", response_model=AnalysisResponse)
async def trend_analysis(
    request: TrendAnalysisRequest,
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Perform trend analysis on time series data"""
    dataset = db.query(Dataset).filter(
        Dataset.id == request.dataset_id,
        Dataset.user_id == current_user.id
    ).first()
    
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    try:
        # Load data
        if dataset.file_path.endswith('.csv'):
            df = pd.read_csv(dataset.file_path)
        elif dataset.file_path.endswith('.json'):
            df = pd.read_json(dataset.file_path)
        else:
            df = pd.read_excel(dataset.file_path)
        
        # Process data
        processor = DataProcessor(df)
        service = AnalyticsService(processor)
        
        # Perform trend analysis
        trends = service.trend_analysis(
            time_column=request.time_column,
            value_column=request.value_column,
            period=request.period
        )
        
        # Clean trends for JSON serialization
        trends = clean_dict_for_json(trends)
        
        # Save analysis
        analysis = Analysis(
            dataset_id=dataset.id,
            analysis_type="trend",
            parameters=json.dumps(request.dict()),
            results=json.dumps(trends),
            status="completed"
        )
        
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        
        # Manually create response with parsed JSON
        response = AnalysisResponse(
            id=analysis.id,
            dataset_id=analysis.dataset_id,
            analysis_type=analysis.analysis_type,
            parameters=safe_json_loads(analysis.parameters),
            results=safe_json_loads(analysis.results),
            status=analysis.status,
            created_at=analysis.created_at,
            execution_time=analysis.execution_time
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Trend analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Trend analysis failed: {str(e)}")

@router.get("/analyses/{dataset_id}", response_model=List[AnalysisResponse])
async def get_dataset_analyses(
    dataset_id: int,
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Get all analyses for a dataset"""
    dataset = db.query(Dataset).filter(
        Dataset.id == dataset_id,
        Dataset.user_id == current_user.id
    ).first()
    
    if not dataset:
        # Return empty list instead of 404
        logger.info(f"Dataset {dataset_id} not found for user {current_user.id}, returning empty list")
        return []
    
    analyses = db.query(Analysis).filter(
        Analysis.dataset_id == dataset_id
    ).order_by(Analysis.created_at.desc()).all()
    
    response = []
    for analysis in analyses:
        try:
            response.append(AnalysisResponse(
                id=analysis.id,
                dataset_id=analysis.dataset_id,
                analysis_type=analysis.analysis_type,
                parameters=safe_json_loads(analysis.parameters),
                results=safe_json_loads(analysis.results),
                status=analysis.status,
                created_at=analysis.created_at,
                execution_time=analysis.execution_time
            ))
        except Exception as e:
            logger.error(f"Error parsing analysis {analysis.id}: {e}")
            # Skip corrupted analysis but continue
            continue
    
    return response
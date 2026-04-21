import os
import pandas as pd
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
import json
import logging
import traceback

from app.database import get_db
from app.models.database_models import User, Dataset, Analysis
from app.models.schemas import DatasetResponse, AnalysisResponse
from app.utils.file_handler import save_uploaded_file
from app.core.data_processor import DataProcessor, clean_dict_for_json

# Import auth properly
from . import auth

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/data", tags=["data"])
logger.info("Data router created with prefix: /data")

# Allowed extensions WITHOUT the dot
ALLOWED_EXTENSIONS = ["csv", "json", "xlsx", "xls"]

def validate_file_type(filename: str) -> bool:
    """Validate file extension"""
    ext = filename.split('.')[-1].lower() if '.' in filename else ''
    return ext in ALLOWED_EXTENSIONS

@router.post("/upload", response_model=DatasetResponse)
async def upload_dataset(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Upload and process a dataset file"""
    logger.info(f"Upload request from user {current_user.id}: {file.filename}")
    
    # Validate file type
    if not validate_file_type(file.filename):
        logger.warning(f"Invalid file type: {file.filename}")
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Save file
    file_id = str(uuid.uuid4())
    file_path = await save_uploaded_file(file, file_id)
    logger.info(f"File saved to: {file_path}")
    
    try:
        # Process file based on type
        ext = file.filename.split('.')[-1].lower()
        if ext == 'csv':
            df = pd.read_csv(file_path)
        elif ext == 'json':
            df = pd.read_json(file_path)
        elif ext in ['xlsx', 'xls']:
            df = pd.read_excel(file_path)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
        
        logger.info(f"Loaded {len(df)} rows, {len(df.columns)} columns")
        
        # Get dataset info
        dataset_info = {
            "row_count": len(df),
            "column_count": len(df.columns),
            "columns": df.columns.tolist(),
            "data_types": {col: str(dtype) for col, dtype in df.dtypes.items()},
            "sample_data": df.head(10).to_dict(orient='records')
        }
        
        # Clean dataset_info for JSON serialization
        dataset_info = clean_dict_for_json(dataset_info)
        
        # Save dataset metadata to database
        dataset = Dataset(
            user_id=current_user.id,
            name=file.filename,
            file_path=file_path,
            file_size=os.path.getsize(file_path),
            columns=json.dumps(dataset_info["columns"]),
            row_count=dataset_info["row_count"],
            column_count=dataset_info["column_count"],
            file_metadata=json.dumps(dataset_info)
        )
        
        db.add(dataset)
        db.commit()
        db.refresh(dataset)
        logger.info(f"Dataset saved to DB with ID: {dataset.id}")
        
        # Background task: Generate initial analysis
        background_tasks.add_task(
            generate_initial_analysis,
            dataset_id=dataset.id,
            df=df,
            db=db
        )
        
        # Return complete DatasetResponse with all required fields
        return DatasetResponse(
            id=dataset.id,
            name=dataset.name,
            description=dataset.description,
            user_id=dataset.user_id,
            file_size=dataset.file_size,
            row_count=dataset.row_count,
            column_count=dataset.column_count,
            columns=dataset_info["columns"],
            file_metadata=dataset_info,
            created_at=dataset.created_at,
            updated_at=dataset.updated_at,
            status="uploaded",
            analyses=[]
        )
        
    except Exception as e:
        # Clean up uploaded file on error
        if os.path.exists(file_path):
            os.remove(file_path)
        logger.error(f"Upload error: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

async def generate_initial_analysis(dataset_id: int, df: pd.DataFrame, db: Session):
    """Background task to generate initial analysis"""
    try:
        processor = DataProcessor(df)
        
        # Generate descriptive statistics
        stats = processor.get_descriptive_stats()
        
        # Check for missing values
        missing_info = processor.get_missing_values_info()
        
        # Detect data types
        data_types = processor.detect_data_types()
        
        # Get column summary
        column_summary = processor.get_column_summary()
        
        # Save analysis to database
        analysis = Analysis(
            dataset_id=dataset_id,
            analysis_type="initial",
            results=json.dumps({
                "descriptive_stats": stats,
                "missing_values": missing_info,
                "data_types": data_types,
                "column_summary": column_summary
            }),
            status="completed"
        )
        
        db.add(analysis)
        db.commit()
        logger.info(f"Initial analysis completed for dataset {dataset_id}")
        
    except Exception as e:
        logger.error(f"Error in background analysis for dataset {dataset_id}: {e}")
        logger.error(traceback.format_exc())

@router.get("/datasets", response_model=List[DatasetResponse])
async def list_datasets(
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """List all datasets for current user"""
    logger.info(f"Listing datasets for user {current_user.id}")
    
    datasets = db.query(Dataset).filter(Dataset.user_id == current_user.id).all()
    logger.info(f"Found {len(datasets)} datasets")
    
    response = []
    for dataset in datasets:
        try:
            # Check if file exists
            file_exists = os.path.exists(dataset.file_path) if dataset.file_path else False
            status = "file_missing" if not file_exists else ("processed" if dataset.analyses else "uploaded")
            
            # Get columns from database
            columns = json.loads(dataset.columns) if dataset.columns else []
            
            # Get file metadata
            file_metadata = json.loads(dataset.file_metadata) if dataset.file_metadata else None
            
            # Get analyses
            analyses_list = []
            for analysis in dataset.analyses:
                try:
                    analyses_list.append(AnalysisResponse(
                        id=analysis.id,
                        dataset_id=analysis.dataset_id,
                        analysis_type=analysis.analysis_type,
                        parameters=json.loads(analysis.parameters) if analysis.parameters else None,
                        results=json.loads(analysis.results) if analysis.results else {},
                        status=analysis.status,
                        created_at=analysis.created_at,
                        execution_time=analysis.execution_time
                    ))
                except:
                    # Skip if analysis can't be parsed
                    pass
            
            response.append(DatasetResponse(
                id=dataset.id,
                name=dataset.name,
                description=dataset.description,
                user_id=dataset.user_id,
                file_size=dataset.file_size,
                row_count=dataset.row_count,
                column_count=dataset.column_count,
                columns=columns,
                file_metadata=file_metadata,
                created_at=dataset.created_at,
                updated_at=dataset.updated_at,
                status=status,
                analyses=analyses_list
            ))
        except Exception as e:
            logger.error(f"Error processing dataset {dataset.id}: {e}")
            # Still return the dataset but with minimal info
            response.append(DatasetResponse(
                id=dataset.id,
                name=dataset.name,
                description=dataset.description,
                user_id=dataset.user_id,
                file_size=dataset.file_size,
                row_count=dataset.row_count,
                column_count=dataset.column_count,
                columns=json.loads(dataset.columns) if dataset.columns else [],
                file_metadata=None,
                created_at=dataset.created_at,
                updated_at=dataset.updated_at,
                status="error",
                analyses=[]
            ))
    
    return response

@router.get("/datasets/{dataset_id}", response_model=DatasetResponse)
async def get_dataset(
    dataset_id: int,
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific dataset by ID"""
    logger.info(f"Fetching dataset {dataset_id} for user {current_user.id}")
    
    dataset = db.query(Dataset).filter(
        Dataset.id == dataset_id,
        Dataset.user_id == current_user.id
    ).first()
    
    if not dataset:
        logger.warning(f"Dataset {dataset_id} not found for user {current_user.id}")
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    try:
        # Check if file exists
        file_exists = os.path.exists(dataset.file_path) if dataset.file_path else False
        status = "file_missing" if not file_exists else ("processed" if dataset.analyses else "uploaded")
        
        # Get columns from database
        columns = json.loads(dataset.columns) if dataset.columns else []
        
        # Get file metadata
        file_metadata = json.loads(dataset.file_metadata) if dataset.file_metadata else None
        
        # Get analyses
        analyses_list = []
        for analysis in dataset.analyses:
            try:
                analyses_list.append(AnalysisResponse(
                    id=analysis.id,
                    dataset_id=analysis.dataset_id,
                    analysis_type=analysis.analysis_type,
                    parameters=json.loads(analysis.parameters) if analysis.parameters else None,
                    results=json.loads(analysis.results) if analysis.results else {},
                    status=analysis.status,
                    created_at=analysis.created_at,
                    execution_time=analysis.execution_time
                ))
            except:
                pass
        
        logger.info(f"Successfully retrieved dataset {dataset_id}")
        return DatasetResponse(
            id=dataset.id,
            name=dataset.name,
            description=dataset.description,
            user_id=dataset.user_id,
            file_size=dataset.file_size,
            row_count=dataset.row_count,
            column_count=dataset.column_count,
            columns=columns,
            file_metadata=file_metadata,
            created_at=dataset.created_at,
            updated_at=dataset.updated_at,
            status=status,
            analyses=analyses_list
        )
    except Exception as e:
        logger.error(f"Error getting dataset {dataset_id}: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error retrieving dataset: {str(e)}")

@router.get("/datasets/{dataset_id}/preview")
async def preview_dataset(
    dataset_id: int,
    limit: Optional[int] = 10,
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Get a preview of the dataset (first N rows)"""
    logger.info(f"Preview requested for dataset {dataset_id} by user {current_user.id} (limit: {limit})")
    
    try:
        dataset = db.query(Dataset).filter(
            Dataset.id == dataset_id,
            Dataset.user_id == current_user.id
        ).first()
        
        if not dataset:
            logger.warning(f"Dataset {dataset_id} not found for user {current_user.id}")
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        logger.info(f"Dataset found: {dataset.name}, path: {dataset.file_path}")
        
        if not os.path.exists(dataset.file_path):
            logger.error(f"Dataset file not found at path: {dataset.file_path}")
            # Instead of 404, return empty preview with file_missing status
            return {
                "dataset_id": dataset_id,
                "total_rows": dataset.row_count,
                "columns": json.loads(dataset.columns) if dataset.columns else [],
                "preview": [],
                "limit": limit,
                "file_missing": True,
                "message": "The original file is missing. Please re-upload the dataset."
            }
        
        # Check file size
        file_size = os.path.getsize(dataset.file_path)
        logger.info(f"File size: {file_size} bytes")
        
        # Read file based on extension
        ext = dataset.name.split('.')[-1].lower()
        logger.info(f"File extension: {ext}")
        
        try:
            if ext == 'csv':
                df = pd.read_csv(dataset.file_path, nrows=limit)
                logger.info(f"Read {len(df)} rows from CSV")
            elif ext == 'json':
                df = pd.read_json(dataset.file_path)
                df = df.head(limit)
                logger.info(f"Read {len(df)} rows from JSON")
            elif ext in ['xlsx', 'xls']:
                df = pd.read_excel(dataset.file_path, nrows=limit)
                logger.info(f"Read {len(df)} rows from Excel")
            else:
                logger.error(f"Unsupported file format: {ext}")
                raise HTTPException(status_code=400, detail=f"Unsupported file format: {ext}")
        except pd.errors.EmptyDataError:
            logger.error(f"Empty file: {dataset.file_path}")
            return {
                "dataset_id": dataset_id,
                "total_rows": 0,
                "columns": [],
                "preview": [],
                "limit": limit,
                "empty": True,
                "message": "The dataset file is empty."
            }
        except Exception as e:
            logger.error(f"Error reading file: {str(e)}")
            logger.error(traceback.format_exc())
            raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")
        
        # Convert to dict for JSON response
        preview_data = df.to_dict(orient='records')
        
        # Clean any problematic values
        cleaned_preview = clean_dict_for_json(preview_data)
        
        response = {
            "dataset_id": dataset_id,
            "total_rows": dataset.row_count,
            "columns": [str(col) for col in df.columns.tolist()],
            "preview": cleaned_preview,
            "limit": limit
        }
        
        logger.info(f"Preview generated successfully for dataset {dataset_id}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in preview for dataset {dataset_id}: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error generating preview: {str(e)}")

@router.get("/datasets/{dataset_id}/download")
async def download_dataset(
    dataset_id: int,
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Download the original dataset file"""
    logger.info(f"Download requested for dataset {dataset_id} by user {current_user.id}")
    
    try:
        dataset = db.query(Dataset).filter(
            Dataset.id == dataset_id,
            Dataset.user_id == current_user.id
        ).first()
        
        if not dataset:
            logger.warning(f"Dataset {dataset_id} not found for user {current_user.id}")
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        logger.info(f"Dataset found: {dataset.name}, path: {dataset.file_path}")
        
        if not os.path.exists(dataset.file_path):
            logger.error(f"Dataset file not found at path: {dataset.file_path}")
            raise HTTPException(status_code=404, detail="Dataset file not found. The file may have been deleted.")
        
        file_size = os.path.getsize(dataset.file_path)
        logger.info(f"File size: {file_size} bytes")
        
        return FileResponse(
            path=dataset.file_path,
            filename=dataset.name,
            media_type='application/octet-stream'
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in download for dataset {dataset_id}: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error downloading dataset: {str(e)}")

@router.get("/datasets/{dataset_id}/info")
async def dataset_info(
    dataset_id: int,
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed information about the dataset"""
    logger.info(f"Info requested for dataset {dataset_id} by user {current_user.id}")
    
    dataset = db.query(Dataset).filter(
        Dataset.id == dataset_id,
        Dataset.user_id == current_user.id
    ).first()
    
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    file_exists = os.path.exists(dataset.file_path) if dataset.file_path else False
    
    response = {
        "dataset_id": dataset.id,
        "name": dataset.name,
        "file_size": dataset.file_size,
        "file_size_mb": round(dataset.file_size / (1024 * 1024), 2) if dataset.file_size else 0,
        "row_count": dataset.row_count,
        "column_count": dataset.column_count,
        "columns": json.loads(dataset.columns) if dataset.columns else [],
        "created_at": dataset.created_at.isoformat() if dataset.created_at else None,
        "updated_at": dataset.updated_at.isoformat() if dataset.updated_at else None,
        "file_exists": file_exists,
        "file_path": dataset.file_path if file_exists else None
    }
    
    # If file exists, get additional info
    if file_exists:
        try:
            file_stats = os.stat(dataset.file_path)
            response["file_info"] = {
                "created": file_stats.st_ctime,
                "modified": file_stats.st_mtime,
                "size_bytes": file_stats.st_size
            }
            
            # Read file info for data types
            ext = dataset.name.split('.')[-1].lower()
            if ext == 'csv':
                df = pd.read_csv(dataset.file_path, nrows=100)
            elif ext == 'json':
                df = pd.read_json(dataset.file_path)
                df = df.head(100)
            elif ext in ['xlsx', 'xls']:
                df = pd.read_excel(dataset.file_path, nrows=100)
            else:
                df = None
            
            if df is not None:
                response["data_types"] = {str(col): str(dtype) for col, dtype in df.dtypes.items()}
                response["missing_values"] = {str(col): int(df[col].isnull().sum()) for col in df.columns}
        except Exception as e:
            logger.error(f"Error reading file info: {e}")
            response["file_info_error"] = str(e)
    
    logger.info(f"Info generated successfully for dataset {dataset_id}")
    return response

@router.delete("/datasets/{dataset_id}")
async def delete_dataset(
    dataset_id: int,
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a dataset"""
    logger.info(f"Delete requested for dataset {dataset_id} by user {current_user.id}")
    
    dataset = db.query(Dataset).filter(
        Dataset.id == dataset_id,
        Dataset.user_id == current_user.id
    ).first()
    
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    # Delete file from storage if it exists
    if dataset.file_path and os.path.exists(dataset.file_path):
        os.remove(dataset.file_path)
        logger.info(f"Deleted file: {dataset.file_path}")
    
    # Delete from database
    db.delete(dataset)
    db.commit()
    
    logger.info(f"Dataset {dataset_id} deleted successfully")
    return {"message": "Dataset deleted successfully"}
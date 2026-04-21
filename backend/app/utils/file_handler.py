import os
import shutil
import uuid
import pandas as pd
import numpy as np
from typing import Dict, Any, Optional, List
from fastapi import UploadFile
import aiofiles
import json
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# Directory constants
UPLOAD_DIR = "./uploads"
EXPORT_DIR = "./exports"
ANALYSIS_DIR = "./analysis_results"
BACKUP_DIR = "./backups"

# Create directories if they don't exist
for directory in [UPLOAD_DIR, EXPORT_DIR, ANALYSIS_DIR, BACKUP_DIR]:
    os.makedirs(directory, exist_ok=True)

async def save_uploaded_file(file: UploadFile, file_id: Optional[str] = None) -> str:
    """
    Save uploaded file to disk and return file path
    """
    if file_id is None:
        file_id = str(uuid.uuid4())
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    filename = f"{file_id}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    # Save file asynchronously
    try:
        async with aiofiles.open(file_path, 'wb') as out_file:
            content = await file.read()
            await out_file.write(content)
        
        file_size = len(content)
        logger.info(f"File saved: {file_path} (size: {file_size} bytes)")
        return file_path
    except Exception as e:
        logger.error(f"Error saving file {file.filename}: {e}")
        raise

async def read_file_to_dataframe(file_path: str) -> pd.DataFrame:
    """
    Read file and convert to pandas DataFrame based on file extension
    """
    file_extension = os.path.splitext(file_path)[1].lower()
    
    try:
        if file_extension == '.csv':
            df = pd.read_csv(file_path)
        elif file_extension == '.json':
            df = pd.read_json(file_path)
        elif file_extension in ['.xlsx', '.xls']:
            df = pd.read_excel(file_path)
        elif file_extension == '.parquet':
            df = pd.read_parquet(file_path)
        elif file_extension == '.feather':
            df = pd.read_feather(file_path)
        elif file_extension == '.pkl' or file_extension == '.pickle':
            df = pd.read_pickle(file_path)
        else:
            raise ValueError(f"Unsupported file format: {file_extension}")
        
        logger.info(f"Successfully read {file_path} with {len(df)} rows and {len(df.columns)} columns")
        return df
        
    except Exception as e:
        logger.error(f"Error reading file {file_path}: {e}")
        raise

def validate_file_type(filename: str, allowed_extensions: List[str]) -> bool:
    """
    Validate if file extension is allowed
    """
    file_extension = os.path.splitext(filename)[1].lower()
    # Remove dot from extension if it exists in allowed list
    if file_extension.startswith('.'):
        extension_without_dot = file_extension[1:]
        return extension_without_dot in allowed_extensions
    return file_extension in allowed_extensions

def get_file_info(file_path: str) -> Dict[str, Any]:
    """
    Get information about a file
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    
    stats = os.stat(file_path)
    
    return {
        "filename": os.path.basename(file_path),
        "file_path": file_path,
        "file_size": stats.st_size,
        "created_at": datetime.fromtimestamp(stats.st_ctime).isoformat(),
        "modified_at": datetime.fromtimestamp(stats.st_mtime).isoformat(),
        "file_extension": os.path.splitext(file_path)[1].lower()
    }

def cleanup_old_files(directory: str, max_age_days: int = 7, pattern: Optional[str] = None):
    """
    Clean up files older than specified days
    """
    if not os.path.exists(directory):
        return
    
    current_time = datetime.now()
    deleted_count = 0
    
    for filename in os.listdir(directory):
        # Apply pattern filter if provided
        if pattern and pattern not in filename:
            continue
            
        file_path = os.path.join(directory, filename)
        if os.path.isfile(file_path):
            file_age = current_time - datetime.fromtimestamp(os.path.getctime(file_path))
            if file_age.days > max_age_days:
                try:
                    os.remove(file_path)
                    deleted_count += 1
                    logger.info(f"Cleaned up old file: {file_path}")
                except Exception as e:
                    logger.error(f"Error cleaning up file {file_path}: {e}")
    
    logger.info(f"Cleanup complete: {deleted_count} files deleted from {directory}")

async def save_analysis_results(results: Dict[str, Any], file_id: str) -> str:
    """
    Save analysis results to JSON file
    """
    filename = f"analysis_{file_id}.json"
    file_path = os.path.join(ANALYSIS_DIR, filename)
    
    async with aiofiles.open(file_path, 'w') as f:
        await f.write(json.dumps(results, indent=2, default=str))
    
    logger.info(f"Analysis results saved: {file_path}")
    return file_path

async def read_analysis_results(file_id: str) -> Dict[str, Any]:
    """
    Read analysis results from JSON file
    """
    filename = f"analysis_{file_id}.json"
    file_path = os.path.join(ANALYSIS_DIR, filename)
    
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Analysis results not found: {file_id}")
    
    async with aiofiles.open(file_path, 'r') as f:
        content = await f.read()
        return json.loads(content)

def export_dataframe_to_csv(df: pd.DataFrame, filename: str) -> str:
    """
    Export DataFrame to CSV file
    """
    if not filename.endswith('.csv'):
        filename += '.csv'
    
    file_path = os.path.join(EXPORT_DIR, filename)
    df.to_csv(file_path, index=False)
    
    logger.info(f"CSV export saved: {file_path}")
    return file_path

def export_dataframe_to_json(df: pd.DataFrame, filename: str) -> str:
    """
    Export DataFrame to JSON file
    """
    if not filename.endswith('.json'):
        filename += '.json'
    
    file_path = os.path.join(EXPORT_DIR, filename)
    df.to_json(file_path, orient='records', indent=2)
    
    logger.info(f"JSON export saved: {file_path}")
    return file_path

def export_dataframe_to_excel(df: pd.DataFrame, filename: str, sheet_name: str = "Sheet1") -> str:
    """
    Export DataFrame to Excel file
    """
    if not filename.endswith('.xlsx'):
        filename += '.xlsx'
    
    file_path = os.path.join(EXPORT_DIR, filename)
    
    # Use openpyxl engine for .xlsx files
    with pd.ExcelWriter(file_path, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name=sheet_name, index=False)
    
    logger.info(f"Excel export saved: {file_path}")
    return file_path

def get_export_file_path(export_id: str, format: str = 'csv') -> str:
    """
    Get file path for export
    """
    filename = f"export_{export_id}.{format}"
    return os.path.join(EXPORT_DIR, filename)

def cleanup_export_file(file_path: str):
    """
    Clean up export file after download
    """
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"Cleaned up export file: {file_path}")
    except Exception as e:
        logger.error(f"Error cleaning up export file {file_path}: {e}")

def get_file_preview(file_path: str, rows: int = 10) -> Dict[str, Any]:
    """
    Get preview of file content
    """
    try:
        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
        elif file_path.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(file_path)
        elif file_path.endswith('.json'):
            df = pd.read_json(file_path)
        else:
            return {"error": "Unsupported file format for preview"}
        
        # Get column data types
        dtypes = {}
        for col, dtype in df.dtypes.items():
            dtypes[col] = str(dtype)
        
        # Get basic statistics for numeric columns
        numeric_stats = {}
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            numeric_stats[col] = {
                "min": float(df[col].min()) if not df[col].isna().all() else None,
                "max": float(df[col].max()) if not df[col].isna().all() else None,
                "mean": float(df[col].mean()) if not df[col].isna().all() else None
            }
        
        return {
            "total_rows": len(df),
            "total_columns": len(df.columns),
            "preview": df.head(rows).to_dict(orient='records'),
            "columns": df.columns.tolist(),
            "dtypes": dtypes,
            "numeric_summary": numeric_stats,
            "missing_values": df.isnull().sum().to_dict()
        }
    except Exception as e:
        logger.error(f"Error getting file preview for {file_path}: {e}")
        return {"error": str(e)}

def backup_file(file_path: str, backup_dir: Optional[str] = None) -> str:
    """
    Create backup of a file
    """
    if backup_dir is None:
        backup_dir = BACKUP_DIR
    
    os.makedirs(backup_dir, exist_ok=True)
    
    filename = os.path.basename(file_path)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    name, ext = os.path.splitext(filename)
    backup_filename = f"{name}_{timestamp}{ext}"
    backup_path = os.path.join(backup_dir, backup_filename)
    
    shutil.copy2(file_path, backup_path)
    logger.info(f"Backup created: {backup_path}")
    
    return backup_path

def compress_file(file_path: str, remove_original: bool = False) -> str:
    """
    Compress file using gzip
    """
    import gzip
    
    compressed_path = f"{file_path}.gz"
    
    try:
        with open(file_path, 'rb') as f_in:
            with gzip.open(compressed_path, 'wb') as f_out:
                shutil.copyfileobj(f_in, f_out)
        
        original_size = os.path.getsize(file_path)
        compressed_size = os.path.getsize(compressed_path)
        ratio = (1 - compressed_size / original_size) * 100
        
        logger.info(f"File compressed: {compressed_path} (compression ratio: {ratio:.1f}%)")
        
        if remove_original:
            os.remove(file_path)
            logger.info(f"Original file removed: {file_path}")
        
        return compressed_path
    except Exception as e:
        logger.error(f"Error compressing file {file_path}: {e}")
        raise

def decompress_file(compressed_path: str, remove_compressed: bool = False) -> str:
    """
    Decompress gzipped file
    """
    import gzip
    
    if not compressed_path.endswith('.gz'):
        raise ValueError("File is not gzipped")
    
    decompressed_path = compressed_path[:-3]  # Remove .gz extension
    
    try:
        with gzip.open(compressed_path, 'rb') as f_in:
            with open(decompressed_path, 'wb') as f_out:
                shutil.copyfileobj(f_in, f_out)
        
        logger.info(f"File decompressed: {decompressed_path}")
        
        if remove_compressed:
            os.remove(compressed_path)
            logger.info(f"Compressed file removed: {compressed_path}")
        
        return decompressed_path
    except Exception as e:
        logger.error(f"Error decompressing file {compressed_path}: {e}")
        raise

def generate_unique_filename(original_filename: str, prefix: str = "") -> str:
    """
    Generate a unique filename while preserving extension
    """
    name, ext = os.path.splitext(original_filename)
    unique_id = str(uuid.uuid4())[:8]
    
    if prefix:
        return f"{prefix}_{unique_id}_{name}{ext}"
    return f"{unique_id}_{name}{ext}"

def ensure_directory_exists(directory: str) -> str:
    """
    Ensure a directory exists, create if it doesn't
    """
    os.makedirs(directory, exist_ok=True)
    return directory

def get_file_size_str(file_path: str) -> str:
    """
    Get human-readable file size
    """
    size_bytes = os.path.getsize(file_path)
    
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024.0
    
    return f"{size_bytes:.1f} TB"
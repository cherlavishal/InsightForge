import pandas as pd
import numpy as np
from typing import Dict, List, Any, Tuple
import re

def validate_csv_data(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Validate CSV data and return validation results
    """
    validation_result = {
        "valid": True,
        "errors": [],
        "warnings": [],
        "stats": {},
        "suggestions": []
    }
    
    # Check if dataframe is empty
    if df.empty:
        validation_result["valid"] = False
        validation_result["errors"].append("DataFrame is empty")
        return validation_result
    
    # Check number of rows
    row_count = len(df)
    validation_result["stats"]["row_count"] = row_count
    
    if row_count < 10:
        validation_result["warnings"].append(f"Small dataset: only {row_count} rows")
    
    # Check number of columns
    column_count = len(df.columns)
    validation_result["stats"]["column_count"] = column_count
    
    if column_count > 50:
        validation_result["warnings"].append(f"Large number of columns: {column_count}. Consider feature selection.")
    
    # Check for duplicate column names
    duplicate_columns = df.columns[df.columns.duplicated()].tolist()
    if duplicate_columns:
        validation_result["valid"] = False
        validation_result["errors"].append(f"Duplicate column names: {duplicate_columns}")
    
    # Check column names for special characters
    invalid_chars_pattern = r'[^a-zA-Z0-9_]'
    problematic_columns = []
    
    for col in df.columns:
        if re.search(invalid_chars_pattern, str(col)):
            problematic_columns.append(col)
    
    if problematic_columns:
        validation_result["warnings"].append(
            f"Column names contain special characters: {problematic_columns}. "
            "Consider renaming for better compatibility."
        )
    
    # Check data types
    dtype_summary = {}
    for col in df.columns:
        dtype = str(df[col].dtype)
        dtype_summary[col] = dtype
        
        # Check for object dtype with mixed types
        if dtype == 'object':
            sample = df[col].dropna().head(100)
            type_counts = {}
            for val in sample:
                try:
                    float(val)
                    type_counts.setdefault('numeric', 0)
                    type_counts['numeric'] += 1
                except:
                    type_counts.setdefault('text', 0)
                    type_counts['text'] += 1
            
            if len(type_counts) > 1:
                validation_result["warnings"].append(
                    f"Column '{col}' appears to have mixed data types"
                )
    
    validation_result["stats"]["dtype_summary"] = dtype_summary
    
    # Check for missing values
    missing_by_column = df.isnull().sum()
    total_missing = missing_by_column.sum()
    missing_percentage = (total_missing / np.prod(df.shape)) * 100
    
    validation_result["stats"]["missing_values"] = {
        "total_missing": int(total_missing),
        "missing_percentage": float(missing_percentage),
        "missing_by_column": missing_by_column[missing_by_column > 0].to_dict()
    }
    
    if missing_percentage > 50:
        validation_result["warnings"].append(
            f"High percentage of missing values: {missing_percentage:.1f}%"
        )
    
    # Check for duplicate rows
    duplicate_rows = df.duplicated().sum()
    if duplicate_rows > 0:
        duplicate_percentage = (duplicate_rows / row_count) * 100
        validation_result["stats"]["duplicate_rows"] = {
            "count": int(duplicate_rows),
            "percentage": float(duplicate_percentage)
        }
        
        if duplicate_percentage > 10:
            validation_result["warnings"].append(
                f"High percentage of duplicate rows: {duplicate_percentage:.1f}%"
            )
    
    # Check numeric columns for outliers and invalid values
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    
    for col in numeric_cols:
        # Check for infinite values
        infinite_count = np.isinf(df[col]).sum()
        if infinite_count > 0:
            validation_result["errors"].append(
                f"Column '{col}' contains {infinite_count} infinite values"
            )
        
        # Check for extreme outliers (beyond 5 standard deviations)
        mean = df[col].mean()
        std = df[col].std()
        if std > 0:
            extreme_outliers = ((df[col] - mean).abs() > 5 * std).sum()
            if extreme_outliers > 0:
                validation_result["warnings"].append(
                    f"Column '{col}' has {extreme_outliers} extreme outliers"
                )
    
    # Generate suggestions
    if total_missing > 0:
        validation_result["suggestions"].append("Consider handling missing values through imputation or removal")
    
    if duplicate_rows > 0:
        validation_result["suggestions"].append("Consider removing duplicate rows")
    
    if len(numeric_cols) == 0:
        validation_result["suggestions"].append("No numeric columns found. Consider converting relevant columns to numeric types")
    
    # Update valid status based on errors
    if validation_result["errors"]:
        validation_result["valid"] = False
    
    return validation_result

def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def validate_password(password: str) -> Tuple[bool, List[str]]:
    """Validate password strength"""
    errors = []
    
    if len(password) < 8:
        errors.append("Password must be at least 8 characters long")
    
    if not any(char.isdigit() for char in password):
        errors.append("Password must contain at least one digit")
    
    if not any(char.isupper() for char in password):
        errors.append("Password must contain at least one uppercase letter")
    
    if not any(char.islower() for char in password):
        errors.append("Password must contain at least one lowercase letter")
    
    if not any(char in '!@#$%^&*()_+-=[]{}|;:,.<>?' for char in password):
        errors.append("Password must contain at least one special character")
    
    return len(errors) == 0, errors

def validate_file_extension(filename: str, allowed_extensions: List[str]) -> bool:
    """Validate file extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

def sanitize_column_name(name: str) -> str:
    """Sanitize column name for safe use in SQL and Python"""
    # Remove special characters and replace spaces with underscores
    sanitized = re.sub(r'[^a-zA-Z0-9_]', '_', str(name))
    # Remove leading numbers
    sanitized = re.sub(r'^\d+', '', sanitized)
    # Ensure it starts with a letter or underscore
    if not sanitized or sanitized[0].isdigit():
        sanitized = '_' + sanitized
    return sanitized.lower()

def validate_numeric_range(value: float, min_val: float = None, max_val: float = None) -> bool:
    """Validate if a numeric value is within specified range"""
    if min_val is not None and value < min_val:
        return False
    if max_val is not None and value > max_val:
        return False
    return True

def validate_date_format(date_str: str, format: str = "%Y-%m-%d") -> bool:
    """Validate date string format"""
    try:
        from datetime import datetime
        datetime.strptime(date_str, format)
        return True
    except ValueError:
        return False
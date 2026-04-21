import pandas as pd
import numpy as np
from typing import Dict, List, Any, Tuple, Optional, Union
import json
import logging
from datetime import datetime
import math

logger = logging.getLogger(__name__)

def safe_float_conversion(value: Any) -> Union[float, int, None]:
    """Convert numpy float values to Python float, handling NaN and inf"""
    if value is None:
        return None
    if pd.isna(value):
        return None
    if isinstance(value, (np.float16, np.float32, np.float64, float)):
        if math.isinf(value) or math.isnan(value):
            return None
        # Check for extremely large values that might cause JSON issues
        if abs(value) > 1e308:
            return None
        return float(value)
    if isinstance(value, (np.int16, np.int32, np.int64, int)):
        # Check for integer overflow
        if abs(value) > 2**63 - 1:
            return None
        return int(value)
    return value

def clean_dict_for_json(obj: Any) -> Any:
    """Recursively clean dictionary for JSON serialization"""
    if obj is None:
        return None
    if isinstance(obj, dict):
        cleaned = {}
        for k, v in obj.items():
            # Convert key to string if it's not
            key = str(k) if not isinstance(k, (str, int, float, bool)) else k
            cleaned[key] = clean_dict_for_json(v)
        return cleaned
    elif isinstance(obj, (list, tuple)):
        return [clean_dict_for_json(item) for item in obj]
    elif isinstance(obj, (np.float16, np.float32, np.float64, float)):
        if math.isinf(obj) or math.isnan(obj):
            return None
        if abs(obj) > 1e308:
            return None
        return float(obj)
    elif isinstance(obj, (np.int16, np.int32, np.int64, int)):
        if abs(obj) > 2**63 - 1:
            return None
        return int(obj)
    elif pd.isna(obj):
        return None
    elif isinstance(obj, (pd.Timestamp, datetime)):
        return obj.isoformat() if not pd.isna(obj) else None
    elif isinstance(obj, np.ndarray):
        return clean_dict_for_json(obj.tolist())
    elif hasattr(obj, 'item'):  # Handle numpy scalars
        try:
            return obj.item()
        except:
            return str(obj)
    else:
        # Try to convert to string if all else fails
        try:
            json.dumps(obj)
            return obj
        except (TypeError, OverflowError, ValueError):
            return str(obj)

class DataProcessor:
    def __init__(self, df: pd.DataFrame):
        self.df = df.copy()
        self.original_shape = df.shape
        self.processed = False
        
    def clean_data(self) -> Dict[str, Any]:
        """Clean the dataset and return cleaning report"""
        report = {
            "original_shape": self.original_shape,
            "cleaning_steps": [],
            "issues_found": [],
            "issues_fixed": []
        }
        
        # Remove duplicate rows
        duplicates = self.df.duplicated().sum()
        if duplicates > 0:
            self.df = self.df.drop_duplicates()
            report["cleaning_steps"].append(f"Removed {duplicates} duplicate rows")
            report["issues_fixed"].append(f"duplicates:{duplicates}")
        
        # Handle missing values
        missing_before = self.df.isnull().sum().sum()
        if missing_before > 0:
            # For numeric columns, fill with median
            numeric_cols = self.df.select_dtypes(include=[np.number]).columns
            for col in numeric_cols:
                if self.df[col].isnull().sum() > 0:
                    median_val = self.df[col].median()
                    if pd.isna(median_val):
                        median_val = 0
                    self.df[col].fillna(median_val, inplace=True)
            
            # For categorical columns, fill with mode
            categorical_cols = self.df.select_dtypes(include=['object']).columns
            for col in categorical_cols:
                if self.df[col].isnull().sum() > 0:
                    mode_val = self.df[col].mode()[0] if not self.df[col].mode().empty else "Unknown"
                    self.df[col].fillna(mode_val, inplace=True)
            
            missing_after = self.df.isnull().sum().sum()
            report["cleaning_steps"].append(f"Handled {missing_before} missing values")
            report["issues_fixed"].append(f"missing_values:{missing_before}")
        
        # Convert date columns
        date_columns = []
        for col in self.df.columns:
            if 'date' in col.lower() or 'time' in col.lower():
                try:
                    self.df[col] = pd.to_datetime(self.df[col])
                    date_columns.append(col)
                except:
                    pass
        
        if date_columns:
            report["cleaning_steps"].append(f"Converted {len(date_columns)} columns to datetime")
        
        # Handle outliers for numeric columns (using IQR method)
        outlier_report = self._handle_outliers()
        if outlier_report["outliers_found"] > 0:
            report["cleaning_steps"].append(outlier_report["message"])
            report["issues_fixed"].append(f"outliers:{outlier_report['outliers_found']}")
        
        self.processed = True
        report["final_shape"] = self.df.shape
        report["rows_removed"] = report["original_shape"][0] - report["final_shape"][0]
        report["columns_removed"] = report["original_shape"][1] - report["final_shape"][1]
        
        return clean_dict_for_json(report)
    
    def _handle_outliers(self) -> Dict[str, Any]:
        """Handle outliers using IQR method"""
        report = {
            "outliers_found": 0,
            "columns_affected": [],
            "message": ""
        }
        
        numeric_cols = self.df.select_dtypes(include=[np.number]).columns
        outliers_per_col = {}
        
        for col in numeric_cols:
            # Skip if all values are NaN
            if self.df[col].isnull().all():
                continue
                
            Q1 = self.df[col].quantile(0.25)
            Q3 = self.df[col].quantile(0.75)
            IQR = Q3 - Q1
            
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            # Handle NaN bounds
            if pd.isna(lower_bound):
                lower_bound = self.df[col].min()
            if pd.isna(upper_bound):
                upper_bound = self.df[col].max()
            
            # Handle infinite bounds
            if math.isinf(lower_bound) or math.isinf(upper_bound):
                continue
            
            outliers = self.df[(self.df[col] < lower_bound) | (self.df[col] > upper_bound)]
            outlier_count = len(outliers)
            
            if outlier_count > 0:
                outliers_per_col[col] = outlier_count
                # Cap outliers instead of removing rows
                self.df[col] = np.where(self.df[col] < lower_bound, lower_bound, self.df[col])
                self.df[col] = np.where(self.df[col] > upper_bound, upper_bound, self.df[col])
        
        if outliers_per_col:
            report["outliers_found"] = sum(outliers_per_col.values())
            report["columns_affected"] = list(outliers_per_col.keys())
            report["message"] = f"Capped outliers in {len(outliers_per_col)} columns"
        
        return clean_dict_for_json(report)
    
    def get_descriptive_stats(self) -> Dict[str, Any]:
        """Get descriptive statistics for the dataset"""
        stats = {
            "dataset_info": {
                "total_rows": int(len(self.df)),
                "total_columns": int(len(self.df.columns)),
                "memory_usage": float(self.df.memory_usage(deep=True).sum() / 1024 / 1024) if len(self.df) > 0 else 0,
                "column_names": [str(col) for col in self.df.columns.tolist()]
            },
            "numeric_summary": {},
            "categorical_summary": {},
            "missing_values": {}
        }
        
        # Numeric columns summary
        numeric_cols = self.df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            # Skip if all values are NaN
            if self.df[col].isnull().all():
                continue
                
            stats["numeric_summary"][str(col)] = {
                "count": int(self.df[col].count()),
                "mean": safe_float_conversion(self.df[col].mean()),
                "std": safe_float_conversion(self.df[col].std()),
                "min": safe_float_conversion(self.df[col].min()),
                "25%": safe_float_conversion(self.df[col].quantile(0.25)),
                "50%": safe_float_conversion(self.df[col].quantile(0.5)),
                "75%": safe_float_conversion(self.df[col].quantile(0.75)),
                "max": safe_float_conversion(self.df[col].max()),
                "skewness": safe_float_conversion(self.df[col].skew()),
                "kurtosis": safe_float_conversion(self.df[col].kurtosis())
            }
        
        # Categorical columns summary
        categorical_cols = self.df.select_dtypes(include=['object']).columns
        for col in categorical_cols:
            value_counts = self.df[col].value_counts()
            stats["categorical_summary"][str(col)] = {
                "unique_values": int(self.df[col].nunique()),
                "most_common": {str(k): int(v) for k, v in value_counts.head(5).to_dict().items()},
                "missing_count": int(self.df[col].isnull().sum())
            }
        
        # Missing values
        missing = self.df.isnull().sum()
        stats["missing_values"] = {
            "total_missing": int(missing.sum()),
            "missing_by_column": {str(k): int(v) for k, v in missing[missing > 0].to_dict().items()},
            "missing_percentage": float((missing.sum() / max(np.prod(self.df.shape), 1)) * 100) if np.prod(self.df.shape) > 0 else 0
        }
        
        return clean_dict_for_json(stats)
    
    def get_missing_values_info(self) -> Dict[str, Any]:
        """Get detailed missing values information"""
        missing = self.df.isnull().sum()
        missing_percentage = (missing / len(self.df)) * 100 if len(self.df) > 0 else 0
        
        return {
            "total_missing": int(missing.sum()),
            "missing_by_column": {str(k): int(v) for k, v in missing[missing > 0].to_dict().items()},
            "missing_percentage_by_column": {str(k): float(v) for k, v in missing_percentage[missing_percentage > 0].to_dict().items()},
            "columns_with_missing": [str(col) for col in missing[missing > 0].index.tolist()],
            "suggested_actions": self._suggest_missing_value_actions(missing_percentage)
        }
    
    def _suggest_missing_value_actions(self, missing_percentage: pd.Series) -> List[str]:
        """Suggest actions for handling missing values"""
        suggestions = []
        
        for col, percentage in missing_percentage.items():
            if percentage > 0:
                if percentage < 5:
                    suggestions.append(f"Column '{col}': {percentage:.2f}% missing - Consider removing rows")
                elif percentage < 30:
                    suggestions.append(f"Column '{col}': {percentage:.2f}% missing - Consider imputation")
                else:
                    suggestions.append(f"Column '{col}': {percentage:.2f}% missing - Consider removing column")
        
        return suggestions
    
    def detect_data_types(self) -> Dict[str, str]:
        """Detect and classify data types"""
        type_mapping = {}
        
        for col in self.df.columns:
            dtype = str(self.df[col].dtype)
            col_str = str(col)
            
            # Classify based on dtype and sample data
            if 'int' in dtype or 'float' in dtype:
                type_mapping[col_str] = 'numeric'
            elif 'object' in dtype:
                # Check if it's actually a date
                try:
                    pd.to_datetime(self.df[col].head(100), errors='raise')
                    type_mapping[col_str] = 'datetime'
                except:
                    # Check if it's categorical (limited unique values)
                    unique_ratio = self.df[col].nunique() / len(self.df) if len(self.df) > 0 else 0
                    if unique_ratio < 0.5:  # Less than 50% unique values
                        type_mapping[col_str] = 'categorical'
                    else:
                        type_mapping[col_str] = 'text'
            elif 'datetime' in dtype:
                type_mapping[col_str] = 'datetime'
            elif 'bool' in dtype:
                type_mapping[col_str] = 'boolean'
            else:
                type_mapping[col_str] = 'unknown'
        
        return type_mapping
    
    def get_column_summary(self) -> Dict[str, Any]:
        """Get detailed column-by-column summary"""
        summary = {}
        data_types = self.detect_data_types()
        
        for col in self.df.columns:
            col_str = str(col)
            col_type = data_types.get(col_str, 'unknown')
            col_summary = {
                "data_type": col_type,
                "unique_values": int(self.df[col].nunique()),
                "missing_values": int(self.df[col].isnull().sum()),
                "missing_percentage": float((self.df[col].isnull().sum() / len(self.df)) * 100) if len(self.df) > 0 else 0
            }
            
            if col_type == 'numeric':
                col_summary.update({
                    "mean": safe_float_conversion(self.df[col].mean()),
                    "std": safe_float_conversion(self.df[col].std()),
                    "min": safe_float_conversion(self.df[col].min()),
                    "max": safe_float_conversion(self.df[col].max()),
                    "median": safe_float_conversion(self.df[col].median())
                })
            elif col_type == 'categorical':
                value_counts = self.df[col].value_counts()
                col_summary.update({
                    "top_values": {str(k): int(v) for k, v in value_counts.head(5).to_dict().items()},
                    "value_distribution": {str(k): float(v) for k, v in (value_counts / len(self.df)).head(10).to_dict().items()}
                })
            elif col_type == 'datetime':
                col_summary.update({
                    "min_date": str(self.df[col].min()) if not pd.isna(self.df[col].min()) else None,
                    "max_date": str(self.df[col].max()) if not pd.isna(self.df[col].max()) else None,
                    "date_range_days": int((self.df[col].max() - self.df[col].min()).days) if not pd.isna(self.df[col].min()) and not pd.isna(self.df[col].max()) else 0
                })
            
            summary[col_str] = clean_dict_for_json(col_summary)
        
        return summary
    
    def extract_features(self, target_column: str = None) -> Dict[str, Any]:
        """Extract engineered features from the data"""
        features = {
            "time_based_features": [],
            "numeric_features": [],
            "categorical_features": [],
            "interaction_features": [],
            "transformed_features": []
        }
        
        # Create a list of new columns to add (to avoid fragmentation)
        new_columns = {}
        
        # Identify datetime columns for time-based features
        for col in self.df.columns:
            if 'date' in col.lower() or 'time' in col.lower():
                try:
                    # Extract date parts
                    date_series = pd.to_datetime(self.df[col])
                    new_columns[f'{col}_year'] = date_series.dt.year
                    new_columns[f'{col}_month'] = date_series.dt.month
                    new_columns[f'{col}_day'] = date_series.dt.day
                    new_columns[f'{col}_weekday'] = date_series.dt.weekday
                    
                    features["time_based_features"].extend([
                        f'{col}_year', f'{col}_month', f'{col}_day', f'{col}_weekday'
                    ])
                except:
                    pass
        
        # Create interaction features for numeric columns
        numeric_cols = self.df.select_dtypes(include=[np.number]).columns.tolist()
        if len(numeric_cols) >= 2:
            # Create ratio features
            for i in range(len(numeric_cols)):
                for j in range(i+1, len(numeric_cols)):
                    col1, col2 = numeric_cols[i], numeric_cols[j]
                    ratio_col = f'ratio_{col1}_to_{col2}'
                    # Avoid division by zero
                    denominator = self.df[col2].replace(0, np.nan)
                    new_columns[ratio_col] = self.df[col1] / denominator
                    features["interaction_features"].append(ratio_col)
        
        # Log transform skewed numeric features
        for col in numeric_cols:
            skewness = abs(self.df[col].skew()) if not self.df[col].isnull().all() else 0
            if skewness > 1 and not pd.isna(skewness):  # Highly skewed
                log_col = f'log_{col}'
                # Add small constant to avoid log(0)
                new_columns[log_col] = np.log1p(self.df[col].clip(lower=0))
                features["transformed_features"].append(log_col)
        
        # Add all new columns at once to avoid fragmentation
        if new_columns:
            new_df = pd.DataFrame(new_columns)
            self.df = pd.concat([self.df, new_df], axis=1)
        
        features["numeric_features"] = [str(col) for col in numeric_cols]
        features["categorical_features"] = [str(col) for col in self.df.select_dtypes(include=['object']).columns.tolist()]
        
        return clean_dict_for_json(features)
    
    def prepare_for_ml(self, target_column: str = None) -> Tuple[pd.DataFrame, Optional[pd.Series], Dict[str, Any]]:
        """Prepare data for machine learning"""
        # Clean data first
        if not self.processed:
            self.clean_data()
        
        # Extract features
        features_report = self.extract_features(target_column)
        
        # Handle categorical variables (one-hot encoding)
        categorical_cols = self.df.select_dtypes(include=['object']).columns
        if len(categorical_cols) > 0:
            self.df = pd.get_dummies(self.df, columns=categorical_cols, drop_first=True)
        
        # Separate features and target
        X = self.df.copy()
        y = None
        
        if target_column and target_column in X.columns:
            y = X[target_column]
            X = X.drop(columns=[target_column])
        
        # Remove columns with all NaN values
        X = X.dropna(axis=1, how='all')
        
        # Fill any remaining NaN values
        X = X.fillna(0)
        
        # Clip extremely large values
        numeric_cols = X.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            X[col] = X[col].clip(-1e100, 1e100)  # Prevent overflow
        
        # Normalize numeric features
        if len(numeric_cols) > 0:
            from sklearn.preprocessing import StandardScaler
            scaler = StandardScaler()
            X[numeric_cols] = scaler.fit_transform(X[numeric_cols])
            
            # Clean scaler values
            features_report["scaler"] = {
                "type": "StandardScaler",
                "features_scaled": [str(col) for col in numeric_cols],
                "mean": [safe_float_conversion(m) for m in scaler.mean_],
                "scale": [safe_float_conversion(s) for s in scaler.scale_]
            }
        
        return X, y, clean_dict_for_json(features_report)
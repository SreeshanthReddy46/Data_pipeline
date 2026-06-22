import pandas as pd
import numpy as np
import json
from typing import Dict, Any, List

class ProfilerService:
    @staticmethod
    def profile_dataframe(df: pd.DataFrame) -> Dict[str, Any]:
        """
        Generates statistical profiling of a Pandas DataFrame.
        """
        row_count = len(df)
        col_count = len(df.columns)
        
        # Duplicated rows
        duplicate_rows = int(df.duplicated().sum())
        duplicate_percentage = (duplicate_rows / row_count * 100) if row_count > 0 else 0
        
        columns_profile = {}
        
        for col in df.columns:
            series = df[col]
            null_count = int(series.isnull().sum())
            null_percentage = (null_count / row_count * 100) if row_count > 0 else 0
            
            # Infer data type
            inferred_type = ProfilerService._infer_type(series)
            
            col_stats = {
                "name": col,
                "type": inferred_type,
                "null_count": null_count,
                "null_percentage": round(null_percentage, 2),
                "unique_count": int(series.nunique()),
            }
            
            # Type-specific metrics and distributions
            if inferred_type == "numeric":
                # Convert to numeric, ignoring errors (though they should be mostly clean already)
                numeric_series = pd.to_numeric(series, errors='coerce').dropna()
                if not numeric_series.empty:
                    q1 = numeric_series.quantile(0.25)
                    q3 = numeric_series.quantile(0.75)
                    iqr = q3 - q1
                    lower_bound = q1 - 1.5 * iqr
                    upper_bound = q3 + 1.5 * iqr
                    outliers = int(((numeric_series < lower_bound) | (numeric_series > upper_bound)).sum())
                    
                    col_stats.update({
                        "min": float(numeric_series.min()),
                        "max": float(numeric_series.max()),
                        "mean": float(numeric_series.mean()),
                        "median": float(numeric_series.median()),
                        "std": float(numeric_series.std()) if len(numeric_series) > 1 else 0.0,
                        "outlier_count": outliers,
                    })
                    
                    # Create histogram bins for frontend charts
                    counts, bin_edges = np.histogram(numeric_series, bins=10)
                    col_stats["distribution"] = [
                        {
                            "bin": f"{round(bin_edges[i], 1)} - {round(bin_edges[i+1], 1)}",
                            "count": int(counts[i])
                        }
                        for i in range(len(counts))
                    ]
                else:
                    col_stats.update({
                        "min": None, "max": None, "mean": None, "median": None, "std": None, "outlier_count": 0,
                        "distribution": []
                    })
            elif inferred_type == "datetime":
                datetime_series = pd.to_datetime(series, errors='coerce').dropna()
                if not datetime_series.empty:
                    col_stats.update({
                        "min": datetime_series.min().isoformat(),
                        "max": datetime_series.max().isoformat(),
                    })
                col_stats["distribution"] = []
            else:  # categorical / text / boolean
                # Top value distributions
                value_counts = series.value_counts(dropna=True).head(10)
                col_stats["distribution"] = [
                    {"value": str(k), "count": int(v)}
                    for k, v in value_counts.items()
                ]
                
            columns_profile[col] = col_stats
            
        # Numerical correlation matrix (for heatmaps)
        numeric_cols = [col for col, profile in columns_profile.items() if profile["type"] == "numeric"]
        correlation_matrix = []
        if len(numeric_cols) > 1:
            try:
                corr_df = df[numeric_cols].apply(pd.to_numeric, errors='coerce').corr().fillna(0)
                for i, col1 in enumerate(numeric_cols):
                    for j, col2 in enumerate(numeric_cols):
                        correlation_matrix.append({
                            "col1": col1,
                            "col2": col2,
                            "correlation": round(float(corr_df.loc[col1, col2]), 3)
                        })
            except Exception:
                pass
                
        # Missing values matrix (downsampled to 50 data points for UI heatmaps)
        # It shows a grid of row indices vs columns, indicating if a cell is null (1) or not (0)
        sample_size = min(50, row_count)
        missing_matrix = []
        if row_count > 0:
            indices = np.linspace(0, row_count - 1, sample_size, dtype=int)
            sampled_df = df.iloc[indices]
            for idx, (_, row) in enumerate(sampled_df.iterrows()):
                for col in df.columns:
                    missing_matrix.append({
                        "sample_idx": idx,
                        "column": col,
                        "is_missing": int(pd.isnull(row[col]))
                    })
                    
        return {
            "row_count": row_count,
            "col_count": col_count,
            "duplicate_rows": duplicate_rows,
            "duplicate_percentage": round(duplicate_percentage, 2),
            "columns": columns_profile,
            "correlation_matrix": correlation_matrix,
            "missing_matrix": missing_matrix
        }
        
    @staticmethod
    def _infer_type(series: pd.Series) -> str:
        """
        Helper method to infer custom types for profiling.
        """
        # Drop nulls for inference
        clean_series = series.dropna()
        if clean_series.empty:
            return "text"
            
        # Check if boolean
        if clean_series.dtype == bool or set(clean_series.unique()).issubset({True, False, 0, 1, '0', '1', 'True', 'False', 'true', 'false'}):
            return "boolean"
            
        # Check if numeric
        # Try to convert to float/int
        try:
            pd.to_numeric(clean_series, errors='raise')
            return "numeric"
        except (ValueError, TypeError):
            pass
            
        # Check if datetime
        # Only check if string format looks like date or is already timestamp
        if pd.api.types.is_datetime64_any_dtype(clean_series):
            return "datetime"
            
        # Let's check a sample of string records to see if they can be parsed as dates
        sample_values = clean_series.head(5).astype(str)
        date_hits = 0
        for val in sample_values:
            if len(val) >= 8 and any(char in val for char in ['-', '/', ':']):
                try:
                    pd.to_datetime(val, errors='raise')
                    date_hits += 1
                except (ValueError, TypeError):
                    pass
        if date_hits >= len(sample_values) * 0.8:
            return "datetime"
            
        return "text"

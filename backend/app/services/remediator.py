import pandas as pd
import numpy as np
import json
import logging
from typing import Dict, Any, Tuple, List
import google.generativeai as genai

logger = logging.getLogger(__name__)

class RemediatorService:
    @staticmethod
    def apply_rule_fix(df: pd.DataFrame, rule_type: str, column: str, parameters: Dict[str, Any]) -> Tuple[pd.DataFrame, int, str]:
        """
        Applies a rule-based clean to the dataframe.
        Returns: (modified_df, rows_affected, audit_message)
        """
        modified_df = df.copy()
        rows_affected = 0
        message = ""
        
        if rule_type == "drop_duplicates":
            before_rows = len(modified_df)
            modified_df = modified_df.drop_duplicates()
            rows_affected = before_rows - len(modified_df)
            message = f"Dropped {rows_affected} duplicate rows. Row count reduced from {before_rows} to {len(modified_df)}."
            
        elif rule_type == "fill_nulls":
            if column not in modified_df.columns:
                raise ValueError(f"Column '{column}' not found.")
                
            strategy = parameters.get("strategy", "custom")
            null_mask = modified_df[column].isnull()
            rows_affected = int(null_mask.sum())
            
            if rows_affected > 0:
                if strategy == "mean":
                    fill_val = pd.to_numeric(modified_df[column], errors='coerce').mean()
                elif strategy == "median":
                    fill_val = pd.to_numeric(modified_df[column], errors='coerce').median()
                elif strategy == "mode":
                    mode_val = modified_df[column].mode()
                    fill_val = mode_val.iloc[0] if not mode_val.empty else ""
                else:  # custom
                    fill_val = parameters.get("value", "")
                    
                modified_df[column] = modified_df[column].fillna(fill_val)
                message = f"Filled {rows_affected} missing values in '{column}' using '{strategy}' strategy (value: {fill_val})."
            else:
                message = f"No missing values found in '{column}'. No action taken."
                
        elif rule_type == "clip_outliers":
            if column not in modified_df.columns:
                raise ValueError(f"Column '{column}' not found.")
                
            numeric_col = pd.to_numeric(modified_df[column], errors='coerce')
            q1 = numeric_col.quantile(0.25)
            q3 = numeric_col.quantile(0.75)
            iqr = q3 - q1
            lower_bound = q1 - 1.5 * iqr
            upper_bound = q3 + 1.5 * iqr
            
            outliers_mask = (numeric_col < lower_bound) | (numeric_col > upper_bound)
            rows_affected = int(outliers_mask.sum())
            
            if rows_affected > 0:
                modified_df[column] = np.clip(numeric_col, lower_bound, upper_bound)
                message = f"Clipped {rows_affected} outliers in '{column}' to range [{round(lower_bound, 2)}, {round(upper_bound, 2)}]."
            else:
                message = f"No outliers found in '{column}'. No action taken."
                
        elif rule_type == "standardize_casing":
            if column not in modified_df.columns:
                raise ValueError(f"Column '{column}' not found.")
                
            casing_style = parameters.get("style", "title") # lower, upper, title
            non_nulls = modified_df[column].dropna()
            
            if len(non_nulls) > 0:
                original_col = modified_df[column].copy()
                if casing_style == "lower":
                    modified_df[column] = modified_df[column].astype(str).str.lower()
                elif casing_style == "upper":
                    modified_df[column] = modified_df[column].astype(str).str.upper()
                else:  # title
                    modified_df[column] = modified_df[column].astype(str).str.title()
                
                # Restore original nulls
                modified_df.loc[original_col.isnull(), column] = np.nan
                
                # Check how many changed
                changed_mask = modified_df[column] != original_col
                # Ignore null positions in count
                changed_mask = changed_mask & original_col.notnull()
                rows_affected = int(changed_mask.sum())
                
                message = f"Standardized text casing in '{column}' to {casing_style}case ({rows_affected} cells updated)."
            else:
                message = f"Column '{column}' is empty. No action taken."
                
        else:
            raise ValueError(f"Unknown rule type '{rule_type}'.")
            
        return modified_df, rows_affected, message

    @staticmethod
    def apply_llm_fix(df: pd.DataFrame, column: str, fix_type: str, api_key: str) -> Tuple[pd.DataFrame, int, str]:
        """
        Standardizes column values using the Gemini API. 
        Only unique values are sent to save cost and protect user privacy.
        """
        if column not in df.columns:
            raise ValueError(f"Column '{column}' not found.")
            
        modified_df = df.copy()
        
        # Get unique non-null string values
        unique_values = df[column].dropna().astype(str).unique().tolist()
        unique_values = [v.strip() for v in unique_values if v.strip()]
        
        if not unique_values:
            return modified_df, 0, f"No values found in '{column}' to clean."
            
        # Limit to prevent sending too many values in one prompt
        if len(unique_values) > 200:
            unique_values = unique_values[:200]
            
        # Fallback local mappings for testing without API keys (demo robustness)
        local_fallbacks = {
            "state": {
                "CA": "California", "cali": "California", "Calif": "California", "NY": "New York", 
                "ny": "New York", "N.Y.": "New York", "TX": "Texas", "tx": "Texas", "Tex": "Texas"
            },
            "country": {
                "US": "USA", "us": "USA", "U.S.A.": "USA", "united states": "USA", "United States": "USA",
                "UK": "United Kingdom", "uk": "United Kingdom", "U.K.": "United Kingdom", "gb": "United Kingdom"
            },
            "industry": {
                "tech": "Technology", "software": "Technology", "fin": "Finance", "banking": "Finance",
                "health": "Healthcare", "med": "Healthcare"
            }
        }
        
        mapping = {}
        used_fallback = False
        
        if not api_key:
            # Check if we have a fallback mapping for this column type
            lower_col = column.lower()
            matched_fallback = None
            for key in local_fallbacks:
                if key in lower_col:
                    matched_fallback = local_fallbacks[key]
                    break
                    
            if matched_fallback:
                for val in unique_values:
                    cleaned = matched_fallback.get(val, matched_fallback.get(val.strip(), val))
                    if cleaned != val:
                        mapping[val] = cleaned
                used_fallback = True
            else:
                raise ValueError("Gemini API Key is required to clean this column. Please configure your key in Settings.")
        else:
            try:
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel('gemini-1.5-flash')
                
                prompt = f"""
You are an expert data cleaning assistant.
Analyze the following list of unique values from the column '{column}'.
Task: Clean and standardize these values to resolve typos, spelling variants, case inconsistency, and abbreviations.
For example, standardizing state codes like "CA", "cali", "California" into "California", or "US", "U.S.A", "united states" into "USA".
Provide a JSON mapping where the keys are the original values and the values are the cleaned, standardized equivalents.
Only include items in the JSON where a correction or standardization is actually needed. Do not return keys that map to the exact same value.

Unique Values:
{json.dumps(unique_values)}

Example output:
{{
  "US": "USA",
  "U.S.A.": "USA",
  "united states": "USA",
  "Calfornia": "California",
  "CA": "California"
}}
Return ONLY valid JSON and absolutely no other text.
"""
                response = model.generate_content(
                    prompt,
                    generation_config={"response_mime_type": "application/json"}
                )
                
                result_text = response.text.strip()
                mapping = json.loads(result_text)
            except Exception as e:
                logger.error(f"Gemini API clean failed: {str(e)}")
                raise ValueError(f"LLM cleaning failed: {str(e)}")
                
        # Apply the mapping
        rows_affected = 0
        if mapping:
            # Keep track of which rows were modified
            original_values = modified_df[column].astype(str)
            modified_df[column] = modified_df[column].apply(lambda x: mapping.get(str(x).strip(), x) if pd.notnull(x) else x)
            
            # Count changes
            changed_mask = modified_df[column].astype(str) != original_values
            changed_mask = changed_mask & df[column].notnull()
            rows_affected = int(changed_mask.sum())
            
            method_desc = "Local Semantic Fallback" if used_fallback else "Gemini LLM semantic resolution"
            message = f"Applied {method_desc} on '{column}'. Cleaned {len(mapping)} unique values affecting {rows_affected} rows. Mappings: {json.dumps(mapping)}"
        else:
            message = f"LLM scanned '{column}' but did not find any values requiring changes."
            
        return modified_df, rows_affected, message

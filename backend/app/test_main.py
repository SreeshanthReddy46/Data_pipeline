import pandas as pd
import pytest
from app.services.profiler import ProfilerService
from app.services.quality_detector import QualityDetectorService
from app.services.scorer import ScorerService
from app.services.remediator import RemediatorService

def test_profiler_and_detector():
    # Create mock messy data
    data = {
        "id": [1, 2, 3, 3, 5],
        "name": ["john", "Jane", "Alice", "Alice", None],
        "score": [10.0, 20.0, 15.0, 15.0, 1000.0] # 1000.0 is an outlier
    }
    df = pd.DataFrame(data)
    
    # Run profiler
    profile = ProfilerService.profile_dataframe(df)
    assert profile["row_count"] == 5
    assert profile["col_count"] == 3
    assert profile["duplicate_rows"] == 1 # row 3 is duplicated
    
    # Run detector
    issues = QualityDetectorService.detect_issues(df, profile)
    
    # Verify we flagged nulls, duplicates, and outliers
    dimensions = [issue["dimension"] for issue in issues]
    assert "uniqueness" in dimensions
    assert "completeness" in dimensions # name has a null
    assert "validity" in dimensions     # score has an outlier
    
    # Run scorer
    score_res = ScorerService.calculate_score(profile, issues)
    assert score_res["overall"] < 100.0
    assert score_res["dimensions"]["completeness"] < 100.0
    assert score_res["dimensions"]["uniqueness"] < 100.0
    
def test_remediator():
    data = {
        "id": [1, 2, 3, 3, 4],
        "name": ["john", "jane", "alice", "alice", "bob"],
        "val": [10, 20, 15, 15, 100] # Row 2 and 3 are exact duplicates, row 4 has 100 (outlier)
    }
    df = pd.DataFrame(data)
    
    # Rule 1: Drop Duplicates
    df_clean, rows, msg = RemediatorService.apply_rule_fix(df, "drop_duplicates", "", {})
    assert len(df_clean) == 4
    assert rows == 1
    
    # Rule 2: Standardize casing
    df_case, rows, msg = RemediatorService.apply_rule_fix(df, "standardize_casing", "name", {"style": "title"})
    assert df_case["name"].iloc[0] == "John"
    assert rows == 5 # all non-title strings updated
    
    # Rule 3: Clip Outliers
    df_clip, rows, msg = RemediatorService.apply_rule_fix(df, "clip_outliers", "val", {})
    assert df_clip["val"].max() < 100
    assert rows == 1

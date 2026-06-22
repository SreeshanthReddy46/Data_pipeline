from typing import Dict, Any, List

class ScorerService:
    @staticmethod
    def calculate_score(profile: Dict[str, Any], issues: List[Dict[str, Any]], weights: Dict[str, float] = None) -> Dict[str, Any]:
        """
        Computes composite and dimensional AI-Readiness scores (0-100).
        """
        if weights is None:
            weights = {
                "completeness": 0.25,
                "validity": 0.25,
                "uniqueness": 0.20,
                "consistency": 0.20,
                "timeliness": 0.10
            }
            
        row_count = profile["row_count"]
        col_count = profile["col_count"]
        total_cells = row_count * col_count
        
        # 1. Completeness Score
        total_missing = sum(col["null_count"] for col in profile["columns"].values())
        if total_cells > 0:
            completeness = 100.0 - (total_missing / total_cells * 100.0)
        else:
            completeness = 100.0
        completeness = max(0.0, min(100.0, completeness))
        
        # 2. Uniqueness Score
        duplicate_pct = profile.get("duplicate_percentage", 0.0)
        uniqueness = max(0.0, 100.0 - duplicate_pct)
        
        # 3. Validity Score
        # Deduct based on outlier count and future dates
        total_outliers = 0
        numeric_cols = 0
        for col in profile["columns"].values():
            if col["type"] == "numeric":
                numeric_cols += 1
                total_outliers += col.get("outlier_count", 0)
                
        validity_deduction = 0.0
        if numeric_cols > 0 and row_count > 0:
            validity_deduction = (total_outliers / (numeric_cols * row_count)) * 100.0
            
        # Deduct for future dates (validity issue)
        future_dates = sum(issue["count"] for issue in issues if issue["dimension"] == "validity" and "future" in issue["description"])
        if row_count > 0:
            validity_deduction += (future_dates / row_count) * 100.0
            
        validity = max(0.0, 100.0 - validity_deduction)
        
        # 4. Consistency Score
        # Deduct for mixed casing styles and category count alerts
        consistency_deduction = 0.0
        consistency_issues = [issue for issue in issues if issue["dimension"] == "consistency"]
        
        for issue in consistency_issues:
            if "mixed casing" in issue["description"].lower():
                consistency_deduction += 5.0
            elif "categories" in issue["description"].lower():
                consistency_deduction += 10.0
                
        consistency = max(0.0, 100.0 - consistency_deduction)
        
        # 5. Timeliness Score
        # Deduct based on time violations or old data alerts (stubbed default for timeline)
        timeliness = 100.0
        timeliness_issues = [issue for issue in issues if issue["dimension"] == "timeliness"]
        if timeliness_issues:
            timeliness = max(0.0, 100.0 - (len(timeliness_issues) * 15.0))
            
        # Weighted composite score
        composite_score = (
            completeness * weights.get("completeness", 0.25) +
            validity * weights.get("validity", 0.25) +
            uniqueness * weights.get("uniqueness", 0.20) +
            consistency * weights.get("consistency", 0.20) +
            timeliness * weights.get("timeliness", 0.10)
        )
        
        return {
            "overall": round(composite_score, 1),
            "dimensions": {
                "completeness": round(completeness, 1),
                "validity": round(validity, 1),
                "uniqueness": round(uniqueness, 1),
                "consistency": round(consistency, 1),
                "timeliness": round(timeliness, 1)
            },
            "weights": weights
        }

from pydantic import BaseModel
from typing import List, Optional

class RiskyClause(BaseModel):
    clause_title: str
    original_text: str
    risk_level: str        # Low / Medium / High
    explanation_hindi: str
    explanation_english: str
    recommendation: str

class LegalReport(BaseModel):
    document_name: str
    overall_verdict: str   # Safe / Caution / Danger
    risk_score: int        # 0 to 100
    summary: str
    risky_clauses: List[RiskyClause]
    gst_compliance_issues: List[str]
    what_to_negotiate: List[str]
    plain_english_summary: str
    plain_hindi_summary: str

class AnalyzeRequest(BaseModel):
    filename: Optional[str] = "document.pdf"



# Auth models
class SignupRequest(BaseModel):
    email: str
    password: str
    name: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    token: str
    email: str
    name: Optional[str] = None
    message: str    
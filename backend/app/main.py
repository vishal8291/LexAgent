from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from datetime import datetime, timedelta
import json
import uuid

from .ca_connect import router as ca_router, seed_cas, bookings_collection
from .document_parser import extract_text_from_pdf, extract_text_from_txt
from .legal_analyzer import analyze_legal_document
from .pdf_generator import generate_pdf_report
from .models import LegalReport, SignupRequest, LoginRequest, AuthResponse
from .database import users_collection, reports_collection, create_indexes
from .auth import (
    hash_password, verify_password,
    create_token, get_current_user, require_user
)

app = FastAPI(
    title="LexAgent API",
    description="AI Legal Auditor for Indian SMEs",
    version="2.0.0"
)

app.include_router(ca_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True
)

@app.get("/bookings")
async def get_my_bookings(current_user: dict = Depends(require_user)):
    from .ca_connect import bookings_collection
    bookings = []
    async for b in bookings_collection.find(
        {"user_id": current_user["sub"]}
    ).sort("created_at", -1).limit(10):
        bookings.append({
            "id": b["_id"],
            "ca_name": b["ca_name"],
            "user_name": b["user_name"],
            "status": b["status"],
            "amount": b["amount"],
            "created_at": b["created_at"].isoformat()
        })
    return bookings

@app.on_event("startup")
async def startup():
    await create_indexes()
    await seed_cas()

# ─── ROOT ────────────────────────────────
@app.get("/")
def root():
    return {
        "product": "LexAgent",
        "version": "2.0.0",
        "status": "running"
    }

# ─── SIGNUP ──────────────────────────────
@app.post("/auth/signup", response_model=AuthResponse)
async def signup(req: SignupRequest):
    existing = await users_collection.find_one({"email": req.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    user_id = str(uuid.uuid4())
    user = {
        "_id": user_id,
        "email": req.email,
        "name": req.name or "",
        "password_hash": hash_password(req.password),
        "created_at": datetime.utcnow()
    }
    await users_collection.insert_one(user)
    token = create_token(user_id, req.email)

    return AuthResponse(
        token=token,
        email=req.email,
        name=req.name,
        message="Account created successfully"
    )

# ─── LOGIN ───────────────────────────────
@app.post("/auth/login", response_model=AuthResponse)
async def login(req: LoginRequest):
    user = await users_collection.find_one({"email": req.email})
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_token(user["_id"], user["email"])

    return AuthResponse(
        token=token,
        email=user["email"],
        name=user.get("name", ""),
        message="Login successful"
    )

# ─── ME ──────────────────────────────────
@app.get("/auth/me")
async def get_me(current_user: dict = Depends(require_user)):
    user = await users_collection.find_one({"_id": current_user["sub"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user["_id"],
        "email": user["email"],
        "name": user.get("name", ""),
        "created_at": user["created_at"].isoformat()
    }

# ─── ANALYZE ─────────────────────────────
@app.post("/analyze", response_model=LegalReport)
async def analyze_document(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    if not file.filename.endswith((".pdf", ".txt")):
        raise HTTPException(status_code=400, detail="Only PDF and TXT files supported")

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded")

    if file.filename.endswith(".pdf"):
        document_text = extract_text_from_pdf(file_bytes)
    else:
        document_text = extract_text_from_txt(file_bytes)

    if not document_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text")

    report = analyze_legal_document(document_text, file.filename)

    # Auto save if logged in
    if current_user:
        await reports_collection.insert_one({
            "_id": str(uuid.uuid4()),
            "user_id": current_user["sub"],
            "document_name": report.document_name,
            "overall_verdict": report.overall_verdict,
            "risk_score": report.risk_score,
            "summary": report.summary,
            "plain_english_summary": report.plain_english_summary,
            "plain_hindi_summary": report.plain_hindi_summary,
            "risky_clauses": [c.dict() for c in report.risky_clauses],
            "gst_compliance_issues": report.gst_compliance_issues,
            "what_to_negotiate": report.what_to_negotiate,
            "created_at": datetime.utcnow()
        })

    return report

# ─── PDF ─────────────────────────────────
@app.post("/analyze/pdf")
async def analyze_and_download_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith((".pdf", ".txt")):
        raise HTTPException(status_code=400, detail="Only PDF and TXT files supported")
    file_bytes = await file.read()
    if file.filename.endswith(".pdf"):
        document_text = extract_text_from_pdf(file_bytes)
    else:
        document_text = extract_text_from_txt(file_bytes)
    report = analyze_legal_document(document_text, file.filename)
    pdf_bytes = generate_pdf_report(report)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=LexAgent_Report.pdf"
        }
    )

# ─── REPORTS HISTORY ─────────────────────
@app.get("/reports")
async def get_reports(current_user: dict = Depends(require_user)):
    cursor = reports_collection.find(
        {"user_id": current_user["sub"]}
    ).sort("created_at", -1).limit(20)

    reports = []
    async for r in cursor:
        reports.append({
            "id": r["_id"],
            "document_name": r["document_name"],
            "overall_verdict": r["overall_verdict"],
            "risk_score": r["risk_score"],
            "summary": r.get("summary", ""),
            "plain_english_summary": r.get("plain_english_summary", ""),
            "plain_hindi_summary": r.get("plain_hindi_summary", ""),
            "risky_clauses": r.get("risky_clauses", []),
            "gst_compliance_issues": r.get("gst_compliance_issues", []),
            "what_to_negotiate": r.get("what_to_negotiate", []),
            "created_at": r["created_at"].isoformat()
        })
    return reports


# ─── ADMIN ───────────────────────────────
ADMIN_PASSWORD = "lexagent-admin-2024"

@app.post("/admin/login")
async def admin_login(credentials: dict):
    if credentials.get("password") != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin password")
    token = create_token("admin", "admin@lexagent.in")
    return {"token": token, "message": "Admin login successful"}

@app.get("/admin/stats")
async def admin_stats(current_user: dict = Depends(require_user)):
    if current_user.get("email") != "admin@lexagent.in":
        raise HTTPException(status_code=403, detail="Admin access required")

    # Total users
    total_users = await users_collection.count_documents({})

    # Total analyses
    total_analyses = await reports_collection.count_documents({})

    # This month stats
    start_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    monthly_users = await users_collection.count_documents({"created_at": {"$gte": start_of_month}})
    monthly_analyses = await reports_collection.count_documents({"created_at": {"$gte": start_of_month}})

    # Verdict breakdown
    safe_count = await reports_collection.count_documents({"overall_verdict": "Safe"})
    caution_count = await reports_collection.count_documents({"overall_verdict": "Caution"})
    danger_count = await reports_collection.count_documents({"overall_verdict": "Danger"})

    # Language breakdown
    language_pipeline = [
        {"$group": {"_id": "$language", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    lang_cursor = reports_collection.aggregate(language_pipeline)
    language_stats = {}
    async for doc in lang_cursor:
        language_stats[doc["_id"] or "hindi"] = doc["count"]

    # CA bookings
    total_bookings = await bookings_collection.count_documents({})
    pending_bookings = await bookings_collection.count_documents({"status": "pending"})

    # Recent users
    recent_users = []
    async for u in users_collection.find().sort("created_at", -1).limit(8):
        recent_users.append({
            "email": u["email"],
            "name": u.get("name", ""),
            "created_at": u["created_at"].isoformat()
        })

    # Recent analyses
    recent_analyses = []
    async for r in reports_collection.find().sort("created_at", -1).limit(8):
        recent_analyses.append({
            "document_name": r["document_name"],
            "overall_verdict": r["overall_verdict"],
            "risk_score": r["risk_score"],
            "language": r.get("language", "hindi"),
            "created_at": r["created_at"].isoformat()
        })

    # Recent bookings
    recent_bookings = []
    async for b in bookings_collection.find().sort("created_at", -1).limit(8):
        recent_bookings.append({
            "ca_name": b["ca_name"],
            "user_name": b["user_name"],
            "status": b["status"],
            "amount": b["amount"],
            "created_at": b["created_at"].isoformat()
        })

    return {
        "total_users": total_users,
        "total_analyses": total_analyses,
        "monthly_users": monthly_users,
        "monthly_analyses": monthly_analyses,
        "verdicts": {"Safe": safe_count, "Caution": caution_count, "Danger": danger_count},
        "languages": language_stats,
        "total_bookings": total_bookings,
        "pending_bookings": pending_bookings,
        "recent_users": recent_users,
        "recent_analyses": recent_analyses,
        "recent_bookings": recent_bookings
    }

# ─── HEALTH ──────────────────────────────
@app.get("/health")
def health():
    return {"status": "healthy", "product": "LexAgent"}
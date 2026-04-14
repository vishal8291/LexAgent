from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from pydantic import BaseModel
from typing import Optional
import uuid
from .database import ca_collection, bookings_collection
from .auth import get_current_user, require_user

router = APIRouter()

class BookingRequest(BaseModel):
    ca_id: str
    user_name: str
    user_phone: str
    issue_summary: str
    preferred_time: Optional[str] = None

async def seed_cas():
    count = await ca_collection.count_documents({})
    if count > 0:
        return
    sample_cas = [
        {
            "_id": str(uuid.uuid4()),
            "name": "CA Rajesh Sharma",
            "specialization": "Contract Law & GST",
            "experience_years": 12,
            "location": "Mumbai",
            "languages": ["Hindi", "English", "Marathi"],
            "rating": 4.8,
            "reviews": 124,
            "price_per_session": 499,
            "available": True,
            "avatar": "RS"
        },
        {
            "_id": str(uuid.uuid4()),
            "name": "CA Priya Nair",
            "specialization": "Business Agreements & MSME",
            "experience_years": 8,
            "location": "Bangalore",
            "languages": ["English", "Kannada", "Tamil"],
            "rating": 4.9,
            "reviews": 89,
            "price_per_session": 499,
            "available": True,
            "avatar": "PN"
        },
        {
            "_id": str(uuid.uuid4()),
            "name": "CA Amit Patel",
            "specialization": "GST Compliance & Vendor Contracts",
            "experience_years": 15,
            "location": "Ahmedabad",
            "languages": ["Gujarati", "Hindi", "English"],
            "rating": 4.7,
            "reviews": 201,
            "price_per_session": 499,
            "available": True,
            "avatar": "AP"
        },
        {
            "_id": str(uuid.uuid4()),
            "name": "CA Sunita Reddy",
            "specialization": "Corporate Law & NDAs",
            "experience_years": 10,
            "location": "Hyderabad",
            "languages": ["Telugu", "English", "Hindi"],
            "rating": 4.6,
            "reviews": 67,
            "price_per_session": 499,
            "available": True,
            "avatar": "SR"
        }
    ]
    await ca_collection.insert_many(sample_cas)
    print("✅ Sample CAs seeded")

@router.get("/cas")
async def get_cas():
    cas = []
    async for ca in ca_collection.find({"available": True}):
        cas.append({
            "id": ca["_id"],
            "name": ca["name"],
            "specialization": ca["specialization"],
            "experience_years": ca["experience_years"],
            "location": ca["location"],
            "languages": ca["languages"],
            "rating": ca["rating"],
            "reviews": ca["reviews"],
            "price_per_session": ca["price_per_session"],
            "avatar": ca["avatar"]
        })
    return cas

@router.post("/ca/book")
async def book_ca(
    req: BookingRequest,
    current_user: dict = Depends(require_user)
):
    ca = await ca_collection.find_one({"_id": req.ca_id})
    if not ca:
        raise HTTPException(status_code=404, detail="CA not found")

    booking = {
        "_id": str(uuid.uuid4()),
        "user_id": current_user["sub"],
        "ca_id": req.ca_id,
        "ca_name": ca["name"],
        "user_name": req.user_name,
        "user_phone": req.user_phone,
        "issue_summary": req.issue_summary,
        "preferred_time": req.preferred_time,
        "status": "pending",
        "amount": ca["price_per_session"],
        "created_at": datetime.utcnow()
    }

    await bookings_collection.insert_one(booking)

    return {
        "booking_id": booking["_id"],
        "ca_name": ca["name"],
        "amount": ca["price_per_session"],
        "status": "pending",
        "message": f"Booking confirmed with {ca['name']}. They will contact you within 2 hours on {req.user_phone}."
    }

@router.get("/bookings")
async def get_my_bookings(current_user: dict = Depends(require_user)):
    bookings = []
    async for b in bookings_collection.find(
        {"user_id": current_user["sub"]}
    ).sort("created_at", -1):
        bookings.append({
            "id": b["_id"],
            "ca_name": b["ca_name"],
            "issue_summary": b["issue_summary"],
            "status": b["status"],
            "amount": b["amount"],
            "created_at": b["created_at"].isoformat()
        })
    return bookings
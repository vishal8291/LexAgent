from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "lexagent")

client = AsyncIOMotorClient(MONGODB_URL)
db = client[DATABASE_NAME]

users_collection = db["users"]
reports_collection = db["reports"]
ca_collection        = db["chartered_accountants"]
bookings_collection  = db["bookings"]

async def create_indexes():
    try:
        await users_collection.create_index("email", unique=True)
        await reports_collection.create_index("user_id")
        await reports_collection.create_index("created_at")
        print("✅ MongoDB indexes created successfully")
    except Exception as e:
        print(f"Index creation note: {e}")
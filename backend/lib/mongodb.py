import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DB_NAME")

if not MONGO_URI:
    raise ValueError("MONGODB_URI is missing in .env")

if not DB_NAME:
    raise ValueError("DB_NAME is missing")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

users_collection = db["users"]
reports_collection = db["reports"]

# 🔥 Optional 
reports_collection.create_index(
    [("user_id", 1), ("file_hash", 1), ("language", 1)],
    unique=False
)

import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGODB_URI")

if not MONGO_URI:
    raise ValueError("MONGODB_URI is missing in .env")

client = MongoClient(MONGO_URI)
db = client["medilens"]

reports_collection = db["reports"]
users_collection = db["users"]

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

reports_collection = db["reports"]
users_collection = db["users"]

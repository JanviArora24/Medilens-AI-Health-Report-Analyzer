import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# =========================
# JWT CONFIG
# =========================
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = int(os.getenv("ACCESS_TOKEN_EXPIRE_DAYS", 1))

# =========================
# MONGODB CONFIG
# =========================
MONGO_URI = os.getenv("MONGODB_URI")

if not SECRET_KEY:
    raise ValueError("SECRET_KEY is missing in .env")

if not MONGO_URI:
    raise ValueError("MONGODB_URI is missing in .env")

from fastapi import APIRouter, HTTPException
from schemas.user import UserRegister, UserLogin
from core.security import hash_password, verify_password, create_access_token
from lib.mongodb import users_collection

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register")
def register(user: UserRegister):
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="User already exists")

    users_collection.insert_one({
        "name": user.name,
        "email": user.email,
        "hashed_password": hash_password(user.password),
        "auth_provider": "local"
    })

    return {"message": "User registered successfully"}

@router.post("/login")
def login(user: UserLogin):
    db_user = users_collection.find_one({"email": user.email})

    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({
        "user_id": str(db_user["_id"]),
        "email": db_user["email"],
        "name": db_user["name"]  # 👈 NAME ADDED
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }

from pydantic import BaseModel, EmailStr


# =========================
# REGISTER SCHEMA
# =========================
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str


# =========================
# LOGIN SCHEMA
# =========================
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# =========================
# OPTIONAL (Future use)
# =========================
class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr

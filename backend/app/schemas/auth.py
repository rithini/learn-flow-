from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from app.models.enums import UserRole


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    role: UserRole = UserRole.STUDENT
    student_code: Optional[str] = None
    institution_name: Optional[str] = None
    current_level: Optional[str] = "Undergraduate"
    employee_code: Optional[str] = None
    department: Optional[str] = None


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    full_name: str
    role: UserRole
    is_active: bool
    student_code: Optional[str] = None
    institution_name: Optional[str] = None
    current_level: Optional[str] = None
    employee_code: Optional[str] = None
    department: Optional[str] = None


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class TokenPayload(BaseModel):
    sub: str
    role: str
    type: str
    exp: int


class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    password: Optional[str] = None
    institution_name: Optional[str] = None
    current_level: Optional[str] = None
    department: Optional[str] = None

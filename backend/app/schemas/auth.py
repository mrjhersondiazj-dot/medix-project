from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    dni: str = Field(..., min_length=8, max_length=8)
    password: str = Field(..., min_length=6)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str

import time

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.security import create_access_token, verify_password
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

MAX_LOGIN_ATTEMPTS = 5
LOCK_SECONDS = 10 * 60
login_attempts: dict[str, list[float]] = {}


@router.post("/login", response_model=TokenResponse)
async def login(
    request: Request,
    credentials: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    key = f"{request.client.host if request.client else 'unknown'}:{credentials.dni}"
    now = time.time()
    attempts = [item for item in login_attempts.get(key, []) if now - item < LOCK_SECONDS]

    if len(attempts) >= MAX_LOGIN_ATTEMPTS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Demasiados intentos. Espera unos minutos y vuelve a intentarlo.",
        )

    result = await db.execute(select(User).where(User.dni == credentials.dni))
    user = result.scalar_one_or_none()

    if user is None or not verify_password(credentials.password, user.hashed_password):
        attempts.append(now)
        login_attempts[key] = attempts
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="DNI o contrasena incorrectos. Verifica los datos e intenta nuevamente.",
        )

    login_attempts.pop(key, None)

    token = create_access_token({"sub": str(user.id), "role": user.role.value})

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role.value,
    }

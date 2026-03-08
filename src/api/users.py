from fastapi import APIRouter, Depends

from src.core.auth import get_current_user

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    return user

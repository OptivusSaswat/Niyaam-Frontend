import httpx
from fastapi import Request, HTTPException

from src.core.config import BETTER_AUTH_URL


async def get_current_user(request: Request) -> dict:
    """Validate the session by calling Better Auth's get-session endpoint."""
    cookie_header = request.headers.get("cookie", "")

    if not cookie_header:
        raise HTTPException(status_code=401, detail="Not authenticated")

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BETTER_AUTH_URL}/api/auth/get-session",
            headers={"cookie": cookie_header},
        )

    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session")

    data = response.json()

    if not data or not data.get("user"):
        raise HTTPException(status_code=401, detail="Invalid session")

    return data["user"]

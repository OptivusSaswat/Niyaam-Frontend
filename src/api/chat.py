import json

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from src.agents.orchestrator import AgentOrchestrator
from src.core.auth import get_current_user

router = APIRouter(prefix="/api/chat", tags=["chat"])

orchestrator = AgentOrchestrator()


class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None


class ChatResponse(BaseModel):
    content: str
    conversation_id: str | None = None


@router.post("/message")
async def send_message(
    request: ChatRequest,
    user: dict = Depends(get_current_user),
):
    """Process a chat message through the agent pipeline. Returns full response."""
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    response = await orchestrator.process_query(request.message)

    return ChatResponse(
        content=response.content,
        conversation_id=request.conversation_id,
    )


@router.post("/stream")
async def stream_message(
    request: ChatRequest,
    user: dict = Depends(get_current_user),
):
    """Process a chat message and stream the response via SSE."""
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    async def event_generator():
        try:
            async for chunk in orchestrator.process_query_stream(request.message):
                data = json.dumps({"type": "chunk", "content": chunk})
                yield f"data: {data}\n\n"
            yield f"data: {json.dumps({'type': 'done'})}\n\n"
        except Exception as e:
            error_data = json.dumps({"type": "error", "content": str(e)})
            yield f"data: {error_data}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )

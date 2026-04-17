from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import ChatMessage, ChatSession, User
from schemas import ChatRequest, ChatResponse, MessageResponse
from services.auth_service import get_current_user
from services.nvidia_service import get_assistant_response

router = APIRouter(tags=["chat"])


def _trim_title_from_message(content: str) -> str:
    normalized = " ".join(content.strip().split())
    return (normalized[:40] + "...") if len(normalized) > 40 else normalized


@router.get("/sessions/{session_id}/messages", response_model=list[MessageResponse])
def get_messages(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = (
        db.query(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.asc(), ChatMessage.id.asc())
        .all()
    )
    return messages


@router.post("/chat", response_model=ChatResponse)
async def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = (
        db.query(ChatSession)
        .filter(ChatSession.id == payload.session_id, ChatSession.user_id == current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    clean_user_message = payload.message.strip()
    if not clean_user_message:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    # Auto-generate title from the first user message.
    first_user_message = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session.id, ChatMessage.role == "user")
        .order_by(ChatMessage.created_at.asc(), ChatMessage.id.asc())
        .first()
    )
    if not first_user_message and session.title == "New Conversation":
        session.title = _trim_title_from_message(clean_user_message)

    user_message = ChatMessage(session_id=session.id, role="user", content=clean_user_message)
    db.add(user_message)
    db.flush()

    all_messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session.id)
        .order_by(ChatMessage.created_at.asc(), ChatMessage.id.asc())
        .all()
    )
    history = [{"role": msg.role, "content": msg.content} for msg in all_messages]

    assistant_text = await get_assistant_response(history)
    assistant_message = ChatMessage(session_id=session.id, role="assistant", content=assistant_text)
    db.add(assistant_message)

    session.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(assistant_message)

    return ChatResponse(
        session_id=session.id,
        message_id=assistant_message.id,
        content=assistant_message.content,
        role=assistant_message.role,
        created_at=assistant_message.created_at,
    )

from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from fastapi import APIRouter, Depends, HTTPException

from database import get_db
from models import ChatMessage, ChatSession, User
from schemas import SessionCreate, SessionResponse, SessionTitleUpdate
from services.auth_service import get_current_user

router = APIRouter(tags=["sessions"])


@router.get("/sessions", response_model=list[SessionResponse])
def list_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = (
        db.query(
            ChatSession.id,
            ChatSession.title,
            ChatSession.created_at,
            ChatSession.updated_at,
            func.count(ChatMessage.id).label("message_count"),
        )
        .outerjoin(ChatMessage, ChatSession.id == ChatMessage.session_id)
        .filter(ChatSession.user_id == current_user.id)
        .group_by(ChatSession.id)
        .order_by(desc(ChatSession.updated_at), desc(ChatSession.created_at))
        .all()
    )
    return [
        SessionResponse(
            id=row.id,
            title=row.title,
            created_at=row.created_at,
            updated_at=row.updated_at,
            message_count=row.message_count,
        )
        for row in rows
    ]


@router.post("/sessions", response_model=SessionResponse, status_code=201)
def create_session(
    payload: SessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = ChatSession(title=payload.title or "New Conversation", user_id=current_user.id)
    db.add(session)
    db.commit()
    db.refresh(session)
    return SessionResponse(
        id=session.id,
        title=session.title,
        created_at=session.created_at,
        updated_at=session.updated_at,
        message_count=0,
    )


@router.patch("/sessions/{session_id}", response_model=SessionResponse)
def update_session_title(
    session_id: int,
    payload: SessionTitleUpdate,
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
    session.title = payload.title.strip()
    db.commit()
    db.refresh(session)
    message_count = db.query(func.count(ChatMessage.id)).filter(ChatMessage.session_id == session.id).scalar() or 0
    return SessionResponse(
        id=session.id,
        title=session.title,
        created_at=session.created_at,
        updated_at=session.updated_at,
        message_count=message_count,
    )


@router.delete("/sessions/{session_id}", status_code=204)
def delete_session(
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
    db.delete(session)
    db.commit()

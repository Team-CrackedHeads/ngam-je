"""Thread API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from src.app.api.deps import get_current_user
from src.database import get_db
from src.models.user import User
from src.models.thread import Thread
from src.schemas.thread import (
    ThreadCreate,
    ThreadUpdate,
    ThreadResponse,
    ThreadListResponse,
)

router = APIRouter()


@router.get("/", response_model=ThreadListResponse)
async def list_threads(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    List all threads with optional filtering by category.

    Query parameters:
    - skip: Number of records to skip (pagination)
    - limit: Maximum number of records to return
    - category: Filter by thread category (e.g., "gaming", "fashion")
    """
    query = db.query(Thread)

    # Filter by category if provided
    if category:
        query = query.filter(Thread.category == category)

    # Get total count before pagination
    total = query.count()

    # Apply pagination and ordering (newest first)
    threads = query.order_by(Thread.created_at.desc()).offset(skip).limit(limit).all()

    # Add computed online_users field (mock for now, can be real later)
    thread_responses = []
    for thread in threads:
        thread_dict = ThreadResponse.model_validate(thread).model_dump()
        # TODO: Replace with real online user count from active sessions
        thread_dict["online_users"] = thread.member_count // 10 if thread.member_count > 0 else 0
        thread_responses.append(ThreadResponse(**thread_dict))

    return ThreadListResponse(threads=thread_responses, total=total)


@router.get("/{thread_id}", response_model=ThreadResponse)
async def get_thread(thread_id: int, db: Session = Depends(get_db)):
    """
    Get a specific thread by ID.
    """
    thread = db.query(Thread).filter(Thread.id == thread_id).first()
    if not thread:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Thread {thread_id} not found",
        )

    # Add computed online_users field
    thread_dict = ThreadResponse.model_validate(thread).model_dump()
    thread_dict["online_users"] = thread.member_count // 10 if thread.member_count > 0 else 0

    return ThreadResponse(**thread_dict)


@router.post("/", response_model=ThreadResponse, status_code=status.HTTP_201_CREATED)
async def create_thread(
    thread_data: ThreadCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a new thread.

    Requires authentication. Thread will start at Tier 0.
    """
    # Create new thread
    new_thread = Thread(
        title=thread_data.title,
        description=thread_data.description,
        image_url=thread_data.image_url,
        category=thread_data.category,
        tags=thread_data.tags,
        tier=0,  # All threads start at Tier 0
        contributions=0,
        member_count=1,  # Creator is the first member
        created_by_user_id=current_user.id,
    )

    db.add(new_thread)
    db.commit()
    db.refresh(new_thread)

    # Add computed online_users field
    thread_dict = ThreadResponse.model_validate(new_thread).model_dump()
    thread_dict["online_users"] = 1  # Creator is online

    return ThreadResponse(**thread_dict)


@router.put("/{thread_id}", response_model=ThreadResponse)
async def update_thread(
    thread_id: int,
    thread_data: ThreadUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update an existing thread.

    Only the thread creator can update it.
    """
    thread = db.query(Thread).filter(Thread.id == thread_id).first()
    if not thread:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Thread {thread_id} not found",
        )

    # Check if current user is the creator
    if thread.created_by_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the thread creator can update it",
        )

    # Update fields that were provided
    update_data = thread_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(thread, field, value)

    db.commit()
    db.refresh(thread)

    # Add computed online_users field
    thread_dict = ThreadResponse.model_validate(thread).model_dump()
    thread_dict["online_users"] = thread.member_count // 10 if thread.member_count > 0 else 0

    return ThreadResponse(**thread_dict)


@router.delete("/{thread_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_thread(
    thread_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Delete a thread.

    Only the thread creator can delete it.
    """
    thread = db.query(Thread).filter(Thread.id == thread_id).first()
    if not thread:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Thread {thread_id} not found",
        )

    # Check if current user is the creator
    if thread.created_by_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the thread creator can delete it",
        )

    db.delete(thread)
    db.commit()

    return None


@router.post("/{thread_id}/boost", response_model=ThreadResponse)
async def boost_thread(
    thread_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Boost a thread (increase contributions and potentially tier level).

    This endpoint will be integrated with Stripe payments later.
    For now, it just increments the contribution count.
    """
    thread = db.query(Thread).filter(Thread.id == thread_id).first()
    if not thread:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Thread {thread_id} not found",
        )

    # Increment contributions
    thread.contributions += 1

    # Update tier based on contributions
    # Tier 0: 0 boosts, Tier 1: 2+ boosts, Tier 2: 7+ boosts, Tier 3: 14+ boosts
    if thread.contributions >= 14:
        thread.tier = 3
    elif thread.contributions >= 7:
        thread.tier = 2
    elif thread.contributions >= 2:
        thread.tier = 1
    else:
        thread.tier = 0

    db.commit()
    db.refresh(thread)

    # Add computed online_users field
    thread_dict = ThreadResponse.model_validate(thread).model_dump()
    thread_dict["online_users"] = thread.member_count // 10 if thread.member_count > 0 else 0

    return ThreadResponse(**thread_dict)

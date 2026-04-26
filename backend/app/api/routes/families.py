from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.dependencies import get_current_user, get_db
from app.models.family import Family, FamilyInvite, FamilyMember
from app.models.user import User
from app.schemas.family import (
    FamilyCreate,
    FamilyInviteCreate,
    FamilyInviteRead,
    FamilyMemberRead,
    FamilyRead,
)



router = APIRouter(prefix="/families", tags=["families"])

def get_user_family_member(db: Session, user_id: int) -> FamilyMember | None:
    return db.query(FamilyMember).filter(FamilyMember.user_id == user_id).first()

@router.post("", response_model=FamilyRead)
def create_family(
    payload: FamilyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing_membership = get_user_family_member(db, current_user.id)
    if existing_membership:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already belongs to a family",
        )

    family = Family(name=payload.name)
    db.add(family)
    db.flush()

    membership = FamilyMember(
        family_id=family.id,
        user_id=current_user.id,
        role="owner",
    )
    db.add(membership)
    db.commit()
    db.refresh(family)

    return family

@router.get("/me", response_model=FamilyRead)
def get_my_family(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    membership = get_user_family_member(db, current_user.id)
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family not found",
        )

    return membership.family

@router.post("/invites", response_model=FamilyInviteRead)
def create_family_invite(
    payload: FamilyInviteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    membership = get_user_family_member(db, current_user.id)
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Create a family first",
        )

    if membership.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only family owner can invite users",
        )

    existing_invite = (
        db.query(FamilyInvite)
        .filter(
            FamilyInvite.family_id == membership.family_id,
            FamilyInvite.email == payload.email,
            FamilyInvite.status == "pending",
        )
        .first()
    )
    if existing_invite:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invite already exists",
        )

    invite = FamilyInvite(
        family_id=membership.family_id,
        email=payload.email,
        status="pending",
    )
    db.add(invite)
    db.commit()
    db.refresh(invite)

    return invite

@router.post("/invites/{invite_id}/accept", response_model=FamilyRead)
def accept_family_invite(
    invite_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    membership = get_user_family_member(db, current_user.id)
    if membership:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already belongs to a family",
        )

    invite = db.query(FamilyInvite).filter(FamilyInvite.id == invite_id).first()
    if not invite or invite.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invite not found",
        )

    if invite.email.lower() != current_user.email.lower():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This invite belongs to another email",
        )

    invite.status = "accepted"

    new_membership = FamilyMember(
        family_id=invite.family_id,
        user_id=current_user.id,
        role="member",
    )
    db.add(new_membership)
    db.commit()
    db.refresh(invite.family)

    return invite.family

@router.get("/members", response_model=list[FamilyMemberRead])
def get_family_members(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    membership = get_user_family_member(db, current_user.id)
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family not found",
        )

    return (
        db.query(FamilyMember)
        .filter(FamilyMember.family_id == membership.family_id)
        .all()
    )

@router.get("/invites", response_model=list[FamilyInviteRead])
def get_family_invites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    membership = get_user_family_member(db, current_user.id)
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family not found",
        )

    return (
        db.query(FamilyInvite)
        .filter(FamilyInvite.family_id == membership.family_id)
        .all()
    )

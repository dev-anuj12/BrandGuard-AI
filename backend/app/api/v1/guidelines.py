from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.guideline import BrandGuideline, ApprovedSource, ApprovedFact, BannedWord, ApprovedTerminology
from app.models.enums import UserRole
from app.schemas.guideline import (
    BrandGuidelineCreate, BrandGuidelineUpdate, BrandGuidelineOut,
    ApprovedSourceCreate, ApprovedSourceOut,
    ApprovedFactCreate, ApprovedFactOut,
    BannedWordCreate, BannedWordOut,
    ApprovedTerminologyCreate, ApprovedTerminologyOut
)
from app.api.deps import get_current_user, require_roles, get_current_org
from app.models.user import User
from app.models.audit import AuditLog

router = APIRouter(prefix="/guidelines", tags=["Brand Knowledge Base"])

# --- Guidelines ---
@router.get("/rules", response_model=List[BrandGuidelineOut])
def list_guidelines(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    org: str = Depends(get_current_org)
):
    return db.query(BrandGuideline).filter(BrandGuideline.organization == org).order_by(BrandGuideline.id.desc()).all()

@router.post("/rules", response_model=BrandGuidelineOut, status_code=status.HTTP_201_CREATED)
def create_guideline(
    g_in: BrandGuidelineCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN])),
    org: str = Depends(get_current_org)
):
    data = g_in.model_dump()
    data["organization"] = org
    g = BrandGuideline(**data)
    db.add(g)
    db.commit()
    db.refresh(g)

    audit = AuditLog(
        user_id=current_user.id,
        action="CREATE_GUIDELINE",
        entity_type="BrandGuideline",
        entity_id=g.id,
        details=f"Created brand guideline: {g.title}"
    )
    db.add(audit)
    db.commit()
    return g

@router.put("/rules/{guideline_id}", response_model=BrandGuidelineOut)
def update_guideline(
    guideline_id: int,
    g_in: BrandGuidelineUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN])),
    org: str = Depends(get_current_org)
):
    g = db.query(BrandGuideline).filter(BrandGuideline.id == guideline_id, BrandGuideline.organization == org).first()
    if not g:
        raise HTTPException(status_code=404, detail="Guideline not found")
    
    for field, val in g_in.model_dump(exclude_unset=True).items():
        setattr(g, field, val)
    
    db.commit()
    db.refresh(g)

    audit = AuditLog(
        user_id=current_user.id,
        action="UPDATE_GUIDELINE",
        entity_type="BrandGuideline",
        entity_id=g.id,
        details=f"Updated brand guideline: {g.title}"
    )
    db.add(audit)
    db.commit()
    return g

@router.delete("/rules/{guideline_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_guideline(
    guideline_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN])),
    org: str = Depends(get_current_org)
):
    g = db.query(BrandGuideline).filter(BrandGuideline.id == guideline_id, BrandGuideline.organization == org).first()
    if not g:
        raise HTTPException(status_code=404, detail="Guideline not found")
    
    title = g.title
    db.delete(g)
    db.commit()

    audit = AuditLog(
        user_id=current_user.id,
        action="DELETE_GUIDELINE",
        entity_type="BrandGuideline",
        entity_id=guideline_id,
        details=f"Deleted brand guideline: {title}"
    )
    db.add(audit)
    db.commit()
    return None

# --- Approved Sources ---
@router.get("/sources", response_model=List[ApprovedSourceOut])
def list_sources(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    org: str = Depends(get_current_org)
):
    return db.query(ApprovedSource).filter(ApprovedSource.organization == org).order_by(ApprovedSource.id.desc()).all()

@router.post("/sources", response_model=ApprovedSourceOut, status_code=status.HTTP_201_CREATED)
def create_source(
    s_in: ApprovedSourceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN])),
    org: str = Depends(get_current_org)
):
    data = s_in.model_dump()
    data["organization"] = org
    s = ApprovedSource(**data)
    db.add(s)
    db.commit()
    db.refresh(s)

    audit = AuditLog(
        user_id=current_user.id,
        action="CREATE_SOURCE",
        entity_type="ApprovedSource",
        entity_id=s.id,
        details=f"Added approved citation source: {s.name}"
    )
    db.add(audit)
    db.commit()
    return s

@router.delete("/sources/{source_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_source(
    source_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN])),
    org: str = Depends(get_current_org)
):
    s = db.query(ApprovedSource).filter(ApprovedSource.id == source_id, ApprovedSource.organization == org).first()
    if not s:
        raise HTTPException(status_code=404, detail="Source not found")
    name = s.name
    db.delete(s)
    db.commit()

    audit = AuditLog(
        user_id=current_user.id,
        action="DELETE_SOURCE",
        entity_type="ApprovedSource",
        entity_id=source_id,
        details=f"Deleted citation source: {name}"
    )
    db.add(audit)
    db.commit()
    return None

# --- Approved Facts ---
@router.get("/facts", response_model=List[ApprovedFactOut])
def list_facts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    org: str = Depends(get_current_org)
):
    return db.query(ApprovedFact).filter(ApprovedFact.organization == org).order_by(ApprovedFact.id.desc()).all()

@router.post("/facts", response_model=ApprovedFactOut, status_code=status.HTTP_201_CREATED)
def create_fact(
    f_in: ApprovedFactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN])),
    org: str = Depends(get_current_org)
):
    data = f_in.model_dump()
    data["organization"] = org
    f = ApprovedFact(**data)
    db.add(f)
    db.commit()
    db.refresh(f)
    return f

# --- Banned Words ---
@router.get("/banned-words", response_model=List[BannedWordOut])
def list_banned_words(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    org: str = Depends(get_current_org)
):
    return db.query(BannedWord).filter(BannedWord.organization == org).order_by(BannedWord.id.desc()).all()

@router.post("/banned-words", response_model=BannedWordOut, status_code=status.HTTP_201_CREATED)
def create_banned_word(
    bw_in: BannedWordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN])),
    org: str = Depends(get_current_org)
):
    data = bw_in.model_dump()
    data["organization"] = org
    bw = BannedWord(**data)
    db.add(bw)
    db.commit()
    db.refresh(bw)

    audit = AuditLog(
        user_id=current_user.id,
        action="CREATE_BANNED_WORD",
        entity_type="BannedWord",
        entity_id=bw.id,
        details=f"Added banned term: {bw.word_or_phrase}"
    )
    db.add(audit)
    db.commit()
    return bw

@router.delete("/banned-words/{word_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_banned_word(
    word_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN])),
    org: str = Depends(get_current_org)
):
    bw = db.query(BannedWord).filter(BannedWord.id == word_id, BannedWord.organization == org).first()
    if not bw:
        raise HTTPException(status_code=404, detail="Banned word not found")
    word = bw.word_or_phrase
    db.delete(bw)
    db.commit()

    audit = AuditLog(
        user_id=current_user.id,
        action="DELETE_BANNED_WORD",
        entity_type="BannedWord",
        entity_id=word_id,
        details=f"Deleted banned term: {word}"
    )
    db.add(audit)
    db.commit()
    return None

# --- Approved Terminology ---
@router.get("/terminology", response_model=List[ApprovedTerminologyOut])
def list_terminology(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    org: str = Depends(get_current_org)
):
    return db.query(ApprovedTerminology).filter(ApprovedTerminology.organization == org).order_by(ApprovedTerminology.id.desc()).all()

@router.post("/terminology", response_model=ApprovedTerminologyOut, status_code=status.HTTP_201_CREATED)
def create_terminology(
    t_in: ApprovedTerminologyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN])),
    org: str = Depends(get_current_org)
):
    data = t_in.model_dump()
    data["organization"] = org
    t = ApprovedTerminology(**data)
    db.add(t)
    db.commit()
    db.refresh(t)
    return t

@router.delete("/terminology/{term_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_terminology(
    term_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN])),
    org: str = Depends(get_current_org)
):
    t = db.query(ApprovedTerminology).filter(ApprovedTerminology.id == term_id, ApprovedTerminology.organization == org).first()
    if not t:
        raise HTTPException(status_code=404, detail="Terminology not found")
    term = t.approved_term
    db.delete(t)
    db.commit()

    audit = AuditLog(
        user_id=current_user.id,
        action="DELETE_TERMINOLOGY",
        entity_type="ApprovedTerminology",
        entity_id=term_id,
        details=f"Deleted preferred terminology: {term}"
    )
    db.add(audit)
    db.commit()
    return None

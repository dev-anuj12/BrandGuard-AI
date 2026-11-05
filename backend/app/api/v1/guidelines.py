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
    BannedWordCreate, BannedWordUpdate, BannedWordOut,
    ApprovedTerminologyCreate, ApprovedTerminologyOut
)
from app.api.deps import get_current_user, require_roles
from app.models.user import User
from app.models.audit import AuditLog

router = APIRouter(prefix="/guidelines", tags=["Brand Knowledge Base"])

# --- Guidelines ---
@router.get("/rules", response_model=List[BrandGuidelineOut])
def list_guidelines(db: Session = Depends(get_db)):
    return db.query(BrandGuideline).order_by(BrandGuideline.id.desc()).all()

@router.post("/rules", response_model=BrandGuidelineOut, status_code=status.HTTP_201_CREATED)
def create_guideline(
    g_in: BrandGuidelineCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN]))
):
    g = BrandGuideline(**g_in.model_dump())
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
    current_user: User = Depends(require_roles([UserRole.ADMIN]))
):
    g = db.query(BrandGuideline).filter(BrandGuideline.id == guideline_id).first()
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
    current_user: User = Depends(require_roles([UserRole.ADMIN]))
):
    g = db.query(BrandGuideline).filter(BrandGuideline.id == guideline_id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Guideline not found")
    db.delete(g)
    db.commit()

    audit = AuditLog(
        user_id=current_user.id,
        action="DELETE_GUIDELINE",
        entity_type="BrandGuideline",
        entity_id=guideline_id,
        details=f"Deleted brand guideline ID {guideline_id}"
    )
    db.add(audit)
    db.commit()
    return None

# --- Approved Sources ---
@router.get("/sources", response_model=List[ApprovedSourceOut])
def list_sources(db: Session = Depends(get_db)):
    return db.query(ApprovedSource).order_by(ApprovedSource.id.desc()).all()

@router.post("/sources", response_model=ApprovedSourceOut, status_code=status.HTTP_201_CREATED)
def create_source(
    src_in: ApprovedSourceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN]))
):
    src = ApprovedSource(**src_in.model_dump())
    db.add(src)
    db.commit()
    db.refresh(src)

    audit = AuditLog(
        user_id=current_user.id,
        action="CREATE_APPROVED_SOURCE",
        entity_type="ApprovedSource",
        entity_id=src.id,
        details=f"Added approved source: {src.name} ({src.url})"
    )
    db.add(audit)
    db.commit()
    return src

@router.delete("/sources/{source_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_source(
    source_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN]))
):
    src = db.query(ApprovedSource).filter(ApprovedSource.id == source_id).first()
    if not src:
        raise HTTPException(status_code=404, detail="Source not found")
    db.delete(src)
    db.commit()
    return None

# --- Approved Facts ---
@router.get("/facts", response_model=List[ApprovedFactOut])
def list_facts(db: Session = Depends(get_db)):
    facts = db.query(ApprovedFact).order_by(ApprovedFact.id.desc()).all()
    results = []
    for f in facts:
        f_out = ApprovedFactOut.model_validate(f)
        if f.source:
            f_out.source_name = f.source.name
        results.append(f_out)
    return results

@router.post("/facts", response_model=ApprovedFactOut, status_code=status.HTTP_201_CREATED)
def create_fact(
    f_in: ApprovedFactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN]))
):
    fact = ApprovedFact(**f_in.model_dump())
    db.add(fact)
    db.commit()
    db.refresh(fact)
    return fact

# --- Banned Words ---
@router.get("/banned-words", response_model=List[BannedWordOut])
def list_banned_words(db: Session = Depends(get_db)):
    return db.query(BannedWord).order_by(BannedWord.id.desc()).all()

@router.post("/banned-words", response_model=BannedWordOut, status_code=status.HTTP_201_CREATED)
def create_banned_word(
    bw_in: BannedWordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN]))
):
    # Case-insensitive duplicate check
    existing = db.query(BannedWord).filter(BannedWord.word_or_phrase.ilike(bw_in.word_or_phrase)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Banned word or phrase already exists.")
    
    bw = BannedWord(**bw_in.model_dump())
    db.add(bw)
    db.commit()
    db.refresh(bw)

    audit = AuditLog(
        user_id=current_user.id,
        action="CREATE_BANNED_WORD",
        entity_type="BannedWord",
        entity_id=bw.id,
        details=f"Added banned term: '{bw.word_or_phrase}'"
    )
    db.add(audit)
    db.commit()
    return bw

@router.delete("/banned-words/{word_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_banned_word(
    word_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN]))
):
    bw = db.query(BannedWord).filter(BannedWord.id == word_id).first()
    if not bw:
        raise HTTPException(status_code=404, detail="Banned word not found")
    db.delete(bw)
    db.commit()
    return None

# --- Approved Terminology ---
@router.get("/terminology", response_model=List[ApprovedTerminologyOut])
def list_terminology(db: Session = Depends(get_db)):
    return db.query(ApprovedTerminology).order_by(ApprovedTerminology.id.desc()).all()

@router.post("/terminology", response_model=ApprovedTerminologyOut, status_code=status.HTTP_201_CREATED)
def create_terminology(
    term_in: ApprovedTerminologyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN]))
):
    term = ApprovedTerminology(**term_in.model_dump())
    db.add(term)
    db.commit()
    db.refresh(term)
    return term

@router.delete("/terminology/{term_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_terminology(
    term_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN]))
):
    term = db.query(ApprovedTerminology).filter(ApprovedTerminology.id == term_id).first()
    if not term:
        raise HTTPException(status_code=404, detail="Terminology rule not found")
    db.delete(term)
    db.commit()
    return None

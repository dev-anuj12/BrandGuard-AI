from typing import List, Optional, Any
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database.session import get_db
from app.api.deps import get_current_user
from app.models.threat import ThreatItem, BrandProduct, BrandAsset
from app.models.enums import ThreatCategory, ThreatRiskLevel, ThreatStatus
from app.schemas.threat import BrandProductOut, BrandAssetOut, ThreatItemOut
from app.protection.counterfeit_analyzer import CounterfeitAnalyzer, LogoMisuseAnalyzer

router = APIRouter(prefix="/protection/products", tags=["Digital Protection - Counterfeit & Brand Assets"], dependencies=[Depends(get_current_user)])


class ProductListingScanRequest(BaseModel):
    marketplace: str
    listing_title: str
    listing_url: str
    seller_name: str
    listed_price: float
    sku_or_product_id: Optional[str] = None
    description: Optional[str] = None
    auto_create_threat: bool = True


class LogoAssetScanRequest(BaseModel):
    partner_name: str
    host_url: str
    asset_name: str
    has_written_authorization: bool = False
    is_aspect_ratio_altered: bool = False
    is_color_palette_modified: bool = False
    missing_trademark_symbol: bool = False
    placed_on_unauthorized_collateral: bool = False
    auto_create_threat: bool = True


@router.post("/scan", status_code=status.HTTP_201_CREATED)
def scan_product_listing(
    payload: ProductListingScanRequest,
    db: Session = Depends(get_db)
):
    """
    Evaluates marketplace listing for counterfeit indicators, severe price undercutting,
    unauthorized sellers, and fake product claims.
    """
    if not payload.listing_title or not payload.listing_title.strip():
        raise HTTPException(status_code=400, detail="Listing title is required.")

    analyzer = CounterfeitAnalyzer()
    try:
        report = analyzer.analyze_and_record(
            db=db,
            marketplace=payload.marketplace,
            listing_title=payload.listing_title,
            listing_url=payload.listing_url,
            seller_name=payload.seller_name,
            listed_price=payload.listed_price,
            sku_or_product_id=payload.sku_or_product_id,
            description=payload.description,
            auto_create_threat=payload.auto_create_threat
        )
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Listing analysis failed: {str(e)}")


@router.post("/logo/scan", status_code=status.HTTP_201_CREATED)
def scan_logo_misuse(
    payload: LogoAssetScanRequest,
    db: Session = Depends(get_db)
):
    """
    Evaluates brand logo and trademark usage against guidelines and partner agreements.
    """
    if not payload.partner_name or not payload.partner_name.strip():
        raise HTTPException(status_code=400, detail="Partner name is required.")

    analyzer = LogoMisuseAnalyzer()
    try:
        report = analyzer.analyze_and_record_asset(
            db=db,
            partner_name=payload.partner_name,
            host_url=payload.host_url,
            asset_name=payload.asset_name,
            has_written_authorization=payload.has_written_authorization,
            is_aspect_ratio_altered=payload.is_aspect_ratio_altered,
            is_color_palette_modified=payload.is_color_palette_modified,
            missing_trademark_symbol=payload.missing_trademark_symbol,
            placed_on_unauthorized_collateral=payload.placed_on_unauthorized_collateral,
            auto_create_threat=payload.auto_create_threat
        )
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Logo misuse analysis failed: {str(e)}")


@router.get("/catalog", response_model=List[BrandProductOut])
def get_brand_product_catalog(db: Session = Depends(get_db)):
    """
    Returns official brand products and authorized distributor guidelines.
    """
    return db.query(BrandProduct).all()


@router.get("/assets", response_model=List[BrandAssetOut])
def get_brand_asset_catalog(db: Session = Depends(get_db)):
    """
    Returns registered brand visual assets and perceptual signatures.
    """
    return db.query(BrandAsset).all()


@router.get("/threats", response_model=List[ThreatItemOut])
def list_counterfeit_threats(
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Lists counterfeit product listings and unauthorized logo misuse threats.
    """
    return (
        db.query(ThreatItem)
        .filter(ThreatItem.category.in_([
            ThreatCategory.COUNTERFEIT_PRODUCT,
            ThreatCategory.UNAUTHORIZED_LOGO
        ]))
        .order_by(desc(ThreatItem.detected_at))
        .limit(limit)
        .all()
    )


@router.get("/stats")
def get_counterfeit_stats(db: Session = Depends(get_db)):
    """
    Returns aggregate stats for counterfeit and logo threats.
    """
    counterfeits = db.query(ThreatItem).filter(
        ThreatItem.category.in_([
            ThreatCategory.COUNTERFEIT_PRODUCT,
            ThreatCategory.UNAUTHORIZED_LOGO
        ])
    ).all()

    total = len(counterfeits)
    critical_high = len([t for t in counterfeits if t.risk_level in (ThreatRiskLevel.CRITICAL, ThreatRiskLevel.HIGH)])
    resolved = len([t for t in counterfeits if t.status == ThreatStatus.RESOLVED])
    products_count = db.query(BrandProduct).count()
    assets_count = db.query(BrandAsset).count()

    return {
        "total_counterfeit_threats": total,
        "critical_high_threats": critical_high,
        "takedowns_resolved": resolved,
        "registered_products": products_count,
        "registered_brand_assets": assets_count
    }


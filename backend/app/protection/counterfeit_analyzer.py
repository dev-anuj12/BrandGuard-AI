import json
import datetime
from datetime import timezone
from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session

from app.models.threat import ThreatItem, ThreatEvidence, BrandProduct, BrandAsset
from app.models.enums import ThreatCategory, ThreatRiskLevel, ThreatStatus

COUNTERFEIT_PHRASES = [
    ("replica", 40.0, "Listing explicitly claims to be a replica copy"),
    ("1:1 copy", 45.0, "Explicit clone/counterfeit marketing term '1:1 copy'"),
    ("oem factory surplus", 35.0, "Common counterfeit pretext 'OEM factory surplus'"),
    ("mirror quality", 40.0, "Counterfeit marketing term 'mirror quality'"),
    ("unauthorized authentic", 35.0, "Counterfeit descriptor 'unauthorized authentic'"),
    ("no box", 20.0, "Sold without official authenticated packaging"),
    ("refurbished like new", 15.0, "Uncertified refurbished claim"),
    ("guaranteed 100% clone", 50.0, "Overt counterfeit confession")
]


class CounterfeitAnalyzer:
    """
    Intelligent Counterfeit Product & Unauthorized Marketplace Listing Analyzer.
    Detects severe price deviations, unauthorized seller distribution,
    counterfeit terminology, and unauthorized brand asset misrepresentations.
    """

    def analyze_listing(
        self,
        db: Session,
        marketplace: str,
        listing_title: str,
        listing_url: str,
        seller_name: str,
        listed_price: float,
        sku_or_product_id: Optional[str] = None,
        description: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Evaluates a marketplace listing against official product catalog and distributor lists.
        """
        # Lookup product in BrandProduct catalog
        product = None
        if sku_or_product_id:
            product = db.query(BrandProduct).filter(
                (BrandProduct.sku == sku_or_product_id) |
                (BrandProduct.product_name.ilike(f"%{sku_or_product_id}%"))
            ).first()

        if not product:
            # Fuzzy match by title
            all_products = db.query(BrandProduct).all()
            for p in all_products:
                if p.product_name.lower() in listing_title.lower() or p.sku.lower() in listing_title.lower():
                    product = p
                    break

        # Fallback reference price if unknown product
        official_msrp = product.official_msrp if product else 199.99
        matched_product_name = product.product_name if product else "BrandGuard SecureKey Token (Inferred)"
        matched_sku = product.sku if product else "BG-SEC-01"

        authorized_distributors = []
        if product and product.authorized_distributors:
            try:
                authorized_distributors = json.loads(product.authorized_distributors)
            except Exception:
                authorized_distributors = [product.authorized_distributors]

        findings = []
        base_risk_score = 0.0

        # Step 1: Price Disparity Calculation
        price_disparity_pct = 0.0
        if official_msrp > 0:
            price_disparity_pct = round(((official_msrp - listed_price) / official_msrp) * 100.0, 1)

        if price_disparity_pct >= 60.0:
            base_risk_score += 45.0
            findings.append({
                "rule_id": "PROD-PRICE-DISPARITY-001",
                "severity": "CRITICAL",
                "title": f"Extreme Price Undercutting ({price_disparity_pct}% Below MSRP)",
                "description": f"Listing price of ${listed_price:.2f} is drastically below the official manufacturer MSRP (${official_msrp:.2f}). Severe counterfeit indicator.",
                "evidence": f"Listed: ${listed_price:.2f} vs MSRP: ${official_msrp:.2f} (Disparity: {price_disparity_pct}%)",
                "recommendation": "File marketplace counterfeit IP infringement takedown."
            })
        elif price_disparity_pct >= 35.0:
            base_risk_score += 25.0
            findings.append({
                "rule_id": "PROD-PRICE-DISPARITY-002",
                "severity": "HIGH",
                "title": f"Significant Price Deviation ({price_disparity_pct}% Below MSRP)",
                "description": f"Price is significantly below authorized dealer minimum advertised price (MAP).",
                "evidence": f"Listed: ${listed_price:.2f} vs MAP benchmark ${official_msrp * 0.85:.2f}",
                "recommendation": "Issue MAP policy violation inquiry or distributor audit."
            })

        # Step 2: Seller Authorization Check
        is_official_brand = any(
            token in seller_name.lower() 
            for token in ["brandguard official", "official brandguard", "brandguard web", "brandguard technologies", "brandguard mobile"]
        )
        is_authorized_seller = is_official_brand or any(
            seller_name.lower() == auth.lower() or auth.lower() in seller_name.lower() 
            for auth in authorized_distributors
        )

        if not is_authorized_seller:
            base_risk_score += 30.0
            findings.append({
                "rule_id": "PROD-UNAUTHORIZED-SELLER-003",
                "severity": "HIGH",
                "title": "Unauthorized Third-Party Marketplace Vendor",
                "description": f"Merchant '{seller_name}' is not an authorized distributor or licensed retail partner for {matched_product_name}.",
                "evidence": f"Seller: '{seller_name}' not in authorized distributor list: {authorized_distributors}",
                "recommendation": "Demand proof of origin / authorized supply chain documentation."
            })
        else:
            findings.append({
                "rule_id": "PROD-AUTHORIZED-SELLER-004",
                "severity": "INFO",
                "title": "Verified Authorized Retail Partner",
                "description": f"Merchant '{seller_name}' matches verified distribution partner agreement.",
                "evidence": f"Matched distributor: {seller_name}",
                "recommendation": "Legitimate channel. Maintain standard quality monitoring."
            })

        # Step 3: Counterfeit Phraseology Detection in Description
        desc_text = (description or "") + " " + listing_title
        found_phrases = []
        for phrase, weight, desc in COUNTERFEIT_PHRASES:
            if phrase in desc_text.lower():
                found_phrases.append(phrase)
                base_risk_score += weight
                findings.append({
                    "rule_id": "PROD-COUNTERFEIT-TERM-005",
                    "severity": "CRITICAL" if weight >= 40 else "HIGH",
                    "title": f"Counterfeit Descriptor Detected ('{phrase}')",
                    "description": desc,
                    "evidence": f"Detected descriptor '{phrase}' in listing text",
                    "recommendation": "Submit urgent listing takedown to marketplace trust & safety team."
                })

        # Step 4: Final Risk Score
        risk_score = min(100.0, max(0.0, round(base_risk_score, 1)))

        if risk_score >= 80.0:
            risk_level = ThreatRiskLevel.CRITICAL
            recommended_action = f"IMMEDIATE TAKEDOWN: Issue Notice of Counterfeit Trademark Infringement to {marketplace} Legal. Notify regional customs / border enforcement."
        elif risk_score >= 60.0:
            risk_level = ThreatRiskLevel.HIGH
            recommended_action = f"ENFORCEMENT: File marketplace unauthorized reseller and copyright infringement report with {marketplace} Brand Registry."
        elif risk_score >= 40.0:
            risk_level = ThreatRiskLevel.MEDIUM
            recommended_action = "INVESTIGATION: Place test purchase order to authenticate product physical hardware and serial numbers."
        elif risk_score >= 20.0:
            risk_level = ThreatRiskLevel.LOW
            recommended_action = "MONITOR: Track price changes and vendor inventory levels."
        else:
            risk_level = ThreatRiskLevel.INFO
            recommended_action = "AUTHORIZED ASSET: Verified authentic distributor listing."

        return {
            "marketplace": marketplace,
            "listing_title": listing_title,
            "listing_url": listing_url,
            "seller_name": seller_name,
            "is_authorized_seller": is_authorized_seller,
            "matched_product": matched_product_name,
            "matched_sku": matched_sku,
            "official_msrp": official_msrp,
            "listed_price": listed_price,
            "price_disparity_pct": price_disparity_pct,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "findings": findings,
            "recommended_action": recommended_action
        }

    def analyze_and_record(
        self,
        db: Session,
        marketplace: str,
        listing_title: str,
        listing_url: str,
        seller_name: str,
        listed_price: float,
        sku_or_product_id: Optional[str] = None,
        description: Optional[str] = None,
        auto_create_threat: bool = True
    ) -> Dict[str, Any]:
        """
        Analyzes listing and automatically registers ThreatItem if risk >= 60.0.
        """
        analysis = self.analyze_listing(
            db=db,
            marketplace=marketplace,
            listing_title=listing_title,
            listing_url=listing_url,
            seller_name=seller_name,
            listed_price=listed_price,
            sku_or_product_id=sku_or_product_id,
            description=description
        )

        threat_id = None
        threat_code = None

        if auto_create_threat and analysis["risk_score"] >= 60.0:
            existing = db.query(ThreatItem).filter(
                (ThreatItem.source_url == listing_url) |
                (ThreatItem.title.contains(listing_title[:40]))
            ).first()

            if existing:
                threat_id = existing.id
                threat_code = existing.threat_code
            else:
                year = datetime.datetime.now(timezone.utc).year
                count = db.query(ThreatItem).count() + 1
                threat_code = f"THR-{year}-{count:03d}"

                new_threat = ThreatItem(
                    threat_code=threat_code,
                    category=ThreatCategory.COUNTERFEIT_PRODUCT,
                    title=f"Counterfeit Listing: {marketplace} - {listing_title[:60]}",
                    source_url=listing_url,
                    target_brand="BrandGuard Demo Enterprise",
                    risk_level=analysis["risk_level"],
                    confidence_score=analysis["risk_score"],
                    status=ThreatStatus.UNDER_INVESTIGATION,
                    explanation=(
                        f"Marketplace listing on {marketplace} offers {analysis['matched_product']} at ${listed_price:.2f} "
                        f"({analysis['price_disparity_pct']}% under MSRP ${analysis['official_msrp']:.2f}) by unauthorized seller '{seller_name}'."
                    ),
                    recommended_action=analysis["recommended_action"],
                    detected_at=datetime.datetime.now(timezone.utc)
                )
                db.add(new_threat)
                db.flush()
                threat_id = new_threat.id

                evidence_payload = {
                    "marketplace": marketplace,
                    "seller": seller_name,
                    "listed_price": listed_price,
                    "official_msrp": analysis["official_msrp"],
                    "disparity": analysis["price_disparity_pct"],
                    "findings": analysis["findings"]
                }
                evidence = ThreatEvidence(
                    threat_id=new_threat.id,
                    evidence_type="COUNTERFEIT_LISTING_METRICS",
                    data_payload=json.dumps(evidence_payload),
                    created_at=datetime.datetime.now(timezone.utc)
                )
                db.add(evidence)
                db.commit()

        analysis["threat_id"] = threat_id
        analysis["threat_code"] = threat_code
        return analysis


class LogoMisuseAnalyzer:
    """
    Intelligent Brand Asset & Logo Misuse Analyzer.
    Detects unauthorized logo placement, color alteration, aspect ratio stretching,
    missing registered trademark designations, and unapproved partner badge usage.
    """

    def analyze_asset_usage(
        self,
        db: Session,
        partner_name: str,
        host_url: str,
        asset_name: str,
        has_written_authorization: bool = False,
        is_aspect_ratio_altered: bool = False,
        is_color_palette_modified: bool = False,
        missing_trademark_symbol: bool = False,
        placed_on_unauthorized_collateral: bool = False
    ) -> Dict[str, Any]:
        """
        Evaluates digital logo / asset usage compliance.
        """
        findings = []
        base_risk_score = 0.0

        if not has_written_authorization:
            base_risk_score += 45.0
            findings.append({
                "rule_id": "LOGO-UNAUTHORIZED-001",
                "severity": "CRITICAL",
                "title": "Unlicensed Commercial Logo Display",
                "description": f"Partner '{partner_name}' has no active trademark license or signed Brand Partner Agreement authorizing public display of '{asset_name}'.",
                "evidence": f"Partner: {partner_name}, License Status: None, Host: {host_url}",
                "recommendation": "Dispatch Cease & Desist demand letter and copyright takedown notice."
            })
        else:
            findings.append({
                "rule_id": "LOGO-AUTHORIZED-002",
                "severity": "INFO",
                "title": "Authorized Partner Trademark License",
                "description": f"Partner '{partner_name}' holds valid co-branding authorization.",
                "evidence": f"License: Verified Active for {partner_name}",
                "recommendation": "Trademark licensing verified."
            })

        if is_color_palette_modified:
            base_risk_score += 25.0
            findings.append({
                "rule_id": "LOGO-COLOR-ALTERATION-003",
                "severity": "HIGH",
                "title": "Brand Guidelines Color Palette Violation",
                "description": "Logo colors deviate from corporate brand standards (Mandatory: Brand Blue #0052FF, Slate #0B0F19).",
                "evidence": "Modified fill/stroke colors detected on asset",
                "recommendation": "Provide official SVG brand asset kit and require asset replacement."
            })

        if is_aspect_ratio_altered:
            base_risk_score += 20.0
            findings.append({
                "rule_id": "LOGO-ASPECT-RATIO-004",
                "severity": "MEDIUM",
                "title": "Distorted Aspect Ratio / Stretched Mark",
                "description": "Asset has been non-proportionally scaled or skewed, violating brand integrity rules.",
                "evidence": "Aspect ratio distortion detected",
                "recommendation": "Enforce strict locked aspect ratio in partner guidelines."
            })

        if missing_trademark_symbol:
            base_risk_score += 15.0
            findings.append({
                "rule_id": "LOGO-TRADEMARK-SYMBOL-005",
                "severity": "LOW",
                "title": "Missing Mandatory Trademark Notice (® / ™)",
                "description": "Commercial collateral omits required registered trademark attribution symbol.",
                "evidence": "Trademark designation omitted",
                "recommendation": "Require addition of ® symbol to primary emblem."
            })

        if placed_on_unauthorized_collateral:
            base_risk_score += 35.0
            findings.append({
                "rule_id": "LOGO-UNAPPROVED-PRODUCT-006",
                "severity": "CRITICAL",
                "title": "Placement on High-Risk / Prohibited Product Category",
                "description": "Brand logo affixed to unvetted predatory lending, gambling, or high-risk financial instruments.",
                "evidence": f"Detected collateral on host: {host_url}",
                "recommendation": "Immediate legal escalation to preserve brand reputation."
            })

        risk_score = min(100.0, max(0.0, round(base_risk_score, 1)))

        if risk_score >= 80.0:
            risk_level = ThreatRiskLevel.CRITICAL
            recommended_action = "LEGAL ESCALATION: Serve immediate Cease & Desist letter. File DMCA copyright takedown notice."
        elif risk_score >= 60.0:
            risk_level = ThreatRiskLevel.HIGH
            recommended_action = "COMPLIANCE NOTICE: Demand immediate removal of unauthorized brand assets within 48 hours."
        elif risk_score >= 40.0:
            risk_level = ThreatRiskLevel.MEDIUM
            recommended_action = "BRAND RECTIFICATION: Request partner update asset to approved brand guideline kit."
        elif risk_score >= 20.0:
            risk_level = ThreatRiskLevel.LOW
            recommended_action = "MINOR ADVISORY: Remind partner to maintain standard trademark symbols."
        else:
            risk_level = ThreatRiskLevel.INFO
            recommended_action = "COMPLIANT: Asset usage satisfies brand guidelines."

        return {
            "partner_name": partner_name,
            "host_url": host_url,
            "asset_name": asset_name,
            "has_written_authorization": has_written_authorization,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "findings": findings,
            "recommended_action": recommended_action
        }

    def analyze_and_record_asset(
        self,
        db: Session,
        partner_name: str,
        host_url: str,
        asset_name: str,
        has_written_authorization: bool = False,
        is_aspect_ratio_altered: bool = False,
        is_color_palette_modified: bool = False,
        missing_trademark_symbol: bool = False,
        placed_on_unauthorized_collateral: bool = False,
        auto_create_threat: bool = True
    ) -> Dict[str, Any]:
        """
        Analyzes logo usage and automatically creates ThreatItem if risk >= 60.0.
        """
        analysis = self.analyze_asset_usage(
            db=db,
            partner_name=partner_name,
            host_url=host_url,
            asset_name=asset_name,
            has_written_authorization=has_written_authorization,
            is_aspect_ratio_altered=is_aspect_ratio_altered,
            is_color_palette_modified=is_color_palette_modified,
            missing_trademark_symbol=missing_trademark_symbol,
            placed_on_unauthorized_collateral=placed_on_unauthorized_collateral
        )

        threat_id = None
        threat_code = None

        if auto_create_threat and analysis["risk_score"] >= 60.0:
            existing = db.query(ThreatItem).filter(
                (ThreatItem.source_url == host_url) |
                (ThreatItem.title.contains(partner_name))
            ).first()

            if existing:
                threat_id = existing.id
                threat_code = existing.threat_code
            else:
                year = datetime.datetime.now(timezone.utc).year
                count = db.query(ThreatItem).count() + 1
                threat_code = f"THR-{year}-{count:03d}"

                new_threat = ThreatItem(
                    threat_code=threat_code,
                    category=ThreatCategory.UNAUTHORIZED_LOGO,
                    title=f"Unauthorized Logo Misuse: {partner_name}",
                    source_url=host_url,
                    target_brand="BrandGuard Demo Enterprise",
                    risk_level=analysis["risk_level"],
                    confidence_score=analysis["risk_score"],
                    status=ThreatStatus.UNDER_INVESTIGATION,
                    explanation=(
                        f"Entity '{partner_name}' is displaying '{asset_name}' at {host_url} without active trademark authorization. "
                        f"Calculated risk: {analysis['risk_score']}%. Primary violation: {analysis['findings'][0]['title']}."
                    ),
                    recommended_action=analysis["recommended_action"],
                    detected_at=datetime.datetime.now(timezone.utc)
                )
                db.add(new_threat)
                db.flush()
                threat_id = new_threat.id

                evidence_payload = {
                    "partner": partner_name,
                    "host": host_url,
                    "asset": asset_name,
                    "findings": analysis["findings"]
                }
                evidence = ThreatEvidence(
                    threat_id=new_threat.id,
                    evidence_type="LOGO_MISUSE_METRICS",
                    data_payload=json.dumps(evidence_payload),
                    created_at=datetime.datetime.now(timezone.utc)
                )
                db.add(evidence)
                db.commit()

        analysis["threat_id"] = threat_id
        analysis["threat_code"] = threat_code
        return analysis


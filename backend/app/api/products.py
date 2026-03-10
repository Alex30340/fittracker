from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc
from pydantic import BaseModel, Field
from app.database import get_db
from app.models import Product, Offer, Review, ProductComment, UserFavorite, ProductCategory, PriceHistory, User
from app.core.security import get_current_user

router = APIRouter(prefix="/products", tags=["products"])


# --- Schemas ---

class ProductOut(BaseModel):
    id: int
    name: str
    brand: Optional[str]
    type_whey: str
    category_name: Optional[str] = None
    proteines_100g: Optional[float]
    score_final: Optional[float]
    score_proteique: Optional[float]
    score_sante: Optional[float]
    image_url: Optional[str]
    best_price: Optional[float] = None
    best_price_per_kg: Optional[float] = None
    is_available: bool = False
    reviews_count: int = 0
    reviews_avg: Optional[float] = None

    class Config:
        from_attributes = True


class CommentCreate(BaseModel):
    content: str = Field(min_length=1, max_length=2000)
    parent_id: Optional[int] = None


class CommentOut(BaseModel):
    id: int
    user_display_name: str
    content: str
    parent_id: Optional[int]
    likes_count: int
    created_at: str


class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    title: Optional[str] = None
    comment: Optional[str] = None


# --- Routes ---

@router.get("/categories")
def list_categories(db: Session = Depends(get_db)):
    cats = db.query(ProductCategory).order_by(ProductCategory.sort_order).all()
    return [{"id": c.id, "slug": c.slug, "name": c.name, "icon": c.icon, "description": c.description} for c in cats]


@router.get("", response_model=List[ProductOut])
def list_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "score_final",
    min_score: Optional[float] = None,
    min_protein: Optional[float] = None,
    max_price_kg: Optional[float] = None,
    type_whey: Optional[str] = None,
    in_stock_only: bool = False,
    page: int = 1,
    per_page: int = 20,
    db: Session = Depends(get_db),
):
    query = db.query(Product).filter(Product.is_active == True)

    # Filters
    if category:
        query = query.join(ProductCategory).filter(ProductCategory.slug == category)
    if search:
        query = query.filter(
            (Product.name.ilike(f"%{search}%")) | (Product.brand.ilike(f"%{search}%"))
        )
    if type_whey:
        query = query.filter(Product.type_whey == type_whey)
    if min_score:
        query = query.filter(Product.score_final >= min_score)
    if min_protein:
        query = query.filter(Product.proteines_100g >= min_protein)

    # Sort
    sort_map = {
        "score_final": desc(Product.score_final),
        "name": Product.name,
        "brand": Product.brand,
        "protein": desc(Product.proteines_100g),
        "newest": desc(Product.created_at),
    }
    query = query.order_by(sort_map.get(sort_by, desc(Product.score_final)))

    # Paginate
    products = query.offset((page - 1) * per_page).limit(per_page).all()

    # Enrich with offer data
    result = []
    for p in products:
        active_offers = db.query(Offer).filter(
            Offer.product_id == p.id, Offer.is_active == True
        ).all()
        
        best_price = min((o.prix for o in active_offers if o.prix), default=None)
        best_ppk = min((o.prix_par_kg for o in active_offers if o.prix_par_kg), default=None)
        available = any(o.disponibilite == "InStock" for o in active_offers)

        if in_stock_only and not available:
            continue
        if max_price_kg and best_ppk and best_ppk > max_price_kg:
            continue

        reviews = db.query(func.count(Review.id), func.avg(Review.rating)).filter(
            Review.product_id == p.id, Review.is_hidden == False
        ).first()

        cat_name = p.category.name if p.category else None

        result.append(ProductOut(
            id=p.id, name=p.name, brand=p.brand, type_whey=p.type_whey,
            category_name=cat_name,
            proteines_100g=p.proteines_100g,
            score_final=p.score_final, score_proteique=p.score_proteique, score_sante=p.score_sante,
            image_url=p.image_url,
            best_price=best_price, best_price_per_kg=best_ppk, is_available=available,
            reviews_count=reviews[0] or 0,
            reviews_avg=round(reviews[1], 1) if reviews[1] else None,
        ))

    return result


@router.get("/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produit introuvable")

    offers = db.query(Offer).filter(Offer.product_id == product_id, Offer.is_active == True).all()
    reviews_agg = db.query(func.count(Review.id), func.avg(Review.rating)).filter(
        Review.product_id == product_id, Review.is_hidden == False
    ).first()

    price_hist = db.query(PriceHistory).filter(
        PriceHistory.product_id == product_id
    ).order_by(desc(PriceHistory.recorded_at)).limit(30).all()

    return {
        "id": product.id,
        "name": product.name,
        "brand": product.brand,
        "type_whey": product.type_whey,
        "proteines_100g": product.proteines_100g,
        "kcal_per_100g": product.kcal_per_100g,
        "carbs_per_100g": product.carbs_per_100g,
        "fat_per_100g": product.fat_per_100g,
        "ingredients": product.ingredients,
        "ingredient_count": product.ingredient_count,
        "has_sucralose": product.has_sucralose,
        "has_acesulfame_k": product.has_acesulfame_k,
        "has_aspartame": product.has_aspartame,
        "bcaa_per_100g_prot": product.bcaa_per_100g_prot,
        "leucine_g": product.leucine_g,
        "has_aminogram": product.has_aminogram,
        "origin_label": product.origin_label,
        "made_in_france": product.made_in_france,
        "score_final": product.score_final,
        "score_proteique": product.score_proteique,
        "score_sante": product.score_sante,
        "image_url": product.image_url,
        "reviews_count": reviews_agg[0] or 0,
        "reviews_avg": round(reviews_agg[1], 1) if reviews_agg[1] else None,
        "offers": [
            {"id": o.id, "merchant": o.merchant, "url": o.url, "prix": o.prix,
             "poids_kg": o.poids_kg, "prix_par_kg": o.prix_par_kg,
             "disponibilite": o.disponibilite}
            for o in offers
        ],
        "price_history": [
            {"prix": ph.prix, "prix_par_kg": ph.prix_par_kg, "date": ph.recorded_at.isoformat()}
            for ph in price_hist
        ],
    }


@router.get("/{product_id}/comments", response_model=List[CommentOut])
def get_comments(product_id: int, db: Session = Depends(get_db)):
    comments = (
        db.query(ProductComment, User.display_name)
        .join(User, ProductComment.user_id == User.id)
        .filter(ProductComment.product_id == product_id, ProductComment.is_hidden == False)
        .order_by(desc(ProductComment.created_at))
        .all()
    )
    return [
        CommentOut(
            id=c.id, user_display_name=name, content=c.content,
            parent_id=c.parent_id, likes_count=c.likes_count,
            created_at=c.created_at.isoformat(),
        )
        for c, name in comments
    ]


@router.post("/{product_id}/comments", response_model=CommentOut, status_code=201)
def add_comment(
    product_id: int,
    req: CommentCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produit introuvable")

    comment = ProductComment(
        product_id=product_id,
        user_id=user.id,
        content=req.content,
        parent_id=req.parent_id,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    # Check achievements
    from app.services.achievement_service import check_and_award
    check_and_award(db, user.id, action="community")
    db.commit()

    return CommentOut(
        id=comment.id, user_display_name=user.display_name, content=comment.content,
        parent_id=comment.parent_id, likes_count=0, created_at=comment.created_at.isoformat(),
    )


@router.post("/{product_id}/favorite")
def toggle_favorite(product_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(UserFavorite).filter(
        UserFavorite.user_id == user.id, UserFavorite.product_id == product_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"is_favorite": False}
    else:
        fav = UserFavorite(user_id=user.id, product_id=product_id)
        db.add(fav)
        db.commit()
        # Check achievements
        from app.services.achievement_service import check_and_award
        check_and_award(db, user.id, action="product")
        db.commit()
        return {"is_favorite": True}


@router.get("/compare")
def compare_products(ids: str = Query(..., description="Comma-separated product IDs"), db: Session = Depends(get_db)):
    product_ids = [int(x.strip()) for x in ids.split(",") if x.strip().isdigit()]
    if len(product_ids) < 2 or len(product_ids) > 5:
        raise HTTPException(status_code=400, detail="2 à 5 produits requis")

    products = db.query(Product).filter(Product.id.in_(product_ids)).all()
    result = []
    for p in products:
        best_offer = db.query(Offer).filter(
            Offer.product_id == p.id, Offer.is_active == True, Offer.prix != None
        ).order_by(Offer.prix).first()

        result.append({
            "id": p.id, "name": p.name, "brand": p.brand, "type_whey": p.type_whey,
            "proteines_100g": p.proteines_100g,
            "score_final": p.score_final, "score_proteique": p.score_proteique, "score_sante": p.score_sante,
            "image_url": p.image_url,
            "best_price": best_offer.prix if best_offer else None,
            "best_price_per_kg": best_offer.prix_par_kg if best_offer else None,
            "ingredients": p.ingredients,
            "has_sucralose": p.has_sucralose, "has_acesulfame_k": p.has_acesulfame_k,
            "origin_label": p.origin_label,
        })

    return result

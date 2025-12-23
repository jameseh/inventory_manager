from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import require_admin
from app.models.item import InventoryItem
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.item import ItemCreate, ItemUpdate, ItemResponse

router = APIRouter()

# Anyone can read items
from sqlalchemy import or_

@router.get("/items", response_model=list[ItemResponse])
def list_items(q: str = None, db: Session = Depends(get_db)):
    query = db.query(InventoryItem)
    if q:
        search = f"%{q}%"
        query = query.filter(or_(InventoryItem.name.ilike(search), InventoryItem.category.ilike(search)))
    return query.all()

@router.get("/categories", response_model=list[str])
def get_categories(db: Session = Depends(get_db)):
    # Get distinct categories
    categories = db.query(InventoryItem.category).distinct().all()
    # categories is a list of tuples like [('Misc',), ('Hardware',)]
    return sorted([c[0] for c in categories if c[0]])

@router.get("/items/{item_id}", response_model=ItemResponse)
def get_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(404, "Item not found")
    return item

# Admin only: create item
import json

# ...

@router.post("/items", response_model=ItemResponse)
def create_item(
    data: ItemCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin)
):
    item_data = data.dict()
    if "attachments" in item_data:
        item_data["attachments"] = json.dumps(item_data["attachments"])
    
    item = InventoryItem(**item_data)
    db.add(item)
    db.commit()
    db.refresh(item)
    
    # Log transaction
    tx = Transaction(
        item_id=item.id,
        user_id=user.id,
        transaction_type="CREATE",
        amount=item.stock,
        notes="Item created"
    )
    db.add(tx)
    db.commit()

    return item

# Admin only: update item
@router.put("/items/{item_id}", response_model=ItemResponse)
def update_item(
    item_id: int,
    data: ItemUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin)
):
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(404, "Item not found")

    for field, value in data.dict(exclude_unset=True).items():
        if field == "attachments" and isinstance(value, list):
            value = json.dumps(value)
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return item

# Admin only: delete item
@router.delete("/items/{item_id}")
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin)
):
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(404, "Item not found")

    db.delete(item)
    db.commit()
    return {"message": "Item deleted"}

# Admin only: add stock
@router.post("/items/{item_id}/add/{amount}", response_model=ItemResponse)
def add_stock(
    item_id: int,
    amount: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin)
):
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(404, "Item not found")

    item.stock += amount
    
    # Log transaction
    tx = Transaction(
        item_id=item.id,
        user_id=user.id,
        transaction_type="ADD_STOCK",
        amount=amount,
        notes="Stock added manually"
    )
    db.add(tx)
    
    db.commit()
    db.refresh(item)
    return item

# Admin only: remove stock
@router.post("/items/{item_id}/remove/{amount}", response_model=ItemResponse)
def remove_stock(
    item_id: int,
    amount: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin)
):
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(404, "Item not found")

    if item.stock - amount < 0:
        raise HTTPException(400, "Not enough stock")

    item.stock -= amount
    
    # Log transaction
    tx = Transaction(
        item_id=item.id,
        user_id=user.id,
        transaction_type="REMOVE_STOCK",
        amount=amount,
        notes="Stock removed manually"
    )
    db.add(tx)

    db.commit()
    db.refresh(item)
    return item

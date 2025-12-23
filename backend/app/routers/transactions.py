from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.transaction import Transaction
from app.models.user import User
from app.models.item import InventoryItem
from app.schemas.transaction import TransactionResponse
from typing import List

router = APIRouter()

@router.get("/transactions", response_model=List[TransactionResponse])
def list_transactions(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    transactions = db.query(Transaction).order_by(Transaction.timestamp.desc()).offset(skip).limit(limit).all()
    
    # Enrich with details if needed (though IDs are often enough if frontend fetches related data, 
    # but for a list view, names are helpful. Pydantic can map relations if configured, 
    # but let's be explicit or rely on lazy loading if eager loading isn't set up).
    # Since we defined relations in the model, we can map attributes.
    
    results = []
    for tx in transactions:
        # Simple manual mapping or rely on ORM lazy load
        # We need to make sure the Pydantic model can accept these
        tx_resp = TransactionResponse.model_validate(tx)
        if tx.user:
            tx_resp.user_name = tx.user.username 
        if tx.item:
            tx_resp.item_name = tx.item.name
        results.append(tx_resp)
        
    return results

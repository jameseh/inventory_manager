from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.item import InventoryItem
from app.models.transaction import Transaction
from app.models.user import User
from typing import List, Dict, Any

router = APIRouter()

@router.get("/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    # 1. Total Items
    total_items = db.query(InventoryItem).count()

    # 2. Low Stock Items (stock <= min_stock)
    low_stock_items = db.query(InventoryItem).filter(InventoryItem.stock <= InventoryItem.min_stock).all()

    # 3. Recent Activity (Last 10 transactions)
    recent_txs = db.query(Transaction).order_by(Transaction.timestamp.desc()).limit(10).all()
    recent_activity = []
    for tx in recent_txs:
        recent_activity.append({
            "id": tx.id,
            "action": tx.transaction_type, # "CREATE", "DELETE", "ADD_STOCK" mapped in frontend or here
            "user_name": tx.user.username if tx.user else "Unknown",
            "details": f"{tx.notes or ''} - {tx.item.name if tx.item else 'Unknown Item'} ({tx.amount})",
            "timestamp": tx.timestamp
        })

    # 4. Most Popular Items (Top 5 by transaction count in the last 30 days? Or all time for simplicity)
    # Group by item_id in transactions and count
    popular_query = (
        db.query(InventoryItem, func.count(Transaction.id).label("tx_count"))
        .join(Transaction, Transaction.item_id == InventoryItem.id)
        .group_by(InventoryItem.id)
        .order_by(func.count(Transaction.id).desc())
        .limit(5)
        .all()
    )
    
    most_used_items = []
    for item, count in popular_query:
        most_used_items.append({
            "id": item.id,
            "name": item.name,
            "count": count
        })

    # 5. Maintenance Items (Missing description or location or image)
    maintenance_items = []
    # Simple check for empty fields
    items_missing_info = db.query(InventoryItem).filter(
        (InventoryItem.description == None) | (InventoryItem.description == "") |
        (InventoryItem.location == None) | (InventoryItem.location == "") |
        (InventoryItem.image_url == None)
    ).limit(10).all()

    for item in items_missing_info:
        missing = []
        if not item.description: missing.append("Description")
        if not item.location: missing.append("Location")
        if not item.image_url: missing.append("Image")
        
        maintenance_items.append({
            "id": item.id,
            "name": item.name,
            "missing_fields": missing
        })
    
    # 6. Recent Items (Last 5 created)
    recent_items_db = db.query(InventoryItem).order_by(InventoryItem.created_at.desc()).limit(4).all()

    return {
        "total_items": total_items,
        "low_stock_items": low_stock_items,
        "most_used_items": most_used_items,
        "recent_items": recent_items_db, # Pydantic will serialize
        "recent_activity": recent_activity,
        "maintenance_items": maintenance_items,
        "active_projects": [] # Explicitly empty as requested
    }

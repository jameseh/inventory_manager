from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from datetime import datetime
from app.core.database import Base
from sqlalchemy.orm import relationship

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("inventory_items.id"), index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    transaction_type = Column(String, index=True)  # "IN", "OUT", "ADJUSTMENT"
    amount = Column(Integer)
    timestamp = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)

    item = relationship("InventoryItem", backref="transactions")
    user = relationship("User", backref="transactions")

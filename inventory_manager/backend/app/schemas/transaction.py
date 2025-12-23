from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TransactionBase(BaseModel):
    item_id: int
    transaction_type: str
    amount: int
    notes: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: int
    user_id: int
    timestamp: datetime
    # We might want to include item name and user name in the response for display
    user_name: Optional[str] = None
    item_name: Optional[str] = None

    class Config:
        from_attributes = True

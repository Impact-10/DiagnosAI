from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, LargeBinary
from app.db.base import Base

# SQLAlchemy ORM Model
class HealthRecord(Base):
    __tablename__ = "health_records"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    content_type = Column(String, nullable=False)
    data = Column(LargeBinary, nullable=False)  # Store raw file bytes

# Pydantic schemas
class HealthRecordBase(BaseModel):
    filename: str
    content_type: str

class HealthRecordCreate(HealthRecordBase):
    data: bytes

class HealthRecordOut(HealthRecordBase):
    id: int

    class Config:
        orm_mode = True

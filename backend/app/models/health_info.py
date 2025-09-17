from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, Text
from app.db.base import Base

# SQLAlchemy ORM Model
class HealthInfo(Base):
    __tablename__ = "health_info"

    id = Column(Integer, primary_key=True, index=True)
    disease_name = Column(String, nullable=False)
    symptoms = Column(Text, nullable=True)
    prevention = Column(Text, nullable=True)
    treatment = Column(Text, nullable=True)

# Pydantic schemas
class HealthInfoBase(BaseModel):
    disease_name: str
    symptoms: str | None = None
    prevention: str | None = None
    treatment: str | None = None

class HealthInfoCreate(HealthInfoBase):
    pass

class HealthInfoOut(HealthInfoBase):
    id: int

    class Config:
        orm_mode = True


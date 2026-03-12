from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date, Text, Boolean, DECIMAL
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base


class LayoffRecord(Base):
    """裁员信息记录模型"""
    
    __tablename__ = "layoff_records"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    company_name = Column(String(255), nullable=False)
    industry = Column(String(100), nullable=True)
    layoff_date = Column(Date, nullable=False)
    layoff_count = Column(Integer, nullable=True)
    compensation_months = Column(DECIMAL(5, 2), nullable=True)
    reason = Column(Text, nullable=True)
    is_anonymous = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # 关系
    user = relationship("User", back_populates="layoff_records")
    
    def __repr__(self):
        return f"<LayoffRecord(id={self.id}, company={self.company_name})>"

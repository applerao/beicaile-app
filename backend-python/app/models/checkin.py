from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date, Text, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base


class Checkin(Base):
    """签到记录模型"""
    
    __tablename__ = "checkins"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    checkin_date = Column(Date, nullable=False, index=True, default=func.current_date())
    note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 关系
    user = relationship("User", back_populates="checkins")
    
    # 唯一约束：每个用户每天只能签到一次
    __table_args__ = (
        UniqueConstraint('user_id', 'checkin_date', name='uq_user_checkin_date'),
    )
    
    def __repr__(self):
        return f"<Checkin(id={self.id}, user_id={self.user_id}, date={self.checkin_date})>"

from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import Optional


class CheckinCreate(BaseModel):
    """签到创建请求"""
    note: Optional[str] = Field(None, max_length=500, description="签到备注")


class CheckinResponse(BaseModel):
    """签到响应"""
    id: int
    user_id: int
    checkin_date: date
    note: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class CheckinStats(BaseModel):
    """签到统计响应"""
    total_count: int
    current_streak: int
    longest_streak: int
    last_checkin_date: Optional[date] = None

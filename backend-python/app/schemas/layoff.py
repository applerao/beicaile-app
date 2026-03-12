from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import Optional
from decimal import Decimal


class LayoffCreate(BaseModel):
    """裁员信息创建请求"""
    company_name: str = Field(..., min_length=1, max_length=255, description="公司名称")
    industry: Optional[str] = Field(None, max_length=100, description="行业")
    layoff_date: date
    layoff_count: Optional[int] = Field(None, ge=1, description="裁员人数")
    compensation_months: Optional[Decimal] = Field(None, ge=0, description="赔偿月数")
    reason: Optional[str] = Field(None, max_length=2000, description="裁员原因")
    is_anonymous: bool = False


class LayoffResponse(BaseModel):
    """裁员信息响应"""
    id: int
    user_id: int
    company_name: str
    industry: Optional[str] = None
    layoff_date: date
    layoff_count: Optional[int] = None
    compensation_months: Optional[Decimal] = None
    reason: Optional[str] = None
    is_anonymous: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

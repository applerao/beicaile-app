from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from ..database import get_db
from ..models.layoff import LayoffRecord
from ..schemas.layoff import LayoffCreate, LayoffResponse
from ..schemas.user import UserResponse
from ..middleware.auth import get_current_user

router = APIRouter()


@router.post("/", response_model=LayoffResponse, status_code=status.HTTP_201_CREATED)
async def create_layoff_record(
    layoff_data: LayoffCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """创建裁员信息记录"""
    new_record = LayoffRecord(
        user_id=current_user.id,
        **layoff_data.model_dump()
    )
    
    db.add(new_record)
    await db.commit()
    await db.refresh(new_record)
    
    return LayoffResponse.model_validate(new_record)


@router.get("/", response_model=List[LayoffResponse])
async def get_layoff_records(
    limit: int = Query(30, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """获取裁员信息记录"""
    result = await db.execute(
        select(LayoffRecord)
        .where(LayoffRecord.user_id == current_user.id)
        .order_by(LayoffRecord.layoff_date.desc())
        .offset(offset)
        .limit(limit)
    )
    records = result.scalars().all()
    
    return [LayoffResponse.model_validate(r) for r in records]


@router.get("/{record_id}", response_model=LayoffResponse)
async def get_layoff_record(
    record_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """获取单条裁员信息记录"""
    result = await db.execute(
        select(LayoffRecord).where(
            LayoffRecord.id == record_id,
            LayoffRecord.user_id == current_user.id
        )
    )
    record = result.scalar_one_or_none()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="记录不存在"
        )
    
    return LayoffResponse.model_validate(record)

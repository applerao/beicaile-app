from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import date, datetime, timedelta
from typing import List

from ..database import get_db
from ..models.user import User
from ..models.checkin import Checkin
from ..schemas.checkin import CheckinCreate, CheckinResponse, CheckinStats
from ..schemas.user import UserResponse
from ..middleware.auth import get_current_user

router = APIRouter()


@router.post("/", response_model=CheckinResponse, status_code=status.HTTP_201_CREATED)
async def create_checkin(
    checkin_data: CheckinCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """每日签到"""
    today = date.today()
    
    # 检查今日是否已签到
    result = await db.execute(
        select(Checkin).where(
            and_(Checkin.user_id == current_user.id, Checkin.checkin_date == today)
        )
    )
    existing_checkin = result.scalar_one_or_none()
    
    if existing_checkin:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="今日已签到"
        )
    
    # 创建签到记录
    new_checkin = Checkin(
        user_id=current_user.id,
        checkin_date=today,
        note=checkin_data.note
    )
    
    db.add(new_checkin)
    await db.commit()
    await db.refresh(new_checkin)
    
    return CheckinResponse.model_validate(new_checkin)


@router.get("/", response_model=List[CheckinResponse])
async def get_checkins(
    limit: int = Query(30, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """获取签到记录"""
    result = await db.execute(
        select(Checkin)
        .where(Checkin.user_id == current_user.id)
        .order_by(Checkin.checkin_date.desc())
        .offset(offset)
        .limit(limit)
    )
    checkins = result.scalars().all()
    
    return [CheckinResponse.model_validate(c) for c in checkins]


@router.get("/stats", response_model=CheckinStats)
async def get_checkin_stats(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """获取签到统计"""
    # 总签到次数
    total_result = await db.execute(
        select(func.count(Checkin.id)).where(Checkin.user_id == current_user.id)
    )
    total_count = total_result.scalar() or 0
    
    # 最近签到日期
    last_result = await db.execute(
        select(Checkin.checkin_date)
        .where(Checkin.user_id == current_user.id)
        .order_by(Checkin.checkin_date.desc())
        .limit(1)
    )
    last_checkin_date = last_result.scalar_one_or_none()
    
    # 计算连续签到（简化版）
    current_streak = 0
    longest_streak = 0
    
    if last_checkin_date:
        # 获取所有签到日期
        all_result = await db.execute(
            select(Checkin.checkin_date)
            .where(Checkin.user_id == current_user.id)
            .order_by(Checkin.checkin_date.desc())
        )
        dates = [d for d in all_result.scalars().all()]
        
        if dates:
            # 计算当前连续签到
            today = date.today()
            yesterday = today - timedelta(days=1)
            
            if dates[0] == today or dates[0] == yesterday:
                current_streak = 1
                for i in range(1, len(dates)):
                    if dates[i-1] - dates[i] == timedelta(days=1):
                        current_streak += 1
                    else:
                        break
            
            # 计算最长连续签到
            temp_streak = 1
            for i in range(1, len(dates)):
                if dates[i-1] - dates[i] == timedelta(days=1):
                    temp_streak += 1
                else:
                    longest_streak = max(longest_streak, temp_streak)
                    temp_streak = 1
            longest_streak = max(longest_streak, temp_streak)
    
    return CheckinStats(
        total_count=total_count,
        current_streak=current_streak,
        longest_streak=longest_streak,
        last_checkin_date=last_checkin_date
    )

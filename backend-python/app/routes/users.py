from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..database import get_db
from ..models.user import User
from ..schemas.user import UserResponse, UserCreate
from ..middleware.auth import get_current_user, get_password_hash

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_user_info(current_user: UserResponse = Depends(get_current_user)):
    """获取当前用户信息"""
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_user_info(
    user_data: UserCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """更新用户信息"""
    # 查询用户
    result = await db.execute(select(User).where(User.id == current_user.id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    # 更新字段
    if user_data.nickname:
        user.nickname = user_data.nickname
    if user_data.avatar_url:
        user.avatar_url = user_data.avatar_url
    
    await db.commit()
    await db.refresh(user)
    
    return UserResponse.model_validate(user)

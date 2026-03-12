from fastapi import APIRouter
from .auth import router as auth_router
from .users import router as users_router
from .checkin import router as checkin_router
from .layoff import router as layoff_router

router = APIRouter()

router.include_router(auth_router, prefix="/auth", tags=["认证"])
router.include_router(users_router, prefix="/users", tags=["用户"])
router.include_router(checkin_router, prefix="/checkin", tags=["签到"])
router.include_router(layoff_router, prefix="/layoff", tags=["裁员信息"])

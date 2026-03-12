from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .config import config
from .database import init_db
from .routes import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时初始化数据库
    await init_db()
    print("✅ 数据库初始化完成")
    yield
    # 关闭时清理资源（如果需要）


# 创建 FastAPI 应用
app = FastAPI(
    title="被裁了吗 API",
    description="裁员信息分享平台后端 API",
    version="1.0.0",
    docs_url="/api-docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应该限制具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 健康检查
@app.get("/health")
async def health_check():
    """健康检查接口"""
    return {"status": "ok"}


# 根路径
@app.get("/")
async def root():
    """根路径"""
    return {
        "message": "被裁了吗 API",
        "docs": "/api-docs",
        "health": "/health"
    }


# 注册路由
app.include_router(router, prefix="/api")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=config.HOST,
        port=config.PORT,
        reload=config.DEBUG
    )

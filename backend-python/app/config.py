import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """应用配置"""
    
    # 服务器配置
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # 数据库配置
    DATABASE_TYPE: str = os.getenv("DB_TYPE", "sqlite")
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite+aiosqlite:///./data/beicaile.db"
    )
    
    # PostgreSQL 配置（可选）
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: int = int(os.getenv("DB_PORT", "5432"))
    DB_NAME: str = os.getenv("DB_NAME", "beicaile")
    DB_USER: str = os.getenv("DB_USER", "postgres")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "postgres")
    
    # JWT 配置
    JWT_SECRET: str = os.getenv("JWT_SECRET", "your-super-secret-jwt-key")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRES_IN: int = int(os.getenv("JWT_EXPIRES_IN", "7"))  # 天
    
    # 目录配置
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_DIR: str = os.path.join(BASE_DIR, "data")


# 确保数据目录存在
os.makedirs(Config.DATA_DIR, exist_ok=True)

config = Config()

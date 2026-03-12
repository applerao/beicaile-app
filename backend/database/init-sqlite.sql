-- 被裁了吗 App 数据库初始化脚本 - SQLite 版本
-- 适用于 SQLite 数据库

-- ============================================
-- 用户表
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- ============================================
-- 签到记录表
-- ============================================
CREATE TABLE IF NOT EXISTS checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, checkin_date)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_date ON checkins(checkin_date);
CREATE INDEX IF NOT EXISTS idx_checkins_user_date ON checkins(user_id, checkin_date DESC);

-- ============================================
-- 裁员信息表
-- ============================================
CREATE TABLE IF NOT EXISTS layoff_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    layoff_date DATE NOT NULL,
    layoff_count INTEGER,
    compensation_months DECIMAL(5,2),
    reason TEXT,
    is_anonymous BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_layoff_user_id ON layoff_records(user_id);
CREATE INDEX IF NOT EXISTS idx_layoff_company ON layoff_records(company_name);
CREATE INDEX IF NOT EXISTS idx_layoff_date ON layoff_records(layoff_date);
CREATE INDEX IF NOT EXISTS idx_layoff_industry ON layoff_records(industry);

-- ============================================
-- 插入测试数据（可选）
-- ============================================
-- 测试用户（密码：123456，哈希值）
-- INSERT INTO users (email, password_hash, nickname) 
-- VALUES ('test@example.com', '$2a$10$YourHashedPasswordHere', '测试用户');

-- ============================================
-- 视图：用户签到统计（SQLite 简化版）
-- ============================================
CREATE VIEW IF NOT EXISTS user_checkin_stats AS
SELECT 
    u.id as user_id,
    u.email,
    u.nickname,
    COUNT(c.id) as total_checkins,
    MAX(c.checkin_date) as last_checkin_date,
    MIN(c.checkin_date) as first_checkin_date
FROM users u
LEFT JOIN checkins c ON u.id = c.user_id
GROUP BY u.id, u.email, u.nickname;

-- ============================================
-- 触发器：自动更新 updated_at
-- ============================================
-- users 表
CREATE TRIGGER IF NOT EXISTS update_users_updated_at 
BEFORE UPDATE ON users
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- layoff_records 表
CREATE TRIGGER IF NOT EXISTS update_layoff_records_updated_at 
BEFORE UPDATE ON layoff_records
BEGIN
    UPDATE layoff_records SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

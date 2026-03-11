-- 被裁了吗 App 数据库初始化脚本
-- PostgreSQL 初始化 SQL

-- 创建数据库（如果不存在）
CREATE DATABASE beicaile;

-- 连接到数据库
\c beicaile;

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 用户表
-- ============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- 添加注释
COMMENT ON TABLE users IS '用户表';
COMMENT ON COLUMN users.id IS '用户 ID';
COMMENT ON COLUMN users.email IS '邮箱（唯一）';
COMMENT ON COLUMN users.password_hash IS '密码哈希';
COMMENT ON COLUMN users.nickname IS '昵称';
COMMENT ON COLUMN users.avatar_url IS '头像 URL';

-- ============================================
-- 签到记录表
-- ============================================
CREATE TABLE checkins (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, checkin_date)
);

-- 创建索引
CREATE INDEX idx_checkins_user_id ON checkins(user_id);
CREATE INDEX idx_checkins_date ON checkins(checkin_date);
CREATE INDEX idx_checkins_user_date ON checkins(user_id, checkin_date DESC);

-- 添加注释
COMMENT ON TABLE checkins IS '签到记录表';
COMMENT ON COLUMN checkins.id IS '签到记录 ID';
COMMENT ON COLUMN checkins.user_id IS '用户 ID（外键）';
COMMENT ON COLUMN checkins.checkin_date IS '签到日期';
COMMENT ON COLUMN checkins.note IS '签到备注';

-- ============================================
-- 裁员信息表
-- ============================================
CREATE TABLE layoff_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    layoff_date DATE NOT NULL,
    layoff_count INTEGER,
    compensation_months DECIMAL(5,2),
    reason TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_layoff_user_id ON layoff_records(user_id);
CREATE INDEX idx_layoff_company ON layoff_records(company_name);
CREATE INDEX idx_layoff_date ON layoff_records(layoff_date);
CREATE INDEX idx_layoff_industry ON layoff_records(industry);

-- 添加注释
COMMENT ON TABLE layoff_records IS '裁员信息记录表';
COMMENT ON COLUMN layoff_records.id IS '记录 ID';
COMMENT ON COLUMN layoff_records.user_id IS '用户 ID（外键）';
COMMENT ON COLUMN layoff_records.company_name IS '公司名称';
COMMENT ON COLUMN layoff_records.industry IS '行业';
COMMENT ON COLUMN layoff_records.layoff_date IS '裁员日期';
COMMENT ON COLUMN layoff_records.layoff_count IS '裁员人数';
COMMENT ON COLUMN layoff_records.compensation_months IS '赔偿月数';
COMMENT ON COLUMN layoff_records.reason IS '裁员原因';
COMMENT ON COLUMN layoff_records.is_anonymous IS '是否匿名';

-- ============================================
-- 插入测试数据（可选）
-- ============================================
-- 测试用户（密码：123456）
-- INSERT INTO users (email, password_hash, nickname) 
-- VALUES ('test@example.com', '$2a$10$YourHashedPasswordHere', '测试用户');

-- ============================================
-- 视图：用户签到统计
-- ============================================
CREATE VIEW user_checkin_stats AS
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
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_layoff_records_updated_at BEFORE UPDATE ON layoff_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 权限设置（可选，根据实际需要调整）
-- ============================================
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;

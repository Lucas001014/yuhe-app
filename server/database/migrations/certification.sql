-- 认证表
CREATE TABLE IF NOT EXISTS certifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  real_name VARCHAR(100) NOT NULL,
  id_card VARCHAR(20) NOT NULL,
  id_card_front TEXT NOT NULL, -- 身份证正面图片URL
  id_card_back TEXT NOT NULL, -- 身份证背面图片URL
  business_license TEXT, -- 营业执照图片URL（企业认证）
  type VARCHAR(20) DEFAULT 'individual' CHECK (type IN ('individual', 'enterprise')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reject_reason TEXT, -- 拒绝原因
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 为user_id创建索引
CREATE INDEX IF NOT EXISTS idx_certifications_user_id ON certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_certifications_status ON certifications(status);

-- 为users表添加认证相关字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS identity_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_merchant BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS merchant_paid BOOLEAN DEFAULT FALSE;

-- 评论表（如果不存在）
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE, -- 用于回复评论
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);

-- 用户互动表（点赞、收藏、转发）
CREATE TABLE IF NOT EXISTS user_interactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('like', 'collect', 'forward')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, post_id, type) -- 防止重复操作
);

CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_post_id ON user_interactions(post_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions(type);

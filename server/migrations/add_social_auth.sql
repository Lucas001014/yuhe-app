-- 添加微信登录相关字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS wechat_openid VARCHAR(100) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS wechat_unionid VARCHAR(100) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS wechat_nickname VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS wechat_headimgurl VARCHAR(500);

-- 添加支付宝登录相关字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS alipay_user_id VARCHAR(100) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS alipay_nickname VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS alipay_avatar VARCHAR(500);

-- 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_users_wechat_openid ON users(wechat_openid);
CREATE INDEX IF NOT EXISTS idx_users_wechat_unionid ON users(wechat_unionid);
CREATE INDEX IF NOT EXISTS idx_users_alipay_user_id ON users(alipay_user_id);

-- 注释
COMMENT ON COLUMN users.wechat_openid IS '微信OpenID，用于微信登录';
COMMENT ON COLUMN users.wechat_unionid IS '微信UnionID，用于统一用户账号（同一开放平台下多个应用）';
COMMENT ON COLUMN users.wechat_nickname IS '微信昵称';
COMMENT ON COLUMN users.wechat_headimgurl IS '微信头像URL';
COMMENT ON COLUMN users.alipay_user_id IS '支付宝用户ID，用于支付宝登录';
COMMENT ON COLUMN users.alipay_nickname IS '支付宝昵称';
COMMENT ON COLUMN users.alipay_avatar IS '支付宝头像URL';

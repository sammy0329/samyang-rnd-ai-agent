-- ===========================
-- Samyang Viral Insight Agent
-- Initial Database Schema
-- ===========================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================
-- 1. users 테이블
-- ===========================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'user', -- user, admin
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE
    ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================
-- 2. trends 테이블
-- ===========================
CREATE TABLE trends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL, -- tiktok, reels, shorts
  country VARCHAR(10) DEFAULT 'KR',
  format_type VARCHAR(100), -- POV, Reaction, Meme, etc.
  hook_pattern TEXT,
  visual_pattern TEXT,
  music_pattern TEXT,
  viral_score INT CHECK (viral_score >= 0 AND viral_score <= 100),
  samyang_relevance INT CHECK (samyang_relevance >= 0 AND samyang_relevance <= 100),
  analysis_data JSONB, -- LLM 분석 결과
  created_by UUID REFERENCES users(id) ON DELETE SET NULL, -- 트렌드를 생성한 사용자 ID
  collected_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_trends_keyword ON trends(keyword);
CREATE INDEX idx_trends_platform ON trends(platform);
CREATE INDEX idx_trends_collected_at ON trends(collected_at DESC);
CREATE INDEX idx_trends_viral_score ON trends(viral_score DESC);
CREATE INDEX idx_trends_created_by ON trends(created_by);

-- ===========================
-- 3. creators 테이블
-- ===========================
CREATE TABLE creators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  profile_url TEXT,
  follower_count INT,
  avg_views INT,
  engagement_rate DECIMAL(5,2),
  content_category VARCHAR(100),
  tone_manner VARCHAR(100),
  brand_fit_score INT CHECK (brand_fit_score >= 0 AND brand_fit_score <= 100),
  collaboration_history JSONB,
  risk_factors JSONB,
  analysis_data JSONB,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL, -- 크리에이터를 추가한 사용자 ID
  last_analyzed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TRIGGER update_creators_updated_at BEFORE UPDATE
    ON creators FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_creators_platform ON creators(platform);
CREATE INDEX idx_creators_brand_fit_score ON creators(brand_fit_score DESC);
CREATE INDEX idx_creators_username_platform ON creators(username, platform);
CREATE INDEX idx_creators_created_by ON creators(created_by);

-- ===========================
-- 4. content_ideas 테이블
-- ===========================
CREATE TABLE content_ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trend_id UUID REFERENCES trends(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  brand_category VARCHAR(100), -- 불닭, 삼양라면, 젤리
  tone VARCHAR(100),
  hook_text TEXT,
  scene_structure JSONB, -- 3-5컷 구성
  editing_format TEXT,
  music_style VARCHAR(255),
  props_needed TEXT[],
  target_country VARCHAR(10),
  expected_performance JSONB,
  generated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_content_ideas_trend_id ON content_ideas(trend_id);
CREATE INDEX idx_content_ideas_brand_category ON content_ideas(brand_category);
CREATE INDEX idx_content_ideas_created_at ON content_ideas(created_at DESC);

-- ===========================
-- 5. reports 테이블
-- ===========================
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL, -- daily_trend, creator_match, content_idea
  title VARCHAR(255),
  content JSONB NOT NULL,
  metadata JSONB,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_reports_type ON reports(type);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_reports_created_by ON reports(created_by);

-- ===========================
-- 6. api_usage 테이블
-- ===========================
CREATE TABLE api_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  endpoint VARCHAR(255),
  method VARCHAR(10),
  tokens_used INT,
  cost DECIMAL(10,4),
  response_time_ms INT,
  status_code INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_api_usage_user_id ON api_usage(user_id);
CREATE INDEX idx_api_usage_created_at ON api_usage(created_at DESC);
CREATE INDEX idx_api_usage_endpoint ON api_usage(endpoint);

-- ===========================
-- Initial Data (Optional)
-- ===========================

-- Create admin user (optional)
-- INSERT INTO users (email, name, role) VALUES
-- ('admin@samyang.com', 'Admin User', 'admin');

-- ===========================
-- Comments for documentation
-- ===========================

COMMENT ON TABLE users IS '사용자 정보';
COMMENT ON TABLE trends IS '트렌드 분석 데이터';
COMMENT ON TABLE creators IS '크리에이터 프로필 및 매칭 데이터';
COMMENT ON TABLE content_ideas IS 'AI 생성 콘텐츠 아이디어';
COMMENT ON TABLE reports IS '생성된 리포트';
COMMENT ON TABLE api_usage IS 'API 사용량 추적 및 비용 관리';

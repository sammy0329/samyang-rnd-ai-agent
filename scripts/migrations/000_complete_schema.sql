-- ===========================
-- Samyang Viral Insight Agent
-- Complete Database Schema
-- ===========================
--
-- 이 파일은 모든 마이그레이션을 통합한 완전한 스키마입니다.
-- 새 Supabase 프로젝트에서 최초 1회만 실행하세요.
--
-- 포함된 마이그레이션:
-- - 001_initial_schema.sql
-- - 002_rls_policies.sql
-- - 003_auth_users_sync.sql
-- - 004_add_content_ideas_fields.sql
-- ===========================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================
-- Helper Functions
-- ===========================

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Auth user sync function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================
-- 1. users 테이블
-- ===========================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TRIGGER update_users_updated_at BEFORE UPDATE
    ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auth sync trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Sync existing auth users
INSERT INTO public.users (id, email, name, role)
SELECT id, email, COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)), 'user'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ===========================
-- 2. trends 테이블
-- ===========================
CREATE TABLE trends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  country VARCHAR(10) DEFAULT 'KR',
  format_type VARCHAR(100),
  hook_pattern TEXT,
  visual_pattern TEXT,
  music_pattern TEXT,
  viral_score INT CHECK (viral_score >= 0 AND viral_score <= 100),
  samyang_relevance INT CHECK (samyang_relevance >= 0 AND samyang_relevance <= 100),
  analysis_data JSONB,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  collected_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

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
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  last_analyzed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TRIGGER update_creators_updated_at BEFORE UPDATE
    ON creators FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
  brand_category VARCHAR(100),
  tone VARCHAR(100),
  format_type VARCHAR(100),
  platform VARCHAR(50),
  hook_text TEXT,
  hook_visual TEXT,
  scene_structure JSONB,
  editing_format TEXT,
  music_style VARCHAR(255),
  props_needed TEXT[],
  hashtags TEXT[],
  target_country VARCHAR(10),
  expected_performance JSONB,
  production_tips TEXT[],
  common_mistakes TEXT[],
  generated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_content_ideas_trend_id ON content_ideas(trend_id);
CREATE INDEX idx_content_ideas_brand_category ON content_ideas(brand_category);
CREATE INDEX idx_content_ideas_created_at ON content_ideas(created_at DESC);
CREATE INDEX idx_content_ideas_format_type ON content_ideas(format_type);
CREATE INDEX idx_content_ideas_platform ON content_ideas(platform);
CREATE INDEX idx_content_ideas_created_by ON content_ideas(created_by);

-- ===========================
-- 5. reports 테이블
-- ===========================
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255),
  content JSONB NOT NULL,
  metadata JSONB,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

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

CREATE INDEX idx_api_usage_user_id ON api_usage(user_id);
CREATE INDEX idx_api_usage_created_at ON api_usage(created_at DESC);
CREATE INDEX idx_api_usage_endpoint ON api_usage(endpoint);

-- ===========================
-- RLS 활성화
-- ===========================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- ===========================
-- RLS 정책 - users
-- ===========================
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON users FOR SELECT
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- ===========================
-- RLS 정책 - trends
-- ===========================
CREATE POLICY "Authenticated users can view trends" ON trends FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert trends" ON trends FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update trends" ON trends FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can delete trends" ON trends FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- ===========================
-- RLS 정책 - creators
-- ===========================
CREATE POLICY "Authenticated users can view creators" ON creators FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert creators" ON creators FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update creators" ON creators FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins can delete creators" ON creators FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- ===========================
-- RLS 정책 - content_ideas
-- ===========================
CREATE POLICY "Authenticated users can view content ideas" ON content_ideas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert content ideas" ON content_ideas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update own content ideas" ON content_ideas FOR UPDATE TO authenticated
  USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can delete own content ideas" ON content_ideas FOR DELETE TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Admins can update all content ideas" ON content_ideas FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can delete all content ideas" ON content_ideas FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- ===========================
-- RLS 정책 - reports
-- ===========================
CREATE POLICY "Authenticated users can view reports" ON reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert reports" ON reports FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update own reports" ON reports FOR UPDATE TO authenticated
  USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can delete own reports" ON reports FOR DELETE TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Admins can update all reports" ON reports FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can delete all reports" ON reports FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- ===========================
-- RLS 정책 - api_usage
-- ===========================
CREATE POLICY "Users can view own api usage" ON api_usage FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can view all api usage" ON api_usage FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Service role can insert api usage" ON api_usage FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can delete api usage" ON api_usage FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- ===========================
-- Table Comments
-- ===========================
COMMENT ON TABLE users IS '사용자 정보';
COMMENT ON TABLE trends IS '트렌드 분석 데이터';
COMMENT ON TABLE creators IS '크리에이터 프로필 및 매칭 데이터';
COMMENT ON TABLE content_ideas IS 'AI 생성 콘텐츠 아이디어';
COMMENT ON TABLE reports IS '생성된 리포트';
COMMENT ON TABLE api_usage IS 'API 사용량 추적 및 비용 관리';

COMMENT ON COLUMN content_ideas.format_type IS '콘텐츠 포맷 타입 (Challenge, Recipe, ASMR, Comedy, Review, Tutorial)';
COMMENT ON COLUMN content_ideas.platform IS '최적 플랫폼 (tiktok, instagram, youtube)';
COMMENT ON COLUMN content_ideas.hook_visual IS '첫 3초에 보여줄 비주얼 요소';
COMMENT ON COLUMN content_ideas.hashtags IS '추천 해시태그 리스트';
COMMENT ON COLUMN content_ideas.production_tips IS '제작 팁 리스트';
COMMENT ON COLUMN content_ideas.common_mistakes IS '피해야 할 실수 리스트';

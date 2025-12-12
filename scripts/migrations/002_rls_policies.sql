-- ===========================
-- Samyang Viral Insight Agent
-- Row Level Security Policies
-- ===========================

-- ===========================
-- Enable RLS on all tables
-- ===========================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- ===========================
-- 1. users 테이블 RLS 정책
-- ===========================

-- 사용자는 자신의 정보만 조회 가능
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- 사용자는 자신의 정보만 수정 가능
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin은 모든 사용자 조회 가능
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ===========================
-- 2. trends 테이블 RLS 정책
-- ===========================

-- 모든 인증된 사용자는 트렌드 조회 가능
CREATE POLICY "Authenticated users can view trends"
  ON trends FOR SELECT
  TO authenticated
  USING (true);

-- 인증된 사용자는 트렌드 생성 가능 (AI Agent가 생성)
CREATE POLICY "Authenticated users can insert trends"
  ON trends FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Admin만 트렌드 수정 및 삭제 가능
CREATE POLICY "Admins can update trends"
  ON trends FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete trends"
  ON trends FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ===========================
-- 3. creators 테이블 RLS 정책
-- ===========================

-- 모든 인증된 사용자는 크리에이터 조회 가능
CREATE POLICY "Authenticated users can view creators"
  ON creators FOR SELECT
  TO authenticated
  USING (true);

-- 인증된 사용자는 크리에이터 생성 가능 (AI Agent가 생성)
CREATE POLICY "Authenticated users can insert creators"
  ON creators FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 인증된 사용자는 크리에이터 정보 수정 가능
CREATE POLICY "Authenticated users can update creators"
  ON creators FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Admin만 크리에이터 삭제 가능
CREATE POLICY "Admins can delete creators"
  ON creators FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ===========================
-- 4. content_ideas 테이블 RLS 정책
-- ===========================

-- 모든 인증된 사용자는 콘텐츠 아이디어 조회 가능
CREATE POLICY "Authenticated users can view content ideas"
  ON content_ideas FOR SELECT
  TO authenticated
  USING (true);

-- 인증된 사용자는 콘텐츠 아이디어 생성 가능
CREATE POLICY "Authenticated users can insert content ideas"
  ON content_ideas FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 사용자는 자신이 생성한 아이디어만 수정 가능
CREATE POLICY "Users can update own content ideas"
  ON content_ideas FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- 사용자는 자신이 생성한 아이디어만 삭제 가능
CREATE POLICY "Users can delete own content ideas"
  ON content_ideas FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Admin은 모든 아이디어 수정/삭제 가능
CREATE POLICY "Admins can update all content ideas"
  ON content_ideas FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete all content ideas"
  ON content_ideas FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ===========================
-- 5. reports 테이블 RLS 정책
-- ===========================

-- 모든 인증된 사용자는 리포트 조회 가능
CREATE POLICY "Authenticated users can view reports"
  ON reports FOR SELECT
  TO authenticated
  USING (true);

-- 인증된 사용자는 리포트 생성 가능
CREATE POLICY "Authenticated users can insert reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 사용자는 자신이 생성한 리포트만 수정 가능
CREATE POLICY "Users can update own reports"
  ON reports FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- 사용자는 자신이 생성한 리포트만 삭제 가능
CREATE POLICY "Users can delete own reports"
  ON reports FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Admin은 모든 리포트 수정/삭제 가능
CREATE POLICY "Admins can update all reports"
  ON reports FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete all reports"
  ON reports FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ===========================
-- 6. api_usage 테이블 RLS 정책
-- ===========================

-- 사용자는 자신의 API 사용 내역만 조회 가능
CREATE POLICY "Users can view own api usage"
  ON api_usage FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admin은 모든 API 사용 내역 조회 가능
CREATE POLICY "Admins can view all api usage"
  ON api_usage FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 시스템은 API 사용 내역 생성 가능 (Service Role Key 사용)
CREATE POLICY "Service role can insert api usage"
  ON api_usage FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Admin만 API 사용 내역 삭제 가능 (정리 목적)
CREATE POLICY "Admins can delete api usage"
  ON api_usage FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ===========================
-- Comments for documentation
-- ===========================

COMMENT ON POLICY "Users can view own profile" ON users IS '사용자는 자신의 프로필만 조회 가능';
COMMENT ON POLICY "Admins can view all users" ON users IS 'Admin 권한 사용자는 모든 사용자 조회 가능';
COMMENT ON POLICY "Authenticated users can view trends" ON trends IS '인증된 사용자는 모든 트렌드 조회 가능';
COMMENT ON POLICY "Authenticated users can view creators" ON creators IS '인증된 사용자는 모든 크리에이터 조회 가능';
COMMENT ON POLICY "Users can update own content ideas" ON content_ideas IS '사용자는 자신이 생성한 콘텐츠 아이디어만 수정 가능';
COMMENT ON POLICY "Users can view own api usage" ON api_usage IS '사용자는 자신의 API 사용 내역만 조회 가능';

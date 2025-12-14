-- ===========================
-- Auth Users Sync
-- Supabase Auth와 public.users 테이블 동기화
-- ===========================

-- 1. users 테이블의 id를 auth.users.id와 동기화하도록 수정
-- 기존 데이터가 있다면 먼저 백업하고 삭제해야 함

-- 2. users 테이블 재생성 (auth.users.id를 사용하도록)
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'user', -- user, admin
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Trigger for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE
    ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. auth.users에서 public.users로 자동 동기화하는 트리거 함수 생성
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

-- 4. auth.users에 트리거 설정
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. 기존 auth.users 데이터를 public.users로 마이그레이션
INSERT INTO public.users (id, email, name, role)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)) as name,
  'user' as role
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 6. reports 테이블의 created_by 외래키 재생성 (이미 있다면 먼저 삭제)
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_created_by_fkey;
ALTER TABLE reports
  ADD CONSTRAINT reports_created_by_fkey
  FOREIGN KEY (created_by)
  REFERENCES users(id)
  ON DELETE SET NULL;

-- 7. 다른 테이블들도 필요시 외래키 재생성
-- trends, creators, content_ideas는 created_by 컬럼이 없으므로 필요없음

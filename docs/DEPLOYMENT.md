# 배포 가이드

삼양식품 숏폼 마케팅 AI 에이전트 배포 가이드입니다.

## 목차

- [배포 전 체크리스트](#배포-전-체크리스트)
- [Vercel 배포](#vercel-배포)
- [환경 변수 설정](#환경-변수-설정)
- [데이터베이스 설정](#데이터베이스-설정)
- [도메인 설정](#도메인-설정)
- [배포 후 검증](#배포-후-검증)
- [모니터링 및 유지보수](#모니터링-및-유지보수)
- [트러블슈팅](#트러블슈팅)
- [롤백 절차](#롤백-절차)

---

## 배포 전 체크리스트

배포하기 전에 다음 항목들을 확인하세요:

### 1. 필수 환경 변수 준비

- [ ] Supabase 프로젝트 생성 완료
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` 확보
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` 확보
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` 확보 (⚠️ 절대 노출 금지)

- [ ] OpenAI API 키 준비
  - [ ] `OPENAI_API_KEY` 확보
  - [ ] API 크레딧 잔액 확인 (최소 $5 권장)

- [ ] YouTube Data API 설정 (선택)
  - [ ] `YOUTUBE_API_KEY` 확보
  - [ ] API 쿼터 확인 (일일 10,000 units)

- [ ] SerpAPI 설정 (선택)
  - [ ] `SERPAPI_KEY` 확보
  - [ ] 크레딧 잔액 확인

### 2. 코드 품질 검증

```bash
# 타입 체크
npm run type-check

# 린트 체크
npm run lint

# 빌드 테스트
npm run build

# 프로덕션 모드 로컬 테스트
npm start
```

### 3. 데이터베이스 마이그레이션 확인

```bash
# Supabase 대시보드에서 확인:
# 1. 모든 테이블이 생성되었는지 확인
# 2. RLS 정책이 올바르게 설정되었는지 확인
# 3. 인덱스가 생성되었는지 확인
```

### 4. 보안 검토

- [ ] `.env.local` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] 하드코딩된 비밀키가 없는지 확인
- [ ] CORS 설정 검토
- [ ] Rate Limiting 설정 검토

---

## Vercel 배포

### 방법 1: GitHub 연동 (권장)

Vercel은 GitHub 저장소와 자동으로 연동되어 CI/CD를 제공합니다.

#### 1단계: Vercel 계정 생성 및 프로젝트 임포트

1. [Vercel](https://vercel.com) 접속 및 GitHub 계정으로 로그인
2. "Add New Project" 클릭
3. GitHub 저장소 선택 및 Import
4. Framework Preset: **Next.js** 자동 감지 확인

#### 2단계: 프로젝트 설정

**Build & Development Settings**
- Build Command: `npm run build` (기본값)
- Output Directory: `.next` (기본값)
- Install Command: `npm install` (기본값)
- Development Command: `npm run dev` (기본값)

**Root Directory**
- 루트 디렉토리 사용 (기본값)

#### 3단계: 환경 변수 추가

Vercel 대시보드에서 **Settings > Environment Variables** 이동

아래 환경 변수를 모두 추가합니다:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_key

# YouTube (선택)
YOUTUBE_API_KEY=your_youtube_key

# SerpAPI (선택)
SERPAPI_KEY=your_serpapi_key

# Node 환경
NODE_ENV=production
```

**⚠️ 중요**:
- `SUPABASE_SERVICE_ROLE_KEY`와 `OPENAI_API_KEY`는 **Production** 환경에만 추가
- 절대로 코드나 GitHub에 커밋하지 마세요

#### 4단계: 배포

1. "Deploy" 버튼 클릭
2. 빌드 로그 확인
3. 배포 완료 후 URL 확인 (예: `https://your-project.vercel.app`)

#### 5단계: 자동 배포 설정

- **Production Branch**: `main` 또는 `master`
- **Preview Branch**: `develop`, `staging` 등

설정 후:
- `main` 브랜치에 푸시하면 **프로덕션** 자동 배포
- 다른 브랜치에 푸시하면 **프리뷰** 배포 (고유 URL 생성)

---

### 방법 2: Vercel CLI 사용

터미널에서 직접 배포할 수도 있습니다.

```bash
# Vercel CLI 설치
npm install -g vercel

# 로그인
vercel login

# 프로젝트 초기화 및 배포
vercel

# 프로덕션 배포
vercel --prod
```

---

## 환경 변수 설정

### Vercel 대시보드에서 설정

1. Vercel 프로젝트 대시보드 > **Settings** > **Environment Variables**
2. 각 환경 변수 추가:
   - **Key**: 변수 이름 (예: `OPENAI_API_KEY`)
   - **Value**: 변수 값
   - **Environments**: Production, Preview, Development 선택

### 환경별 변수 분리

- **Production**: 실제 서비스용 키
- **Preview**: 스테이징/테스트용 키
- **Development**: 로컬 개발용 키

### 환경 변수 암호화

Vercel은 모든 환경 변수를 자동으로 암호화하여 저장합니다.

---

## 데이터베이스 설정

### Supabase 프로덕션 설정

#### 0. 초기 스키마 설정 (최초 1회)

Supabase 대시보드 > **SQL Editor**에서 아래 SQL을 실행합니다:

```sql
-- ===========================
-- Samyang Viral Insight Agent
-- Complete Database Schema
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
```

> ⚠️ **주의**: 이 SQL은 새 프로젝트에서 최초 1회만 실행합니다. 기존 데이터가 있는 경우 테이블이 이미 존재하므로 실행하지 마세요.

#### 1. 스키마 확인

SQL 실행 후 Supabase 대시보드 > **Table Editor**에서 다음 테이블이 생성되었는지 확인:

- `users` - 사용자 정보
- `trends` - 트렌드 분석 데이터
- `creators` - 크리에이터 프로필
- `content_ideas` - AI 생성 콘텐츠 아이디어
- `reports` - 생성된 리포트
- `api_usage` - API 사용량 추적

#### 2. 백업 설정

Supabase 대시보드에서:
1. **Settings** > **Database** > **Backups**
2. 자동 백업 활성화 (Pro 플랜 이상)
3. 백업 주기 설정 (일일 권장)

---

## 도메인 설정

### 커스텀 도메인 연결

#### 1단계: 도메인 추가

1. Vercel 프로젝트 대시보드 > **Settings** > **Domains**
2. "Add" 버튼 클릭
3. 도메인 입력 (예: `samyang-ai.com`)

#### 2단계: DNS 설정

DNS 제공자에서 아래 레코드 추가:

**A 레코드**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: Auto
```

**CNAME 레코드 (www 서브도메인)**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: Auto
```

#### 3단계: SSL 인증서

Vercel이 자동으로 Let's Encrypt SSL 인증서를 발급하고 갱신합니다.
- 최대 24시간 소요
- 자동 갱신 (90일마다)

#### 4단계: 리다이렉트 설정

`www.samyang-ai.com` → `samyang-ai.com` 리다이렉트 설정 (선택)

---

## CI/CD 파이프라인

### GitHub Actions 워크플로우

프로젝트는 GitHub Actions를 통한 자동화된 CI/CD 파이프라인을 사용합니다.

#### 워크플로우 파일

`.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-typecheck:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm type-check

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
```

#### CI/CD 흐름

```
┌─────────────────────────────────────────────────────────────────┐
│                        GitHub Repository                         │
└─────────────────────────────────────────────────────────────────┘
                              │
           ┌──────────────────┼──────────────────┐
           │                  │                  │
           ▼                  ▼                  ▼
    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │ Push to     │    │ Push to     │    │ Pull        │
    │ main        │    │ develop     │    │ Request     │
    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
           │                  │                  │
           └──────────────────┼──────────────────┘
                              │
                              ▼
           ┌─────────────────────────────────────┐
           │        GitHub Actions CI            │
           │  ┌─────────────────────────────┐   │
           │  │ 1. Lint (ESLint)            │   │
           │  │ 2. Type Check (TypeScript)  │   │
           │  │ 3. Build (Next.js)          │   │
           │  └─────────────────────────────┘   │
           └─────────────────┬───────────────────┘
                             │
                   ┌─────────┴─────────┐
                   │                   │
            CI 성공 ✓               CI 실패 ✗
                   │                   │
                   ▼                   ▼
    ┌─────────────────────────┐  ┌────────────────┐
    │    Vercel 자동 배포      │  │  PR 차단       │
    │  - main → Production    │  │  머지 불가     │
    │  - develop → Preview    │  └────────────────┘
    │  - PR → Preview URL     │
    └─────────────────────────┘
```

### Vercel 연동

Vercel은 GitHub 연동 시 자동으로 다음을 처리합니다:

| 이벤트 | Vercel 동작 | 배포 환경 |
|--------|------------|----------|
| `main` 브랜치 push | 자동 배포 | **Production** |
| `develop` 브랜치 push | 자동 배포 | Preview |
| Pull Request 생성 | 자동 배포 | Preview (고유 URL) |

#### PR Preview 배포

PR을 생성하면 Vercel이 자동으로 고유 URL을 생성합니다:

```
https://samyang-rnd-ai-agent-<hash>-<username>.vercel.app
```

PR 코멘트에서 Preview URL을 확인할 수 있습니다.

### 시나리오별 CI/CD 동작

#### 전체 구조

```
┌─────────────────────────────────────────────────────────────────────┐
│                          GitHub Actions                              │
│         (Lint → Type Check → Build) - 코드 품질 검증                  │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                    (CI 통과해야 Vercel 배포 진행)
                                 │
┌─────────────────────────────────────────────────────────────────────┐
│                             Vercel                                   │
│                     (실제 배포를 담당)                                 │
└─────────────────────────────────────────────────────────────────────┘
```

#### 시나리오별 동작 테이블

| 상황 | GitHub Actions | Vercel 배포 |
|------|----------------|-------------|
| `feature/*` → `develop` PR 생성 | CI 실행 (Lint, Type, Build) | **Preview URL 생성** (PR별 고유 URL) |
| `develop`에 머지됨 | CI 실행 | **Preview 배포** (develop 브랜치용) |
| `develop` → `main` PR 생성 | CI 실행 | **Preview URL 생성** (PR별 고유 URL) |
| `main`에 머지됨 | CI 실행 | **Production 배포** |

#### 예시 시나리오

**1. 새 기능 개발 (feature → develop)**

```bash
# 1. feature 브랜치 생성
git checkout develop
git checkout -b feature/login-page

# 2. 개발 완료 후 push
git add .
git commit -m "feat: Add login page"
git push origin feature/login-page

# 3. GitHub에서 PR 생성: feature/login-page → develop
#    → GitHub Actions: Lint, Type Check, Build 실행
#    → Vercel: Preview URL 생성
#      예: https://samyang-rnd-ai-agent-abc123-sammy0329.vercel.app

# 4. PR 머지 후
#    → develop 브랜치 자동 배포 (Preview 환경)
```

**2. Production 배포 (develop → main)**

```bash
# 1. GitHub에서 PR 생성: develop → main
#    → GitHub Actions: CI 실행
#    → Vercel: Preview URL 생성 (최종 확인용)
#      예: https://samyang-rnd-ai-agent-def456-sammy0329.vercel.app

# 2. PR 머지 후
#    → main 브랜치 자동 배포 (Production 환경)
#    → https://samyang-rnd-ai-agent.vercel.app (또는 커스텀 도메인)
```

#### 핵심 포인트

| 구분 | 역할 |
|------|------|
| **GitHub Actions** | 코드 품질 검증만 담당 (배포 X) |
| **Vercel** | 실제 배포 담당 (GitHub 연동 시 자동) |
| **PR Preview** | PR마다 고유한 Preview URL 생성됨 |
| **CI 실패 시** | Vercel 배포 차단, PR 머지 불가 |

### GitHub Secrets 설정

GitHub Actions에서 빌드 시 필요한 환경 변수를 설정합니다:

1. GitHub 저장소 > **Settings** > **Secrets and variables** > **Actions**
2. 다음 secrets 추가:

| Secret Name | 설명 | 필수 |
|------------|------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 익명 키 | ✅ |

> **참고**: 서버사이드 환경 변수(`SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY` 등)는 Vercel에만 설정하면 됩니다. GitHub Actions는 빌드 테스트만 수행합니다.

### 배포 브랜치 전략

```
main (Production)
 │
 └── develop (Staging/Preview)
      │
      ├── feature/xxx
      ├── fix/xxx
      └── ...
```

- **main**: 프로덕션 배포 브랜치 (직접 푸시 지양, PR 통해서만 머지)
- **develop**: 개발/스테이징 브랜치
- **feature/**, **fix/**: 기능/수정 브랜치 (develop으로 PR)

---

## 배포 후 검증

### 1. 기본 기능 테스트

```bash
# Health Check
curl https://your-domain.vercel.app/api/health

# 응답 예시:
# {
#   "status": "ok",
#   "timestamp": "2025-01-15T12:34:56.789Z"
# }
```

### 2. 페이지 접속 테스트

브라우저에서 각 페이지 접속:

- [ ] 홈페이지 (`/`)
- [ ] 대시보드 (`/dashboard`)
- [ ] 트렌드 분석 (`/trends`)
- [ ] 크리에이터 매칭 (`/creators`)
- [ ] 콘텐츠 아이디어 (`/content`)
- [ ] 리포트 (`/reports`)

### 3. API 엔드포인트 테스트

```bash
# 트렌드 목록 조회
curl https://your-domain.vercel.app/api/trends

# 크리에이터 목록 조회
curl https://your-domain.vercel.app/api/creators

# 콘텐츠 아이디어 목록 조회
curl https://your-domain.vercel.app/api/content

# 리포트 목록 조회
curl https://your-domain.vercel.app/api/reports
```

### 4. AI 기능 테스트

로그인 후 UI에서 테스트:

- [ ] 트렌드 분석 수행
- [ ] 크리에이터 매칭 수행
- [ ] 콘텐츠 아이디어 생성
- [ ] 리포트 생성 및 다운로드

### 5. 인증 테스트

- [ ] 로그인 기능
- [ ] 로그아웃 기능
- [ ] 사용자별 데이터 격리 (내 작업/전체 토글)

### 6. 성능 테스트

```bash
# Lighthouse 스코어 확인 (Chrome DevTools)
# - Performance: 90+ 목표
# - Accessibility: 95+ 목표
# - Best Practices: 95+ 목표
# - SEO: 90+ 목표
```

---

## 모니터링 및 유지보수

### Vercel Analytics

#### 활성화 방법

1. Vercel 프로젝트 대시보드 > **Analytics**
2. "Enable Analytics" 클릭

#### 모니터링 지표

- **Visitors**: 방문자 수
- **Pageviews**: 페이지뷰
- **Top Pages**: 인기 페이지
- **Devices**: 디바이스 분포
- **Locations**: 지역별 접속

### 로그 모니터링

#### Vercel 로그 확인

1. Vercel 프로젝트 대시보드 > **Deployments**
2. 특정 배포 클릭 > **Functions** 탭
3. 각 함수의 로그 확인

#### 로그 레벨

프로젝트는 다음 로그 레벨을 사용합니다:

```typescript
// src/lib/logger.ts
logger.info('정보성 로그');
logger.warn('경고 로그');
logger.error('에러 로그');
```

### API 사용량 모니터링

데이터베이스의 `api_usage` 테이블에서 API 사용량 확인:

```sql
-- 일일 API 호출 통계
SELECT
  endpoint,
  COUNT(*) as total_calls,
  AVG(response_time_ms) as avg_response_time,
  COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_count
FROM api_usage
WHERE created_at >= NOW() - INTERVAL '1 day'
GROUP BY endpoint
ORDER BY total_calls DESC;

-- 시간대별 트래픽 분석
SELECT
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as requests
FROM api_usage
WHERE created_at >= NOW() - INTERVAL '1 day'
GROUP BY hour
ORDER BY hour DESC;
```

### OpenAI API 비용 모니터링

1. [OpenAI Platform](https://platform.openai.com/usage) 접속
2. **Usage** 탭에서 비용 확인
3. 예산 초과 시 알림 설정

**예상 비용 (GPT-4o-mini 기준)**:
- 트렌드 분석 1회: ~$0.01-0.02
- 크리에이터 매칭 1회: ~$0.01-0.02
- 콘텐츠 아이디어 생성 1회 (3개): ~$0.02-0.03

### 알림 설정

#### Vercel 알림

1. Vercel 프로젝트 대시보드 > **Settings** > **Notifications**
2. 알림 채널 추가:
   - Slack
   - Discord
   - Email

#### 알림 이벤트

- 배포 성공/실패
- 빌드 에러
- 도메인 SSL 갱신
- 성능 저하

---

## 트러블슈팅

### 빌드 에러

#### 문제: Type errors during build

```bash
# 로컬에서 타입 체크
npm run type-check

# 에러 수정 후 다시 빌드
npm run build
```

#### 문제: Environment variables not found

**해결방법**:
1. Vercel 대시보드에서 환경 변수 확인
2. 변수가 올바른 환경(Production/Preview/Development)에 추가되었는지 확인
3. 배포 재시도

### 런타임 에러

#### 문제: Supabase connection error

**증상**: `Error: Invalid Supabase URL`

**해결방법**:
1. `NEXT_PUBLIC_SUPABASE_URL` 확인 (https://로 시작)
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` 확인
3. Supabase 프로젝트가 활성 상태인지 확인

#### 문제: OpenAI API error

**증상**: `Error: Incorrect API key provided`

**해결방법**:
1. `OPENAI_API_KEY` 값 확인
2. OpenAI API 크레딧 잔액 확인
3. API 키 권한 확인 (Billing 설정)

#### 문제: Rate limit errors

**증상**: `429 Too Many Requests`

**해결방법**:
1. Rate limit 설정 확인 (`src/lib/rate-limit.ts`)
2. 필요 시 제한값 조정
3. Redis 기반 rate limiting으로 업그레이드 고려

### 데이터베이스 에러

#### 문제: RLS policy violation

**증상**: `new row violates row-level security policy`

**해결방법**:
1. Supabase 대시보드에서 RLS 정책 확인
2. 정책이 올바르게 설정되어 있는지 검증
3. 필요 시 정책 수정

```sql
-- 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'trends';

-- 정책 삭제 및 재생성
DROP POLICY IF EXISTS "policy_name" ON table_name;
CREATE POLICY "new_policy_name" ON table_name ...;
```

#### 문제: Slow queries

**증상**: API 응답 시간이 5초 이상

**해결방법**:
1. 인덱스 확인 및 생성
2. 쿼리 최적화
3. Supabase 대시보드 > **Logs** > **Query Performance** 확인

### 성능 문제

#### 문제: Slow page load

**해결방법**:
1. Next.js Image 최적화 확인
2. Code splitting 확인
3. Vercel Analytics에서 Core Web Vitals 확인
4. 불필요한 의존성 제거

#### 문제: High API response time

**해결방법**:
1. 데이터베이스 쿼리 최적화
2. 캐싱 전략 적용
3. API Route 코드 최적화

---

## 롤백 절차

### Vercel에서 이전 버전으로 롤백

#### 방법 1: Vercel 대시보드

1. Vercel 프로젝트 대시보드 > **Deployments**
2. 이전 버전 선택
3. "Promote to Production" 클릭
4. 즉시 해당 버전으로 롤백됨

#### 방법 2: Git 기반 롤백

```bash
# 이전 커밋으로 되돌리기
git revert HEAD
git push origin main

# 또는 특정 커밋으로 강제 되돌리기 (주의!)
git reset --hard <commit-hash>
git push --force origin main
```

### 데이터베이스 롤백

⚠️ **주의**: 데이터베이스 롤백은 데이터 손실을 초래할 수 있습니다.

#### Supabase 백업 복원

1. Supabase 대시보드 > **Settings** > **Database** > **Backups**
2. 복원할 백업 선택
3. "Restore" 클릭
4. 복원 확인

#### 마이그레이션 롤백

수동으로 생성한 테이블/정책을 롤백해야 하는 경우:

```sql
-- 테이블 삭제
DROP TABLE IF EXISTS table_name CASCADE;

-- 정책 삭제
DROP POLICY IF EXISTS policy_name ON table_name;

-- 함수 삭제
DROP FUNCTION IF EXISTS function_name();
```

---

## 프로덕션 최적화 체크리스트

배포 후 다음 항목들을 확인하여 최적화하세요:

### 성능 최적화

- [ ] 이미지 최적화 (Next.js Image 컴포넌트 사용)
- [ ] Code splitting 적용
- [ ] Tree shaking 확인
- [ ] Bundle size 분석 (`npm run build` 시 출력 확인)
- [ ] Lazy loading 적용
- [ ] API 응답 캐싱 전략

### 보안 강화

- [ ] HTTPS 강제 (Vercel 자동 적용)
- [ ] CSP (Content Security Policy) 설정
- [ ] Rate limiting 적용
- [ ] Input validation 강화
- [ ] SQL Injection 방어 (Supabase 자동 적용)
- [ ] XSS 방어

### SEO 최적화

- [ ] Meta tags 설정 (`layout.tsx`, `page.tsx`)
- [ ] Open Graph 태그 추가
- [ ] Sitemap 생성
- [ ] robots.txt 설정
- [ ] Canonical URLs 설정

### 모니터링 설정

- [ ] Vercel Analytics 활성화
- [ ] 에러 추적 (Sentry 등)
- [ ] API 사용량 모니터링
- [ ] 비용 알림 설정

---

## 추가 리소스

### 공식 문서

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)

### 유용한 도구

- [Vercel CLI](https://vercel.com/docs/cli)
- [Next.js Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

### 커뮤니티

- [Vercel Discord](https://vercel.com/discord)
- [Next.js Discord](https://nextjs.org/discord)
- [Supabase Discord](https://discord.supabase.com)

---

**마지막 업데이트**: 2025-01-15

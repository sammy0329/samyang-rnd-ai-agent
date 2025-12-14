# 프로젝트 작업 계획 (Task Breakdown)

**삼양 트렌드·크리에이터 인사이트 AI 에이전트**

---

## 목차

- [프로젝트 개요](#프로젝트-개요)
- [Phase 1: 프로젝트 초기 설정](#phase-1-프로젝트-초기-설정)
- [Phase 2: 데이터베이스 & 인증](#phase-2-데이터베이스--인증)
- [Phase 3: AI/LLM 통합](#phase-3-aillm-통합)
- [Phase 4: 트렌드 분석 기능](#phase-4-트렌드-분석-기능)
- [Phase 5: 크리에이터 매칭 기능](#phase-5-크리에이터-매칭-기능)
- [Phase 6: 콘텐츠 아이디어 생성](#phase-6-콘텐츠-아이디어-생성)
- [Phase 7: 리포트 생성](#phase-7-리포트-생성)
- [Phase 8: UI/UX 개선](#phase-8-uiux-개선)
- [Phase 9: 최적화 & 성능](#phase-9-최적화--성능)
- [Phase 10: 배포 & 문서화](#phase-10-배포--문서화)

---

## 프로젝트 개요

### 전체 일정

- **총 기간**: 6주 (약 42일)
- **목표**: popow.ai에서 실행 가능한 AI 에이전트 프로토타입 완성
- **체크포인트**: 각 Phase 종료 시 데모 가능한 상태 유지

### 진행 상태 표기

- ⬜ 미시작
- 🔄 진행중
- ✅ 완료
- ⏸️ 보류
- ❌ 취소

---

## Phase 1: 프로젝트 초기 설정

**기간**: 3일 | **목표**: 개발 환경 구축 및 프로젝트 기반 마련

### Epic 1.1: 개발 환경 설정

**담당**: Developer | **우선순위**: P0

#### Task 1.1.1: Node.js 프로젝트 초기화 ✅

- [x] Node.js v20.x 설치 확인 (v20.19.5)
- [x] pnpm 설치 (`npm install -g pnpm`) - v10.25.0
- [x] Git 저장소 초기화
- [x] `.gitignore` 설정
- [x] README.md 기본 구조 작성

**예상 시간**: 30분
**완료 조건**: `git init` 완료 및 기본 파일 커밋 ✅

---

#### Task 1.1.2: Next.js 프로젝트 생성 ✅

```bash
pnpm create next-app@latest . --typescript --tailwind --app --import-alias "@/*"
```

- [x] Next.js 16.0.10 설치
- [x] TypeScript 5.9.3 설정
- [x] Tailwind CSS 4.1.18 설정
- [x] App Router 확인
- [x] 빌드 테스트 성공 (`pnpm build`)

**예상 시간**: 1시간
**완료 조건**: `localhost:3000` 접속 성공 ✅

---

#### Task 1.1.3: ESLint & Prettier 설정 ✅

- [x] ESLint 설정 (Next.js 기본 포함)
- [x] Prettier 3.7.4 설치 및 설정 (`.prettierrc`)
- [x] `prettier-plugin-tailwindcss` 0.7.2 설치
- [x] VSCode 설정 (`.vscode/settings.json`)
- [x] package.json 스크립트 추가 (format, format:check, type-check)
- [ ] Husky 설치 및 pre-commit hook 설정 (보류 - 선택사항)

**예상 시간**: 1시간
**완료 조건**: `pnpm lint` 실행 성공 ✅

---

#### Task 1.1.4: 프로젝트 디렉토리 구조 생성 ✅

```bash
mkdir -p src/{app,components,lib,types,hooks}
mkdir -p src/lib/{ai,db,api,auth,cache,utils}
mkdir -p src/components/{ui,trends,creators,content,shared}
mkdir -p prompts/{system,examples}
mkdir -p scripts/migrations tests/{unit,integration,e2e}
```

- [x] 디렉토리 구조 생성
- [x] TypeScript path alias 설정 (`tsconfig.json`) - 이미 설정됨 (@/\*)
- [ ] 각 디렉토리에 README.md 추가 (선택사항)

**예상 시간**: 30분
**완료 조건**: 모든 디렉토리 생성 완료 ✅

---

### Epic 1.2: 의존성 패키지 설치

**담당**: Developer | **우선순위**: P0

#### Task 1.2.1: UI 라이브러리 설치 ✅

```bash
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button card input dialog select tabs
```

- [x] shadcn/ui 초기화 (Neutral theme)
- [x] Radix UI 컴포넌트 자동 설치
- [x] 기본 UI 컴포넌트 추가 (Button, Card, Input, Dialog, Select, Tabs)
- [x] `lib/utils.ts`에 `cn()` 함수 자동 생성
- [x] components.json 생성

**예상 시간**: 1시간
**완료 조건**: shadcn/ui 컴포넌트 사용 가능 ✅

---

#### Task 1.2.2: 상태 관리 & 데이터 Fetching 설치 ✅

```bash
pnpm add zustand @tanstack/react-query axios
```

- [x] Zustand 5.0.9 설치 및 기본 store 생성 (useAuthStore)
- [x] React Query 5.90.12 설치
- [x] QueryClientProvider 설정 (`app/providers.tsx`)
- [x] Axios 1.13.2 인스턴스 생성 (`lib/api/client.ts`)
  - Request/Response interceptors 구현
  - 인증 토큰 자동 첨부
  - 401 에러 핸들링

**예상 시간**: 1.5시간
**완료 조건**: React Query 설정 완료 ✅

---

#### Task 1.2.3: 폼 & 검증 라이브러리 설치 ✅

```bash
pnpm add react-hook-form zod @hookform/resolvers date-fns
```

- [x] React Hook Form 7.68.0 설치
- [x] Zod 4.1.13 설치
- [x] @hookform/resolvers 5.2.2 설치
- [x] date-fns 4.1.0 설치
- [x] Zod 스키마 작성 (`types/schemas.ts`)
  - loginSchema, signupSchema
  - trendAnalysisSchema
  - contentGenerationSchema
  - creatorMatchingSchema

**예상 시간**: 1시간
**완료 조건**: 스키마 정의 완료 ✅

---

### Epic 1.3: 환경 변수 & 설정

**담당**: Developer | **우선순위**: P0

#### Task 1.3.1: 환경 변수 파일 생성 ✅

- [x] `.env.local` 파일 생성
- [x] `.env.example` 파일 생성
- [x] 필요한 환경 변수 정의:

  ```env
  # Supabase
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=

  # OpenAI
  OPENAI_API_KEY=

  # Anthropic
  ANTHROPIC_API_KEY=

  # Upstash Redis
  UPSTASH_REDIS_REST_URL=
  UPSTASH_REDIS_REST_TOKEN=

  # External APIs
  YOUTUBE_API_KEY=
  SERPAPI_KEY=
  ```

- [x] `docs/study.md`를 `.gitignore`에 추가

**예상 시간**: 30분
**완료 조건**: `.env.example` 커밋 완료 ✅

---

#### Task 1.3.2: Next.js 설정 파일 구성 ✅

- [x] `next.config.ts` 설정
  - 이미지 도메인 허용 (Supabase, TikTok, Instagram, YouTube)
  - 환경 변수 검증
  - Server Actions 설정
  - TypeScript & ESLint strict mode
- [x] `middleware.ts` 기본 구조 작성
  - CORS 설정
  - Rate limiting (메모리 기반)
  - 보안 헤더 추가

**예상 시간**: 1시간
**완료 조건**: 설정 파일 작동 확인 ✅

---

## Phase 2: 데이터베이스 & 인증

**기간**: 4일 | **목표**: Supabase 연동 및 사용자 인증 구현

### Epic 2.1: Supabase 프로젝트 설정

**담당**: Developer | **우선순위**: P0

#### Task 2.1.1: Supabase 프로젝트 생성 ✅

- [x] Supabase 계정 생성 (https://supabase.com)
- [x] 새 프로젝트 생성 (samyang-rnd-ai-agent)
- [x] 리전 선택 (Northeast Asia - Seoul)
- [x] 데이터베이스 비밀번호 설정
- [x] API 키 복사 (`.env.local`에 추가)
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY

**예상 시간**: 30분
**완료 조건**: Supabase Dashboard 접속 가능 ✅

---

#### Task 2.1.2: Supabase 클라이언트 설정 ✅

```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

- [x] Supabase 패키지 설치 (@supabase/supabase-js 2.87.1, @supabase/ssr 0.8.0)
- [x] Supabase 클라이언트 생성 (`lib/db/client.ts`)
  - [x] Browser Client (Client Components용)
  - [x] Server Client (Server Components & API Routes용)
  - [x] Admin Client (Service Role용)
- [x] 쿠키 기반 세션 관리 설정

**예상 시간**: 1시간
**완료 조건**: DB 연결 성공 ✅

---

#### Task 2.1.3: 데이터베이스 스키마 생성 ✅

- [x] SQL 마이그레이션 파일 작성 (`scripts/migrations/001_initial_schema.sql`)
- [x] UUID 확장 활성화
- [x] `users` 테이블 생성
- [x] `trends` 테이블 생성
- [x] `creators` 테이블 생성
- [x] `content_ideas` 테이블 생성
- [x] `reports` 테이블 생성
- [x] `api_usage` 테이블 생성
- [x] 인덱스 생성 (성능 최적화)
- [x] 자동 타임스탬프 트리거 생성
- [x] 마이그레이션 실행 가이드 작성 (`scripts/migrations/README.md`)
- [ ] Supabase SQL Editor에서 실행 (사용자가 수동 실행 필요)

**예상 시간**: 2시간
**완료 조건**: 모든 테이블 생성 완료 ✅ (SQL 파일 준비 완료, 실행 대기)

---

#### Task 2.1.4: Row Level Security (RLS) 설정 ✅

- [x] RLS 정책 SQL 파일 작성 (`scripts/migrations/002_rls_policies.sql`)
- [x] 모든 테이블 RLS 활성화
- [x] `users` 테이블 RLS 정책
  - 사용자는 자신의 프로필만 조회/수정
  - Admin은 모든 사용자 조회 가능
- [x] `trends` 테이블 RLS 정책
  - 인증된 사용자 조회 가능
  - Admin만 수정/삭제 가능
- [x] `creators` 테이블 RLS 정책
  - 인증된 사용자 조회/생성/수정 가능
  - Admin만 삭제 가능
- [x] `content_ideas` 테이블 RLS 정책
  - 모든 인증된 사용자 조회 가능
  - 생성자만 자신의 아이디어 수정/삭제 가능
  - Admin은 모든 아이디어 수정/삭제 가능
- [x] `reports` 테이블 RLS 정책
  - 모든 인증된 사용자 조회 가능
  - 생성자만 자신의 리포트 수정/삭제 가능
  - Admin은 모든 리포트 수정/삭제 가능
- [x] `api_usage` 테이블 RLS 정책
  - 사용자는 자신의 API 사용 내역만 조회
  - Admin은 모든 사용 내역 조회 가능
- [ ] Supabase SQL Editor에서 실행 (사용자가 수동 실행 필요)
- [ ] 정책 테스트

**예상 시간**: 2시간
**완료 조건**: RLS 정책 작동 확인 ✅ (SQL 파일 준비 완료, 실행 및 테스트 대기)

---

### Epic 2.2: 사용자 인증 구현

**담당**: Developer | **우선순위**: P0

#### Task 2.2.1: Auth 헬퍼 함수 작성 ✅

- [x] `lib/auth/supabase.ts` 생성
- [x] 회원가입 함수 (signUp)
- [x] 로그인 함수 (signIn)
- [x] 로그아웃 함수 (signOut)
- [x] 세션 확인 함수 (getSession, getServerSession)
- [x] 사용자 정보 조회 함수 (getCurrentUser, getServerUser)
- [x] 권한 확인 함수 (requireAuth, requireAdmin, checkIsAdmin)

**예상 시간**: 2시간
**완료 조건**: Auth 함수 작동 확인 ✅

---

#### Task 2.2.2: 로그인/회원가입 UI 구현 ✅

- [x] `app/(auth)/layout.tsx` 생성 (Auth 레이아웃)
- [x] `app/(auth)/login/page.tsx` 생성
- [x] `app/(auth)/signup/page.tsx` 생성
- [x] 로그인 폼 컴포넌트 (`components/auth/LoginForm.tsx`)
  - React Hook Form + Zod 검증
  - 에러 메시지 표시
  - 로딩 상태
- [x] 회원가입 폼 컴포넌트 (`components/auth/SignupForm.tsx`)
  - 비밀번호 확인 필드
  - 성공 메시지 및 자동 리다이렉트
- [x] Zod 스키마 검증 (loginSchema, signupSchema)
- [x] 에러 핸들링
- [x] 로딩 상태 표시

**예상 시간**: 3시간
**완료 조건**: 로그인/회원가입 성공 ✅

---

#### Task 2.2.3: 인증 미들웨어 구현 ✅

- [x] `middleware.ts` 생성
- [x] Supabase 세션 관리 및 쿠키 처리
- [x] 보호된 라우트 설정 (/dashboard, /trends, /creators, /content)
- [x] 비인증 사용자 리다이렉트 (→ /login)
- [x] 로그인된 사용자 Auth 페이지 리다이렉트 (→ /dashboard)
- [x] 세션 갱신 로직
- [x] CORS 헤더 (API 라우트용)
- [x] 보안 헤더 추가

**예상 시간**: 2시간
**완료 조건**: 보호된 페이지 접근 제어 확인 ✅

---

#### Task 2.2.4: 대시보드 구현 ✅

- [x] `app/(dashboard)/layout.tsx` 생성 (인증 확인)
- [x] `app/(dashboard)/dashboard/page.tsx` 생성
- [x] DashboardNav 컴포넌트 (네비게이션 바)
  - 사용자 정보 표시
  - Admin 배지
  - 로그아웃 버튼
- [x] 대시보드 페이지 (기능 카드)
- [x] 홈 페이지 (/) 리다이렉트 로직

**예상 시간**: 2시간
**완료 조건**: 대시보드 접근 및 로그아웃 기능 확인 ✅

---

#### Task 2.2.5: Supabase OTP 이메일 인증 구현 ✅

- [x] Supabase 내장 OTP 기능 사용
- [x] `sendSignUpOtp()` 함수 추가 (`lib/auth/client.ts`)
  - Supabase가 자동으로 6자리 코드 생성 및 이메일 전송
  - 별도 이메일 서비스 연동 불필요
- [x] `verifySignUpOtp()` 함수 추가
  - OTP 검증 및 자동 로그인
- [x] `VerificationCodeInput` 컴포넌트 생성
  - 6자리 코드 입력 UI
  - 1분 타이머
  - 자동 포커스 이동
  - 재전송 기능
- [x] `SignupForm` OTP 방식으로 업데이트
  - 2단계 회원가입 플로우 (정보 입력 → 코드 검증)
  - Supabase OTP API 직접 호출
- [x] 불필요한 커스텀 API routes 삭제
  - `/api/auth/send-verification` 제거
  - `/api/auth/verify-code` 제거
- [x] 불필요한 마이그레이션 파일 삭제
  - `verification_codes` 테이블 불필요 (Supabase가 자동 관리)

**예상 시간**: 3시간
**완료 조건**: OTP 이메일 인증 성공 ✅

**개선 사항**:

- 별도 이메일 서비스(SendGrid, AWS SES) 연동 불필요
- 커스텀 데이터베이스 테이블 불필요
- Supabase의 검증된 보안 시스템 사용
- 코드 간소화 및 유지보수성 향상

---

#### Task 2.2.6: 사용자 프로필 페이지 ✅

- [x] `app/(dashboard)/profile/page.tsx` 생성
- [x] 프로필 조회 컴포넌트 (`ProfileInfoSection`)
  - 사용자 정보 표시 (이름, 이메일, 역할, 가입일)
  - 프로필 아이콘
- [x] 프로필 수정 (`ProfileEditForm`)
  - 이름 변경 기능
  - React Hook Form + Zod 검증
  - 에러/성공 메시지 표시
- [x] 비밀번호 변경 (`PasswordChangeForm`)
  - 새 비밀번호 입력 및 확인
  - Zod 스키마 검증
  - Supabase Auth 연동
- [x] Auth 함수 추가 (`lib/auth/client.ts`)
  - `updateProfile()` - 프로필 업데이트
  - `updatePassword()` - 비밀번호 변경
- [x] Zod 스키마 추가 (`types/schemas.ts`)
  - `profileUpdateSchema`
  - `passwordChangeSchema`
- [x] 탭 UI (shadcn/ui Tabs)
  - 프로필 수정 탭
  - 비밀번호 변경 탭
- [x] 네비게이션 링크 추가 (DashboardNav)
  - 사용자 이름 클릭 시 프로필 페이지 이동

**예상 시간**: 2시간
**완료 조건**: 프로필 CRUD 작동 ✅

---

### Epic 2.3: 데이터베이스 쿼리 함수

**담당**: Developer | **우선순위**: P1

#### Task 2.3.1: Trends 쿼리 함수 작성 ✅

- [x] `lib/db/queries/trends.ts` 생성
- [x] `getTrends()` - 트렌드 목록 조회
  - 필터링 (keyword, platform, country, viral_score, samyang_relevance)
  - 정렬 (collected_at, viral_score, samyang_relevance, created_at)
  - 페이지네이션 (limit, offset)
  - 총 개수 반환
- [x] `getTrendById()` - 단일 트렌드 조회
- [x] `createTrend()` - 트렌드 생성
  - 필수 필드 검증 (keyword, platform)
  - 점수 범위 검증 (0-100)
- [x] `updateTrend()` - 트렌드 수정
  - 부분 업데이트 지원
  - 점수 범위 검증
- [x] `deleteTrend()` - 트렌드 삭제
- [x] TypeScript 타입 정의 (`types/trends.ts`)
  - `Trend` - 트렌드 데이터 타입
  - `CreateTrendInput` - 생성 입력 타입
  - `UpdateTrendInput` - 업데이트 입력 타입
  - `TrendFilters` - 필터 타입
  - `TrendResponse`, `TrendsListResponse` - 응답 타입

**예상 시간**: 2시간
**완료 조건**: 모든 CRUD 함수 작동 ✅

---

#### Task 2.3.2: Creators 쿼리 함수 작성 ✅

- [x] `lib/db/queries/creators.ts` 생성
- [x] `getCreators()` - 크리에이터 목록 조회
  - 필터링 (username, platform, content_category, follower_count, engagement_rate, brand_fit_score)
  - 정렬 (follower_count, engagement_rate, brand_fit_score, last_analyzed_at, created_at)
  - 페이지네이션 (limit, offset)
  - 총 개수 반환
- [x] `getCreatorById()` - 단일 크리에이터 조회
- [x] `createCreator()` - 크리에이터 생성
  - 필수 필드 검증 (username, platform, profile_url)
  - 점수 범위 검증 (0-100)
- [x] `updateCreator()` - 크리에이터 수정
  - 부분 업데이트 지원
  - 점수 범위 검증
- [x] `deleteCreator()` - 크리에이터 삭제
- [x] TypeScript 타입 정의 (`types/creators.ts`)
  - `Creator` - 크리에이터 데이터 타입
  - `CreateCreatorInput` - 생성 입력 타입
  - `UpdateCreatorInput` - 업데이트 입력 타입
  - `CreatorFilters` - 필터 타입
  - `CreatorResponse`, `CreatorsListResponse` - 응답 타입

**예상 시간**: 2시간
**완료 조건**: 모든 CRUD 함수 작동 ✅

---

#### Task 2.3.3: Content Ideas 쿼리 함수 작성 ✅

- [x] `lib/db/queries/content-ideas.ts` 생성
- [x] `getContentIdeas()` - 아이디어 목록 조회
  - 필터링 (trend_id, brand_category, tone, target_country, created_by)
  - 정렬 (generated_at, created_at, title)
  - 페이지네이션 (limit, offset)
  - 총 개수 반환
- [x] `getContentIdeaById()` - 단일 아이디어 조회
- [x] `createContentIdea()` - 아이디어 생성
  - 필수 필드 검증 (title)
- [x] `updateContentIdea()` - 아이디어 수정
  - 부분 업데이트 지원
- [x] `deleteContentIdea()` - 아이디어 삭제
- [x] TypeScript 타입 정의 (`types/content.ts`)
  - `ContentIdea` - 콘텐츠 아이디어 데이터 타입
  - `CreateContentIdeaInput` - 생성 입력 타입
  - `UpdateContentIdeaInput` - 업데이트 입력 타입
  - `ContentIdeaFilters` - 필터 타입
  - `ContentIdeaResponse`, `ContentIdeasListResponse` - 응답 타입
  - `BrandCategory`, `Tone`, `Country` - Enum 타입

**예상 시간**: 2시간
**완료 조건**: 모든 CRUD 함수 작동 ✅

---

## Phase 3: AI/LLM 통합

**기간**: 5일 | **목표**: OpenAI 및 Claude API 연동

### Epic 3.1: LLM Provider 설정

**담당**: Developer | **우선순위**: P0

#### Task 3.1.1: Vercel AI SDK 설치 및 설정 ✅

```bash
pnpm add ai @ai-sdk/openai @ai-sdk/anthropic
```

- [x] AI SDK 설치 (ai 5.0.113, @ai-sdk/openai 2.0.86, @ai-sdk/anthropic 2.0.56)
- [x] OpenAI provider 설정 (`lib/ai/providers/openai.ts`)
  - GPT-4 Turbo, GPT-4, GPT-4 Mini, GPT-3.5 Turbo 모델 설정
  - 기본 모델: GPT-4 Mini (비용 효율성)
- [x] Anthropic provider 설정 (`lib/ai/providers/anthropic.ts`)
  - Claude Opus 4.5, Claude Sonnet 4.5, Claude Haiku 모델 설정
  - 기본 모델: Claude Sonnet 4.5 (균형잡힌 성능)
- [x] Provider 선택 로직 (`lib/ai/providers/index.ts`)
  - getModel() - provider와 모델 선택 함수
  - getDefaultProvider() - 환경변수 기반 기본 provider 선택
  - getAvailableProviders() - 사용 가능한 provider 목록
- [x] AI 유틸리티 함수 (`lib/ai/utils.ts`)
  - generateAIText() - 텍스트 생성
  - streamAIText() - 스트리밍 텍스트 생성
  - generateAIObject() - 구조화된 객체 생성
  - simpleChat() - 간단한 채팅 함수 (테스트용)

**예상 시간**: 2시간
**완료 조건**: AI SDK 작동 확인 ✅

---

#### Task 3.1.2: 프롬프트 템플릿 시스템 구축 ✅

- [x] `prompts/system/trend-analyzer.md` 작성
  - 삼양 브랜드 정보 (불닭, 삼양라면, 젤리)
  - 트렌드 분석 기준 (플랫폼별 특성, 분석 요소)
  - 점수 산정 (바이럴 점수, 삼양 연관성 점수)
  - 출력 형식 정의 (JSON 구조)
- [x] `prompts/system/creator-matcher.md` 작성
  - 크리에이터 평가 기준 (정량적/정성적 지표)
  - 적합도 점수 산정 방식 (0-100점)
  - 협업 이력 분석
  - 리스크 요인 평가
  - 인플루언서 규모별 매칭 전략
- [x] `prompts/system/content-generator.md` 작성
  - 숏폼 포맷 분류 (챌린지, 레시피, ASMR, 코미디, 리뷰, 튜토리얼)
  - 브랜드별 콘텐츠 전략
  - 5초 훅 문장 작성법
  - 장면 구성 (3-5컷)
  - 편집 포맷 및 음악 가이드
  - 아이디어 생성 템플릿
- [x] 프롬프트 로더 함수 (`lib/ai/prompts/loader.ts`)
  - loadPrompt() - 프롬프트 파일 로드 및 캐싱
  - buildPrompt() - 시스템 프롬프트 + 사용자 입력 결합
  - buildPromptWithVars() - 변수 치환 지원
  - preloadAllPrompts() - 서버 시작 시 프리로드
  - 캐시 관리 함수들

**예상 시간**: 4시간
**완료 조건**: 모든 프롬프트 템플릿 작성 완료 ✅

---

#### Task 3.1.3: Few-shot 예시 데이터 작성 ✅

- [x] `prompts/examples/few-shot-examples.json` 생성
- [x] 트렌드 분석 예시 3개
  - 예시 1: 미국 TikTok 불닭 챌린지 (바이럴 92점, 연관성 95점)
  - 예시 2: 한국 YouTube Shorts 라면 레시피 (바이럴 78점, 연관성 88점)
  - 예시 3: 일본 Instagram Reels 젤리 ASMR (바이럴 71점, 연관성 82점)
- [x] 크리에이터 매칭 예시 3개
  - 예시 1: Mega 인플루언서 (팔로워 250만, 적합도 94점, 장기 앰버서더 추천)
  - 예시 2: Macro 인플루언서 (팔로워 45만, 적합도 86점, 레시피 시리즈 추천)
  - 예시 3: Micro 인플루언서 (팔로워 8.5만, 적합도 81점, 단발 캠페인 추천)
- [x] 콘텐츠 아이디어 예시 3개
  - 예시 1: 불닭 치즈볼 레시피 (미국, 재미 톤, Recipe 포맷)
  - 예시 2: 카와이 라면 도시락 (일본, 카와이 톤, Tutorial 포맷)
  - 예시 3: 핵불닭 5봉지 챌린지 (한국, 도발적 톤, Challenge 포맷)
- [x] JSON 스키마 검증 완료

**예상 시간**: 3시간
**완료 조건**: 예시 데이터 JSON 파일 완성 ✅

---

### Epic 3.2: AI 유틸리티 함수

**담당**: Developer | **우선순위**: P1

#### Task 3.2.1: LLM 호출 래퍼 함수 작성 ✅

- [x] `lib/ai/utils.ts` 고도화
- [x] `generateAIText()` 래퍼 함수
  - 에러 핸들링 (try-catch)
  - 리트라이 로직 (최대 3회, 지수 백오프)
  - 리트라이 가능한 에러 감지 (rate limit, timeout, network 등)
  - 토큰 사용량 추적 및 로깅
  - 성공/실패 로그 기록
  - 응답 시간 측정
- [x] `streamAIText()` 래퍼 함수
  - 스트리밍 응답 처리
  - 에러 핸들링
- [x] `generateAIObject()` 래퍼 함수
  - 구조화된 객체 생성
  - 리트라이 로직 포함
  - Zod 스키마 검증 지원
  - 토큰 사용량 추적
- [x] 헬퍼 함수들
  - `delay()` - 리트라이 지연
  - `isRetryableError()` - 리트라이 가능 에러 판별
  - `logTokenUsage()` - 토큰 사용량 로깅 (개발 모드)
  - `simpleChat()` - 간단한 채팅 테스트용
- [x] AIMessage 인터페이스 정의
- [x] TokenUsage, AICallLog 인터페이스 정의

**예상 시간**: 3시간
**완료 조건**: 래퍼 함수 테스트 성공 ✅

---

#### Task 3.2.2: 토큰 카운팅 & 비용 추적 ✅

- [x] 토큰 카운터 함수 (`lib/ai/token-counter.ts`)
  - calculateCost() - 토큰 사용량으로 비용 계산
  - estimateCost() - 사전 비용 추정
  - formatCost() - 비용 포맷팅
  - estimateMonthlyCost() - 월별 비용 추정
  - getCheapestModel() - 가장 저렴한 모델 찾기
- [x] 비용 계산 함수 - 2025년 1월 기준 가격
  - GPT-4 Turbo: $10/$30 (input/output per 1M tokens)
  - GPT-4: $30/$60
  - GPT-4 Mini: $0.15/$0.6
  - GPT-3.5 Turbo: $0.5/$1.5
  - Claude Opus: $15/$75
  - Claude Sonnet: $3/$15
  - Claude Haiku: $0.25/$1.25
- [x] API Usage 타입 정의 (`types/api-usage.ts`)
  - APIUsage, CreateAPIUsageInput 인터페이스
  - UsageStats 통계 타입
- [x] API 사용량 쿼리 함수 (`lib/db/queries/api-usage.ts`)
  - createAPIUsage() - 사용량 기록 생성
  - getAPIUsage() - 사용량 목록 조회
  - getUserUsageStats() - 사용자별 통계
  - getSystemUsageStats() - 전체 시스템 통계 (Admin)
  - getEndpointUsageStats() - 엔드포인트별 통계
- [x] 사용량 조회 API (`/api/usage`)
  - GET /api/usage?type=stats - 사용자 통계
  - GET /api/usage?type=system - 시스템 통계 (Admin)
  - GET /api/usage?type=list - 사용량 목록
  - 날짜 필터링 (startDate, endDate)
  - 페이지네이션 지원
- [x] AI utils에 DB 로깅 통합
  - logTokenUsage() 함수 업데이트
  - 자동 비용 계산 및 DB 저장
  - 서버 사이드에서만 동작

**예상 시간**: 2시간
**완료 조건**: 토큰 사용량 DB 저장 확인 ✅

---

#### Task 3.2.3: LLM 응답 캐싱 구현 ✅

```bash
pnpm add @upstash/redis
```

- [x] Upstash Redis 패키지 설치 (@upstash/redis 1.35.8)
- [x] Redis 클라이언트 설정 (`lib/cache/redis.ts`)
  - 싱글톤 패턴으로 클라이언트 관리
  - 환경 변수 기반 설정 (UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN)
  - Graceful degradation (Redis 없어도 앱 동작)
  - 연결 테스트 함수 (testRedisConnection)
- [x] 캐시 헬퍼 함수 (`lib/cache/ai-cache.ts`)
  - generateCacheKey() - SHA256 해시 기반 키 생성
  - getCachedResponse() - 캐시 조회
  - setCachedResponse() - 캐시 저장
  - deleteCachedResponse() - 캐시 삭제
  - clearCacheByPattern() - 패턴 기반 삭제 (Upstash 제한으로 미구현)
  - getCacheStats() - 캐시 통계 조회
  - invalidateCache() - 조건 기반 무효화 (미구현)
- [x] AI utils에 캐싱 통합 (`lib/ai/utils.ts`)
  - generateAIText()에 캐싱 추가
  - generateAIObject()에 캐싱 추가
  - useCache 옵션 (기본값: true)
  - cacheTTL 옵션 (기본값: 24시간)
  - 캐시 히트 시 로그 출력 (개발 모드)
  - 서버 사이드에서만 동작
- [x] TTL 설정 (기본 24시간, 커스터마이징 가능)
- [x] 에러 핸들링 (캐시 실패 시 무시하고 계속 진행)

**예상 시간**: 3시간
**완료 조건**: Redis 캐싱 작동 확인 ✅

**구현 내용**:

- 동일한 메시지 + 설정으로 AI 호출 시 캐시된 응답 반환
- 캐시 키는 메시지 내용, provider, model, temperature로 생성
- 캐시 조회/저장 실패 시에도 정상 작동 (비필수 기능)
- Redis 미설정 시 캐싱 비활성화 (graceful degradation)

---

### Epic 3.3: AI Agent 코어 로직

**담당**: Developer | **우선순위**: P0

#### Task 3.3.1: 트렌드 분석 AI 함수 ✅

- [x] `lib/ai/agents/trend-analyzer.ts` 생성
- [x] `analyzeTrend()` 함수 구현
  - 입력: keyword, platform, country, additionalContext
  - 시스템 프롬프트 로드 (trend-analyzer.md)
  - generateAIObject()로 구조화된 응답 생성
  - 출력: TrendAnalysis 객체
- [x] 응답 스키마 정의 (Zod)
  - TrendAnalysisSchema: viral_score, samyang_relevance, format_type 등
  - 바이럴 점수 (0-100), 삼양 적합성 점수 (0-100)
  - 포맷 분석, 후킹 패턴, 비주얼/음악 패턴
  - 브랜드 적합성 이유, 추천 제품
  - 타겟 오디언스, 예상 도달률, 성공 요인, 리스크
- [x] 에러 핸들링 (try-catch, null 체크)
- [x] 추가 기능
  - analyzeTrends() - 다중 트렌드 병렬 분석
  - compareTrends() - 트렌드 비교 및 순위 매기기

**예상 시간**: 4시간
**완료 조건**: 트렌드 분석 함수 작동 ✅

---

#### Task 3.3.2: 크리에이터 매칭 AI 함수 ✅

- [x] `lib/ai/agents/creator-matcher.ts` 생성
- [x] `matchCreator()` 함수 구현
  - 입력: 크리에이터 정보 (username, platform, metrics), 캠페인 정보
  - 시스템 프롬프트 로드 (creator-matcher.md)
  - generateAIObject()로 구조화된 응답 생성
  - 출력: CreatorMatching 객체
- [x] 응답 스키마 정의 (Zod)
  - CreatorMatchingSchema: total_fit_score (0-100)
  - 정량 평가 (40점): follower_score, view_score, engagement_score
  - 정성 평가 (60점): category_fit, tone_fit, audience_fit
  - 강점/약점 분석, 오디언스 분석, 콘텐츠 스타일 분석
  - 협업 전략: 추천 유형, 콘텐츠 제안, 예상 성과, 예산 권장
  - 리스크 평가: level (high/medium/low), 요인, 완화 방안
- [x] 에러 핸들링 (try-catch, null 체크)
- [x] 추가 기능
  - matchCreators() - 다중 크리에이터 병렬 매칭
  - rankCreators() - 적합도 순위 매기기, 최적 크리에이터 선정

**예상 시간**: 4시간
**완료 조건**: 크리에이터 매칭 함수 작동 ✅

---

#### Task 3.3.3: 콘텐츠 아이디어 생성 AI 함수 ✅

- [x] `lib/ai/agents/content-generator.ts` 생성
- [x] `generateContentIdea()` 함수 구현
  - 입력: 트렌드 정보, 브랜드 정보 (category, tone, country), 플랫폼 선호도
  - 시스템 프롬프트 로드 (content-generator.md)
  - generateAIObject()로 구조화된 응답 생성
  - 출력: ContentIdea 객체
- [x] 응답 스키마 정의 (Zod)
  - ContentIdeaSchema: title, brand_category, tone, target_country
  - format_type: Challenge, Recipe, ASMR, Comedy, Review, Tutorial
  - hook_text (5초 후킹), hook_visual
  - scene_structure: 3-5개 장면 (duration, description, camera_angle, action)
  - editing_format, music_style, props_needed
  - hashtags (5-10개)
  - expected_performance: estimated_views, engagement, virality_potential
  - production_tips, common_mistakes
- [x] 에러 핸들링 (try-catch, null 체크)
- [x] 추가 기능
  - generateContentIdeas() - 다중 콘텐츠 병렬 생성
  - generateContentVariations() - 단일 트렌드에 대한 다양한 버전 생성
  - generatePersonalizedContent() - 크리에이터 맞춤 콘텐츠 생성

**예상 시간**: 4시간
**완료 조건**: 콘텐츠 생성 함수 작동 ✅

---

## Phase 4: 트렌드 분석 기능

**기간**: 5일 | **목표**: 트렌드 수집 및 분석 전체 플로우 구현

### Epic 4.1: 외부 API 통합

**담당**: Developer | **우선순위**: P1

#### Task 4.1.1: YouTube Data API 클라이언트 ✅

- [x] YouTube API 키 발급
- [x] `lib/api/youtube.ts` 생성
- [x] `searchVideos()` 함수
  - 키워드로 숏폼 검색
  - 필터링 (duration, date)
- [x] `getVideoDetails()` 함수
  - 조회수, 좋아요, 댓글 수
- [x] API 응답 타입 정의
- [x] 에러 핸들링 (Quota 초과 등)

**예상 시간**: 3시간
**완료 조건**: YouTube 검색 성공 ✅
**완료 일시**: 2024-12-13
**커밋**: 13f9e68

---

#### Task 4.1.2: SerpAPI 클라이언트 (TikTok/Instagram 대체) ✅

- [x] SerpAPI 키 발급
- [x] `lib/api/serpapi.ts` 생성
- [x] TikTok 검색 함수
- [x] Instagram Reels 검색 함수
- [x] 검색 결과 파싱
- [x] API 응답 타입 정의

**예상 시간**: 3시간
**완료 조건**: SerpAPI 검색 성공 ✅
**완료 일시**: 2024-12-13
**커밋**: 9be2716

---

#### Task 4.1.3: 트렌드 데이터 수집 스크립트 ✅

- [x] `lib/api/trend-collector.ts` 생성
- [x] `collectTrends()` 함수
  - 여러 플랫폼에서 데이터 수집
  - 중복 제거
  - 데이터 정규화
- [x] 수집 스케줄링 로직 (선택 사항)
- [x] 에러 핸들링

**예상 시간**: 4시간
**완료 조건**: 트렌드 데이터 수집 성공 ✅
**완료 일시**: 2025-12-13
**커밋**: 6699e4f

---

### 📌 Epic 4.1 완료 후 향후 개선 사항

#### 1. TikTok/Instagram 전용 API 연동 필요

**현재 상황:**

- SerpAPI는 Google Videos API를 사용하여 TikTok/Instagram 검색
- Google은 자사 플랫폼(YouTube)을 우선 노출하므로 TikTok/Instagram 결과 거의 없음
- 테스트 결과: TikTok/Instagram 검색 시 대부분 0개 반환

**권장 해결 방안:**

- **TikTok**: TikTok Research API (공식, 연구/학술 목적) 또는 Apify/ScrapFly 등 스크래핑 서비스
- **Instagram**: Instagram Graph API (공식, 제한적) 또는 Apify/ScrapFly 등 스크래핑 서비스
- **현재 구조**: `src/lib/api/trend-collector.ts`의 플랫폼별 수집 함수만 교체하면 바로 작동 가능

**관련 문서:**

- [docs/TroubleShooting.md - SerpAPI TikTok/Instagram 제약](./TroubleShooting.md#serpapi---tiktokinstagram-검색-결과-0개-문제)
- [docs/SERPAPI_SETUP.md - 제약 사항](./SERPAPI_SETUP.md#제약-사항)

**우선순위**: P1 (프로덕션 배포 시 필수)

---

#### 2. 현재 구현 상태 요약

**정상 작동:**

- ✅ YouTube 트렌드 수집: YouTube Data API v3 사용
- ✅ 멀티 플랫폼 데이터 정규화 프레임워크
- ✅ URL/제목 기반 중복 제거
- ✅ 플랫폼별 에러 핸들링

**제한적 작동:**

- ⚠️ TikTok 트렌드 수집: SerpAPI 사용 → 거의 0개 반환
- ⚠️ Instagram 트렌드 수집: SerpAPI 사용 → 거의 0개 반환

**다음 단계 시 유의사항:**

- Epic 4.2 진행 시 YouTube 데이터만 사용하여 트렌드 분석 가능
- TikTok/Instagram은 별도 API 연동 후 추가 구현 권장

---

### Epic 4.2: 트렌드 분석 API

**담당**: Developer | **우선순위**: P0

#### Task 4.2.1: 트렌드 분석 API 엔드포인트 ✅

- [x] `app/api/trends/analyze/route.ts` 생성
- [x] POST 요청 핸들러
  - 요청 바디 검증 (Zod)
  - 트렌드 데이터 수집
  - AI 분석 호출
  - 결과 DB 저장
  - 응답 반환
- [x] Rate limiting 적용 (IP 기반, 5분에 10회)
- [x] 에러 핸들링
- [x] API 테스트 (테스트 스크립트 작성)

**예상 시간**: 4시간
**완료 조건**: API 호출 성공 ✅
**완료 일시**: 2025-12-13
**구현 내용**:

- POST /api/trends/analyze 엔드포인트
- Zod 스키마 검증 (keyword, platform, country)
- 트렌드 데이터 수집 (trend-collector 연동)
- AI 분석 (trend-analyzer 연동)
- DB 저장 (Supabase trends 테이블)
- Rate Limiting (Upstash Redis, 5분에 10회)
- API 사용량 추적
- 테스트 스크립트: scripts/test-trend-analyze-api.ts

**주요 해결 이슈**:

1. RLS 정책 우회: createTrend, createAPIUsage에서 createAdminClient() 사용
2. AI 스키마 정렬: prompts/system/trend-analyzer.md를 Zod 스키마와 일치하도록 수정
3. Provider 초기화: API 키 없을 때 모듈 로드 시점 에러 방지 (optional 처리)

---

#### Task 4.2.2: 트렌드 목록 조회 API ✅

- [x] `app/api/trends/route.ts` 생성
- [x] GET 요청 핸들러
  - 쿼리 파라미터 파싱 (페이지네이션, 필터링)
  - DB 조회
  - 응답 반환
- [x] 정렬 옵션 (최신순, 점수순)
- [x] 필터링 (플랫폼, 국가, 키워드)

**예상 시간**: 2시간
**완료 조건**: API 호출 성공 ✅
**완료 일시**: 2025-12-13
**구현 내용**:

- GET /api/trends 엔드포인트
- Zod 스키마 검증 (keyword, platform, country, minViralScore, minSamyangRelevance, sortBy, sortOrder, limit, offset)
- 정렬 옵션: collected_at, viral_score, samyang_relevance, created_at (asc/desc)
- 필터링: 키워드, 플랫폼, 국가, 최소 점수
- 페이지네이션: limit (1-100, 기본 50), offset
- 테스트 스크립트: scripts/test-trends-list-api.ts

**주요 해결 이슈**:

1. Zod 에러 핸들링: error.errors → error.issues로 수정 (Zod 공식 API)

---

#### Task 4.2.3: 일일 트렌드 리포트 API ✅

- [x] `app/api/trends/daily/route.ts` 생성
- [x] GET 요청 핸들러
  - 오늘 수집된 트렌드 조회
  - Top 5 트렌드 선정
  - 요약 정보 생성
- [x] 캐싱 적용 (1시간)

**예상 시간**: 2시간
**완료 조건**: API 호출 성공 ✅
**완료 일시**: 2025-12-13
**구현 내용**:

- GET /api/trends/daily 엔드포인트
- 오늘(00:00~23:59) 수집된 트렌드 필터링 (collected_at 기준)
- 바이럴 점수 + 삼양 연관성 합산하여 Top 5 선정
- 요약 통계: 총 개수, 평균 점수, 플랫폼별 분포
- 1시간 캐싱 (revalidate: 3600, Cache-Control 헤더)
- 테스트 스크립트: scripts/test-daily-trends-api.ts

---

### Epic 4.3: 트렌드 분석 UI

**담당**: Developer | **우선순위**: P0

#### Task 4.3.1: 트렌드 분석 페이지 레이아웃 ✅

- [x] `app/(dashboard)/trends/page.tsx` 생성
- [x] 헤더 섹션
  - 페이지 제목
  - 분석 버튼
- [x] 필터링 섹션
  - 키워드 입력
  - 플랫폼 선택
  - 국가 선택
- [x] 결과 섹션 (그리드/리스트)

**예상 시간**: 3시간
**완료 조건**: 레이아웃 완성 ✅
**완료 일시**: 2025-12-13
**구현 내용**:

- app/(dashboard)/trends/page.tsx 생성
- 헤더: 제목, 설명, "새 분석 시작" 버튼
- 필터링: 키워드 입력, 플랫폼 선택 (YouTube/TikTok/Instagram), 국가 선택 (KR/US/JP)
- 고품질 필터 체크박스 (바이럴 80+)
- 정렬 드롭다운 (최신순/바이럴 점수순/삼양 연관성순)
- 빈 상태 UI (CTA 포함)
- shadcn/ui 컴포넌트 사용 (Button, Card, Input)
- 반응형 그리드 레이아웃 (md:grid-cols-2, lg:grid-cols-3)

---

#### Task 4.3.2: 트렌드 분석 폼 컴포넌트 ✅

- [x] `components/trends/TrendAnalysisForm.tsx` 생성
- [x] React Hook Form 연동
- [x] Zod 스키마 검증
- [x] 키워드 입력 필드
- [x] 플랫폼 선택 (Select)
- [x] 국가 선택 (Select)
- [x] 제출 버튼
- [x] 로딩 상태 표시
- [x] 에러 메시지 표시

**예상 시간**: 3시간
**완료 조건**: 폼 제출 성공 ✅
**완료 일시**: 2025-12-13
**구현 내용**:

- components/trends/TrendAnalysisForm.tsx 생성
- React Hook Form + @hookform/resolvers 연동
- Zod 스키마 검증 (API 스키마와 동일)
- 폼 필드:
  - keyword: 필수, 1-100자
  - platform: YouTube/TikTok/Instagram 선택
  - country: KR/US/JP 선택 (기본: KR)
  - additionalContext: 선택적 텍스트 영역
- 로딩 상태: 스피너 애니메이션 + "분석 중..." 메시지
- 에러 처리:
  - 클라이언트 검증 에러 (Zod)
  - API 에러 (400, 429, 500)
  - Rate limit 감지 및 안내
- 성공 시: onSuccess 콜백 + 폼 초기화
- Dialog 컴포넌트 통합 (trends/page.tsx)
- 성공 알림 메시지 표시

---

#### Task 4.3.3: 트렌드 카드 컴포넌트 ✅

- [x] `components/trends/TrendCard.tsx` 생성
- [x] 트렌드 정보 표시
  - 키워드
  - 플랫폼 아이콘
  - 포맷 유형
  - 바이럴 점수
  - 삼양 연관성 점수
- [x] 상세보기 버튼
- [x] 아이디어 생성 버튼

**예상 시간**: 2시간
**완료 조건**: 카드 렌더링 성공 ✅
**완료 일시**: 2025-12-13
**구현 내용**:

- components/trends/TrendCard component 생성
- 플랫폼별 아이콘 및 배지:
  - YouTube Shorts: 📹 (빨간색)
  - TikTok: 🎵 (검은색)
  - Instagram Reels: 📱 (핑크색)
- 국가 배지 (KR/US/JP)
- 상대 시간 표시 (X일 전, X시간 전, 방금 전)
- 점수 시각화:
  - 진행바 (Progress bar)
  - 색상 코딩: 80+ 초록, 60+ 노랑, 40+ 주황, <40 빨강
  - X/100 형식 표시
- 포맷 유형 표시
- 액션 버튼:
  - 상세보기 (눈 아이콘)
  - 아이디어 생성 (전구 아이콘, 파란색)
- trends/page.tsx 통합:
  - 빈 상태 vs 카드 그리드 조건부 렌더링
  - 반응형 그리드 (md:2열, lg:3열)
  - 트렌드 개수 표시
- Hover 효과: shadow-lg 전환

---

#### Task 4.3.4: 트렌드 상세 모달 ✅

- [x] `components/trends/TrendDetailModal.tsx` 생성
- [x] Dialog 컴포넌트 사용
- [x] 트렌드 전체 정보 표시
  - 훅 패턴
  - 시각적 패턴
  - 음악 패턴
  - 댓글 분석
  - 삼양 적용 사례
- [x] 닫기 버튼

**예상 시간**: 3시간
**완료 조건**: 모달 작동 확인 ✅
**완료 일시**: 2025-12-13
**구현 내용**:

- components/trends/TrendDetailModal.tsx 생성
- shadcn/ui Dialog 컴포넌트 사용
- 기본 정보 섹션:
  - 플랫폼 이름, 국가, 포맷 유형, 수집 시간
- 점수 섹션:
  - 바이럴 점수 / 삼양 연관성 점수
  - 배지 (80+ 초록, 60+ 노랑, 40+ 주황, <40 빨강)
  - 진행바 시각화
- 패턴 분석 섹션:
  - 훅 패턴 (🎣 아이콘)
  - 시각적 패턴 (🎨 아이콘)
  - 음악 패턴 (🎵 아이콘)
  - 빈 상태 처리
- 추가 분석 정보 (analysis_data):
  - JSON 데이터 표시
  - 파란색 배경 섹션
- 액션 버튼:
  - 닫기 (아웃라인)
  - 콘텐츠 아이디어 생성 (파란색)
- trends/page.tsx 통합:
  - selectedTrend 상태 관리
  - handleViewDetail 구현
  - 모달 열기/닫기 제어
- 반응형: max-w-3xl, max-h-90vh, overflow-y-auto

---

#### Task 4.3.5: 트렌드 목록 & 페이지네이션 ✅

- [x] `hooks/useTrends.ts` 생성 (React Query hook)
- [x] React Query로 데이터 Fetching
- [x] 페이지네이션 (limit/offset)
- [x] 로딩 스켈레톤 (`TrendCardSkeleton.tsx`)
- [x] 빈 상태 처리
- [x] 에러 상태 처리 (retry 버튼 포함)
- [x] trends/page.tsx에 통합
- [x] 자동 refetch (분석 성공 시)
- [x] 필터링 및 검색 기능 연결
  - 필터 상태 관리 (keyword, platform, country, minViralScore)
  - 검색 버튼 클릭 핸들러 추가
  - Enter 키로 검색 가능
  - useTrends 훅에 필터 파라미터 전달
  - 플랫폼 값 매핑 (youtube → shorts, instagram → reels)
  - 정렬 기능 연결 (최신순, 바이럴 점수순, 삼양 연관성순, 오름차순/내림차순)
  - 고품질 필터 (바이럴 80+)

**예상 시간**: 3시간
**완료 조건**: 목록 표시 성공 ✅
**완료 일시**: 2025-01-XX
**구현 내용**:

- 필터 상태를 useState로 관리
- 검색 버튼 클릭 또는 Enter 키 입력 시 필터 적용
- React Query의 queryKey에 필터 포함하여 자동 재조회
- 플랫폼 값 매핑 함수 (mapPlatformToAPI)
- 정렬 값 매핑 함수 (mapSortToAPI)
- 필터 변경 시 useTrends 자동 재조회

---

## Phase 5: 크리에이터 매칭 기능

**기간**: 4일 | **목표**: 크리에이터 프로필 분석 및 매칭

### Epic 5.1: 크리에이터 데이터 수집

**담당**: Developer | **우선순위**: P1

#### Task 5.1.1: 크리에이터 프로필 크롤링 (선택 사항) ⬜

- [ ] `lib/api/creator-scraper.ts` 생성
- [ ] 프로필 URL 파싱
- [ ] 공개 정보 추출
  - 팔로워 수
  - 평균 조회수
  - 콘텐츠 카테고리
- [ ] Rate limiting 고려

**예상 시간**: 4시간
**완료 조건**: 프로필 정보 추출 성공

---

#### Task 5.1.2: 크리에이터 수동 등록 기능 ✅

- [x] `components/creators/CreatorMatchForm.tsx` 생성
- [x] 폼 필드 (React Hook Form + Zod 검증)
  - 기본 정보: 사용자명, 플랫폼, 프로필 URL (필수)
  - 통계 정보: 팔로워 수, 평균 조회수, 참여율 (선택)
  - 크리에이터 정보: 콘텐츠 카테고리, 톤앤매너 (선택)
  - 캠페인 정보: 캠페인 목표, 타겟 오디언스, 핵심 메시지 (선택)
- [x] 검증 로직 (Zod schema)
- [x] 제출 핸들러 (POST /api/creators/match 호출)
- [x] 로딩/성공/에러 상태 처리
- [x] /creators 페이지 다이얼로그에 통합
- [x] 매칭 성공 시 자동 refetch

**예상 시간**: 3시간
**완료 조건**: 크리에이터 등록 성공 ✅

---

### Epic 5.2: 크리에이터 매칭 API

**담당**: Developer | **우선순위**: P0

#### Task 5.2.1: 크리에이터 매칭 API 엔드포인트 ✅

- [x] `app/api/creators/match/route.ts` 생성
- [x] POST 요청 핸들러
  - 요청 바디 검증 (Zod 스키마)
  - AI 매칭 분석 호출 (matchCreator)
  - 적합도 점수 산정
  - 결과 DB 저장 (createCreator/updateCreator)
  - 응답 반환
- [x] Rate limiting (IP 기반, 5분에 20회)
- [x] API 사용량 추적
- [x] 에러 핸들링

**예상 시간**: 3시간
**완료 조건**: API 호출 성공 ✅

---

#### Task 5.2.2: 크리에이터 목록 조회 API ✅

- [x] `app/api/creators/route.ts` 생성
- [x] GET 요청 핸들러
  - 페이지네이션 (limit/offset)
  - 필터링 (username, platform, content_category, follower_count, engagement_rate, brand_fit_score)
  - 정렬 (follower_count, engagement_rate, brand_fit_score, last_analyzed_at, created_at)
- [x] 응답 반환 (creators 배열, total count)
- [x] API 사용량 추적

**예상 시간**: 2시간
**완료 조건**: API 호출 성공 ✅

---

#### Task 5.2.3: 크리에이터 프로필 분석 API ✅

- [x] `app/api/creators/[id]/route.ts` 생성
- [x] GET 요청 핸들러
  - 크리에이터 ID로 조회 (getCreatorById)
  - 상세 정보 반환
  - 협업 전략 포함 (collaboration_history)
  - 리스크 평가 포함 (risk_factors)
  - 분석 데이터 포함 (analysis_data)
- [x] 404/500 에러 핸들링
- [x] API 사용량 추적

**예상 시간**: 1시간
**완료 조건**: API 호출 성공 ✅

---

### Epic 5.3: 크리에이터 매칭 UI

**담당**: Developer | **우선순위**: P0

#### Task 5.3.1: 크리에이터 페이지 레이아웃 ✅

- [x] `app/(dashboard)/creators/page.tsx` 생성
- [x] 헤더 섹션 (제목, 설명, "새 크리에이터 매칭" 버튼)
- [x] 필터링 섹션
  - 크리에이터명 검색
  - 플랫폼 선택 (YouTube, TikTok, Instagram)
  - 콘텐츠 카테고리 검색
  - 최소 적합도 점수 입력
  - 고적합도 필터 체크박스 (80점 이상)
- [x] 크리에이터 그리드 (로딩/에러/빈 상태/데이터 상태)
- [x] 정렬 기능 (적합도, 팔로워, 참여율, 최신순)

**예상 시간**: 2시간
**완료 조건**: 레이아웃 완성 ✅

---

#### Task 5.3.2: 크리에이터 카드 컴포넌트 ✅

- [x] `components/creators/CreatorCard.tsx` 생성
- [x] 크리에이터 정보 표시
  - 사용자명
  - 플랫폼 아이콘 및 뱃지 (📹 YouTube, 🎵 TikTok, 📱 Instagram)
  - 팔로워 수 (K/M 단위)
  - 평균 조회수 (K/M 단위)
  - 참여율 (백분율)
  - 적합도 점수 (Progress bar + 색상 코딩)
  - 톤앤매너
  - 마지막 분석 시간
- [x] 상세보기 버튼
- [x] 프로필 방문 버튼

**예상 시간**: 3시간
**완료 조건**: 카드 렌더링 성공 ✅

---

#### Task 5.3.3: 크리에이터 상세 모달 ✅

- [x] `components/creators/CreatorDetailModal.tsx` 생성
- [x] 전체 프로필 정보 (플랫폼, URL, 팔로워, 조회수, 참여율, 카테고리)
- [x] 적합도 분석 결과
  - 종합 점수 (Progress bar + 뱃지)
  - 정량 평가 (팔로워/조회수/참여율 점수)
  - 정성 평가 (카테고리/톤앤매너/오디언스 적합성)
  - 톤앤매너 상세
  - 강점 리스트
  - 약점 리스트
  - 오디언스 분석
  - 콘텐츠 스타일 분석
  - 추천 제품 (한글 번역 뱃지)
- [x] 협업 전략 섹션 (추천 유형, 콘텐츠 제안, 예상 성과, 예산 권장사항)
- [x] 리스크 평가 (레벨 뱃지, 리스크 요인, 완화 방안)
- [x] 닫기 및 프로필 방문 버튼

**예상 시간**: 3시간
**완료 조건**: 모달 작동 확인 ✅

---

#### Task 5.3.4: 크리에이터 목록 & 필터링 ✅

- [x] `hooks/useCreators.ts` 생성 (React Query hook)
- [x] React Query로 데이터 Fetching
- [x] 필터링 로직 (username, platform, content_category, minBrandFitScore)
- [x] 정렬 로직 (brand_fit_score, follower_count, engagement_rate, created_at)
- [x] 페이지네이션 (limit/offset)
- [x] creators 페이지에 통합
- [x] 로딩/에러/빈 상태 처리

**예상 시간**: 3시간
**완료 조건**: 목록 표시 및 필터링 성공 ✅

---

## Phase 6: 콘텐츠 아이디어 생성

**기간**: 4일 | **목표**: AI 기반 숏폼 콘텐츠 아이디어 자동 생성

### Epic 6.1: 콘텐츠 생성 API

**담당**: Developer | **우선순위**: P0

#### Task 6.1.1: 콘텐츠 아이디어 생성 API ✅

- [x] `lib/db/queries/content.ts` 생성 (DB 쿼리 함수)
- [x] `app/api/content/generate/route.ts` 생성
- [x] POST 요청 핸들러
  - Zod 스키마로 요청 바디 검증
    - brandCategory (buldak/samyang_ramen/jelly)
    - tone (fun/kawaii/provocative/cool)
    - targetCountry (KR/US/JP)
    - trendId, trendKeyword, trendDescription (옵션)
    - preferredPlatform (옵션)
    - additionalRequirements (옵션)
  - generateContentVariations로 AI 콘텐츠 3개 생성 (temperature 다르게)
  - 성공한 아이디어들을 DB에 저장
  - 응답 반환 (생성된 아이디어 배열 + 성공 개수)
- [x] Rate Limiting (IP 기반, 5분에 5회)
- [x] API 사용량 기록
- [x] 에러 핸들링

**예상 시간**: 4시간
**완료 조건**: API 호출 성공 ✅

---

#### Task 6.1.2: 콘텐츠 아이디어 목록 API ✅

- [x] `app/api/content/route.ts` 생성
- [x] GET 요청 핸들러
  - 페이지네이션 (limit/offset, 최대 100개)
  - 필터링 (trend_id, brand_category, tone, target_country, myIdeas)
  - 정렬 (generated_at, created_at, title)
  - sortOrder (asc/desc)
- [x] API 사용량 기록
- [x] 에러 핸들링

**예상 시간**: 2시간
**완료 조건**: API 호출 성공 ✅

---

### Epic 6.2: 콘텐츠 아이디어 UI

**담당**: Developer | **우선순위**: P0

#### Task 6.2.1: 콘텐츠 생성 페이지 레이아웃 ✅

- [x] `app/(dashboard)/content/page.tsx` 생성
- [x] 헤더 섹션 (제목, 설명)
- [x] 생성 폼 섹션
  - 브랜드 카테고리 선택 드롭다운
  - 톤앤매너 선택 드롭다운
  - 타깃 국가 선택 드롭다운
  - 아이디어 생성 버튼
- [x] 결과 표시 섹션
  - 로딩 상태 (3개 스켈레톤)
  - 빈 상태 메시지
  - 아이디어 카드 그리드 (플레이스홀더)
- [x] 네비게이션에 이미 "콘텐츠 아이디어" 링크 존재 확인

**예상 시간**: 2시간
**완료 조건**: 레이아웃 완성 ✅

---

#### Task 6.2.2: 콘텐츠 생성 폼 컴포넌트 ✅

- [x] `components/content/ContentGenerationForm.tsx` 생성
- [x] 폼 필드
  - 브랜드 카테고리 선택 (불닭/삼양라면/젤리)
  - 톤앤매너 선택 (재미/카와이/도발적/쿨톤)
  - 타깃 국가 선택
  - 선호 플랫폼 선택 (옵션)
  - 추가 요구사항 입력 (옵션)
- [x] React Hook Form + Zod 검증 로직
- [x] API 제출 핸들러 (`POST /api/content/generate`)
- [x] 로딩 상태 및 에러 처리
- [x] Content 페이지에 통합

**예상 시간**: 3시간
**완료 조건**: 폼 제출 성공 ✅

---

#### Task 6.2.3: 콘텐츠 아이디어 카드 컴포넌트 ✅

- [x] `components/content/ContentIdeaCard.tsx` 생성
- [x] 아이디어 정보 표시
  - 포맷 이름 (Challenge, Recipe, ASMR, Comedy, Review, Tutorial)
  - 플랫폼 배지 (TikTok, Instagram, YouTube)
  - 브랜드/톤/국가 메타 태그
  - 5초 훅 문장
  - 장면 구성 (3-5컷, 3개까지 미리보기)
  - 편집 포맷
  - 음악 스타일
  - 예상 성과 (바이럴 잠재력, 조회수)
- [x] 클릭 시 상세 모달 열기
- [x] 호버 효과 및 상세보기 버튼

**예상 시간**: 2시간
**완료 조건**: 카드 렌더링 성공 ✅

---

#### Task 6.2.4: 콘텐츠 아이디어 상세 모달 ✅

- [x] `components/content/ContentIdeaDetailModal.tsx` 생성
- [x] Dialog 컴포넌트 사용
- [x] 전체 아이디어 정보 표시
  - 기본 정보 (포맷, 플랫폼, 브랜드, 톤, 국가)
  - 후킹 전략 (훅 텍스트, 훅 비주얼)
  - 전체 장면 구성 (장면별 상세 정보)
  - 제작 가이드 (편집 포맷, 음악 스타일)
  - 필요 소품/재료
  - 추천 해시태그
  - 예상 성과 (조회수, 참여율, 바이럴 잠재력)
  - 제작 팁
  - 피해야 할 실수
- [x] 촬영 가이드 다운로드 버튼 (UI만)
- [x] 닫기 버튼

**예상 시간**: 3시간
**완료 조건**: 모달 작동 확인 ✅

---

#### Task 6.2.5: 콘텐츠 아이디어 목록 ✅

- [x] `hooks/useContentIdeas.ts` 생성 (React Query hook)
- [x] React Query로 데이터 Fetching
- [x] 필터링 지원 (brandCategory, tone, targetCountry, limit, offset)
- [x] Content 페이지에 통합
  - 생성된 아이디어와 기존 아이디어 합치기
  - ContentIdeaCard로 그리드 표시
  - ContentIdeaDetailModal 연동
  - 생성 성공 시 목록 자동 갱신
- [x] 로딩/빈 상태 처리

**예상 시간**: 2시간
**완료 조건**: 목록 표시 성공 ✅

---

## Phase 7: 리포트 생성

**기간**: 3일 | **목표**: 데일리 리포트 및 리포트 내보내기

### Epic 7.1: 리포트 생성 로직

**담당**: Developer | **우선순위**: P1

#### Task 7.1.1: 데일리 트렌드 리포트 생성 ✅

- [x] `lib/reports/daily-trend-report.ts` 생성
- [x] `generateDailyTrendReport()` 함수
  - 오늘 수집된 트렌드 조회
  - Top 5 선정
  - 요약 생성 (LLM 활용)
  - 리포트 객체 생성
- [x] 리포트 템플릿 (Markdown/HTML)

**예상 시간**: 3시간
**완료 조건**: 리포트 생성 성공

---

#### Task 7.1.2: 크리에이터 매칭 리포트 생성 ✅

- [x] `lib/reports/creator-match-report.ts` 생성
- [x] `generateCreatorMatchReport()` 함수
  - 매칭된 크리에이터 조회
  - 적합도 점수별 정렬
  - 요약 생성
  - 리포트 객체 생성

**예상 시간**: 2시간
**완료 조건**: 리포트 생성 성공

---

#### Task 7.1.3: 콘텐츠 아이디어 리포트 생성 ✅

- [x] `lib/reports/content-idea-report.ts` 생성
- [x] `generateContentIdeaReport()` 함수
  - 생성된 아이디어 조회
  - 촬영 가능한 아이디어 우선 정렬
  - 리포트 객체 생성

**예상 시간**: 2시간
**완료 조건**: 리포트 생성 성공

---

### Epic 7.2: 리포트 API

**담당**: Developer | **우선순위**: P1

#### Task 7.2.1: 리포트 생성 API ✅

- [x] `app/api/reports/route.ts` 생성
- [x] POST 요청 핸들러
  - 리포트 타입 선택
  - 리포트 생성 함수 호출
  - DB 저장
  - 응답 반환

**예상 시간**: 2시간
**완료 조건**: API 호출 성공

---

#### Task 7.2.2: 리포트 조회 API ✅

- [x] GET 요청 핸들러
  - 리포트 목록 조회
  - 필터링 (타입, 날짜)
  - 페이지네이션

**예상 시간**: 1시간
**완료 조건**: API 호출 성공

---

#### Task 7.2.3: 리포트 내보내기 API ✅

- [x] `app/api/reports/export/route.ts` 생성
- [x] POST 요청 핸들러
  - 리포트 ID
  - 내보내기 형식 (JSON/PDF)
  - 파일 생성
  - 응답 반환 (다운로드)

**예상 시간**: 3시간
**완료 조건**: 파일 다운로드 성공

---

### Epic 7.3: 리포트 UI

**담당**: Developer | **우선순위**: P1

#### Task 7.3.1: 리포트 페이지 레이아웃 ✅

- [x] `app/(dashboard)/reports/page.tsx` 생성
- [x] 헤더 섹션
  - 리포트 생성 버튼
- [x] 리포트 목록 섹션
- [x] 필터링 섹션

**예상 시간**: 2시간
**완료 조건**: 레이아웃 완성

---

#### Task 7.3.2: 리포트 카드 컴포넌트 ✅

- [x] `components/reports/ReportCard.tsx` 생성
- [x] 리포트 정보 표시
  - 타입
  - 생성 날짜
  - 미리보기
- [x] 상세보기 버튼
- [x] 다운로드 버튼

**예상 시간**: 2시간
**완료 조건**: 카드 렌더링 성공

---

#### Task 7.3.3: 리포트 상세 페이지 ✅

- [x] `components/reports/ReportDetailModal.tsx` 생성 (모달로 구현)
- [x] 리포트 전체 내용 표시
- [x] 내보내기 버튼
- [x] 공유 버튼 (옵션)

**예상 시간**: 3시간
**완료 조건**: 상세 페이지 작동

---

## Phase 8: UI/UX 개선

**기간**: 4일 | **목표**: 사용자 경험 향상

### Epic 8.1: 대시보드 구현

**담당**: Developer | **우선순위**: P0

#### Task 8.1.1: 대시보드 레이아웃 ✅

- [x] `app/(dashboard)/page.tsx` 개선
- [x] 네비게이션 바 (Sidebar)
  - 트렌드 링크
  - 크리에이터 링크
  - 콘텐츠 링크
  - 리포트 링크
  - 프로필 링크
- [x] 헤더 (TopBar)
  - 사용자 정보
  - 로그아웃 버튼
- [x] 메인 콘텐츠 영역

**예상 시간**: 4시간
**완료 조건**: 대시보드 레이아웃 완성

---

#### Task 8.1.2: 대시보드 위젯 구현 ✅

- [x] 오늘의 트렌드 요약 위젯
- [x] 최근 생성된 아이디어 위젯
- [x] 추천 크리에이터 위젯
- [x] API 사용량 위젯 (차트)

**예상 시간**: 4시간
**완료 조건**: 모든 위젯 작동

---

### Epic 8.2: 반응형 디자인

**담당**: Developer | **우선순위**: P1

#### Task 8.2.1: 모바일 레이아웃 최적화 ✅

- [x] Tailwind 반응형 클래스 적용
- [x] 사이드바 → 햄버거 메뉴
- [x] 그리드 → 단일 컬럼
- [x] 모바일 테스트

**예상 시간**: 3시간
**완료 조건**: 모바일 화면 정상 표시

---

#### Task 8.2.2: 태블릿 레이아웃 최적화 ✅

- [x] 2컬럼 그리드 적용
- [x] 사이드바 축소/확장
- [x] 태블릿 테스트

**예상 시간**: 2시간
**완료 조건**: 태블릿 화면 정상 표시

---

### Epic 8.3: 로딩 & 에러 상태

**담당**: Developer | **우선순위**: P0

#### Task 8.3.1: 로딩 스켈레톤 구현 ✅

- [x] `components/shared/Skeleton.tsx` 생성
- [x] 트렌드 카드 스켈레톤
- [x] 크리에이터 카드 스켈레톤
- [x] 콘텐츠 카드 스켈레톤
- [x] 리스트 스켈레톤

**예상 시간**: 2시간
**완료 조건**: 스켈레톤 표시 확인

---

#### Task 8.3.2: 에러 바운더리 구현 ✅

- [x] `components/shared/ErrorBoundary.tsx` 생성
- [x] 전역 에러 바운더리 (`app/error.tsx`)
- [x] 페이지별 에러 바운더리
- [x] 에러 메시지 커스터마이징

**예상 시간**: 2시간
**완료 조건**: 에러 핸들링 확인

---

#### Task 8.3.3: 빈 상태 컴포넌트 ✅

- [x] `components/shared/EmptyState.tsx` 생성
- [x] 트렌드 없음 상태
- [x] 크리에이터 없음 상태
- [x] 콘텐츠 없음 상태
- [x] CTA 버튼 포함

**예상 시간**: 2시간
**완료 조건**: 빈 상태 표시 확인

---

### Epic 8.4: 애니메이션 & 인터랙션

**담당**: Developer | **우선순위**: P2

#### Task 8.4.1: Framer Motion 적용 ✅

- [x] 페이지 전환 애니메이션 (인프라 준비)
- [x] 카드 호버 효과
- [x] 모달 열림/닫힘 애니메이션 (인프라 준비)
- [x] 리스트 아이템 Stagger 효과 (인프라 준비)

**예상 시간**: 3시간
**완료 조건**: 애니메이션 작동 확인

---

#### Task 8.4.2: 인터랙티브 요소 개선 ✅

- [x] 버튼 호버 효과
- [x] 폼 필드 포커스 효과
- [x] 툴팁 추가 (인프라 준비)
- [x] Toast 알림 (성공/에러)

**예상 시간**: 2시간
**완료 조건**: 인터랙션 확인

---

## Phase 9: 최적화 & 성능

**기간**: 4일 | **목표**: 성능 최적화 및 보안 강화

### Epic 9.1: 성능 최적화

**담당**: Developer | **우선순위**: P1

#### Task 9.1.1: 이미지 최적화 ⬜

- [ ] Next.js Image 컴포넌트 사용
- [ ] 이미지 lazy loading
- [ ] WebP 포맷 전환
- [ ] 이미지 CDN 설정 (Vercel)

**예상 시간**: 2시간
**완료 조건**: Lighthouse 점수 향상

---

#### Task 9.1.2: 코드 스플리팅 & Lazy Loading ⬜

- [ ] Dynamic import 적용
- [ ] 라우트별 코드 스플리팅
- [ ] 컴포넌트 lazy loading
- [ ] 번들 크기 분석 (`@next/bundle-analyzer`)

**예상 시간**: 3시간
**완료 조건**: 번들 크기 감소 확인

---

#### Task 9.1.3: 데이터베이스 쿼리 최적화 ⬜

- [ ] 인덱스 추가 확인
- [ ] N+1 쿼리 문제 해결
- [ ] 쿼리 결과 캐싱
- [ ] Connection pooling 설정

**예상 시간**: 3시간
**완료 조건**: 쿼리 속도 개선

---

#### Task 9.1.4: LLM 응답 최적화 ⬜

- [ ] 프롬프트 토큰 수 최소화
- [ ] 캐싱 확대 적용
- [ ] GPT-4 Mini 부분 적용
- [ ] 병렬 요청 처리

**예상 시간**: 3시간
**완료 조건**: 응답 시간 단축

---

### Epic 9.2: 보안 강화

**담당**: Developer | **우선순위**: P0

#### Task 9.2.1: Rate Limiting 구현 ⬜

```bash
pnpm add @upstash/ratelimit
```

- [ ] `lib/middleware/rate-limit.ts` 생성
- [ ] API 엔드포인트별 제한 설정
  - 트렌드 분석: 10회/10분
  - 크리에이터 매칭: 10회/10분
  - 콘텐츠 생성: 10회/10분
- [ ] 미들웨어 적용
- [ ] 429 에러 응답 처리

**예상 시간**: 2시간
**완료 조건**: Rate limiting 작동 확인

---

#### Task 9.2.2: 입력 검증 & Sanitization ⬜

- [ ] 모든 API 입력 Zod 검증
- [ ] XSS 방어 (DOMPurify)
- [ ] SQL Injection 방어 (Parameterized queries)
- [ ] CSRF 토큰 (Next.js 기본 제공)

**예상 시간**: 2시간
**완료 조건**: 보안 테스트 통과

---

#### Task 9.2.3: 환경 변수 보안 ⬜

- [ ] 시크릿 변수 서버 사이드만 사용
- [ ] API 키 노출 방지
- [ ] .env 파일 .gitignore 확인
- [ ] Vercel 환경 변수 설정

**예상 시간**: 1시간
**완료 조건**: 시크릿 안전 확인

---

### Epic 9.3: 모니터링 & 로깅

**담당**: Developer | **우선순위**: P1

#### Task 9.3.1: Sentry 에러 추적 설정 ⬜

```bash
pnpm add @sentry/nextjs
```

- [ ] Sentry 프로젝트 생성
- [ ] `sentry.client.config.ts` 설정
- [ ] `sentry.server.config.ts` 설정
- [ ] Source maps 업로드
- [ ] 에러 테스트

**예상 시간**: 2시간
**완료 조건**: Sentry 에러 수집 확인

---

#### Task 9.3.2: Vercel Analytics 설정 ⬜

- [ ] Vercel Analytics 활성화
- [ ] Web Vitals 추적
- [ ] 사용자 행동 이벤트 추가
- [ ] 성능 메트릭 모니터링

**예상 시간**: 1시간
**완료 조건**: Analytics 작동 확인

---

#### Task 9.3.3: 커스텀 로깅 시스템 ⬜

- [ ] `lib/logger.ts` 생성
- [ ] API 요청 로깅
- [ ] LLM 호출 로깅
- [ ] 에러 로깅
- [ ] 로그 레벨 설정 (dev/prod)

**예상 시간**: 2시간
**완료 조건**: 로그 출력 확인

---

## Phase 10: 배포 & 문서화

**기간**: 5일 | **목표**: 프로덕션 배포 및 포트폴리오 준비

### Epic 10.1: 배포 준비

**담당**: Developer | **우선순위**: P0

#### Task 10.1.1: Vercel 프로젝트 설정 ⬜

- [ ] Vercel 계정 생성
- [ ] GitHub 연동
- [ ] 프로젝트 임포트
- [ ] 환경 변수 설정
- [ ] 빌드 설정 확인

**예상 시간**: 1시간
**완료 조건**: Vercel 프로젝트 생성 완료

---

#### Task 10.1.2: 프로덕션 빌드 테스트 ⬜

- [ ] `pnpm build` 실행
- [ ] 빌드 에러 수정
- [ ] `pnpm start`로 프로덕션 모드 테스트
- [ ] 환경 변수 확인
- [ ] 최종 테스트

**예상 시간**: 2시간
**완료 조건**: 빌드 성공

---

#### Task 10.1.3: 도메인 설정 (옵션) ⬜

- [ ] 도메인 구매
- [ ] Vercel 도메인 연결
- [ ] DNS 설정
- [ ] HTTPS 설정 확인

**예상 시간**: 1시간
**완료 조건**: 커스텀 도메인 접속 가능

---

### Epic 10.2: CI/CD 파이프라인

**담당**: Developer | **우선순위**: P1

#### Task 10.2.1: GitHub Actions 워크플로우 설정 ⬜

- [ ] `.github/workflows/deploy.yml` 생성
- [ ] Lint & Type check 단계
- [ ] Build 단계
- [ ] 자동 배포 설정 (Vercel)
- [ ] PR 미리보기 배포

**예상 시간**: 2시간
**완료 조건**: CI/CD 작동 확인

---

#### Task 10.2.2: 테스트 자동화 (옵션) ⬜

- [ ] Vitest 설정
- [ ] 단위 테스트 작성
- [ ] GitHub Actions에 테스트 단계 추가
- [ ] 테스트 커버리지 리포트

**예상 시간**: 4시간
**완료 조건**: 테스트 자동 실행

---

### Epic 10.3: 문서화

**담당**: Developer | **우선순위**: P0

#### Task 10.3.1: README.md 작성 ⬜

- [ ] 프로젝트 소개
- [ ] 주요 기능
- [ ] 기술 스택
- [ ] 설치 방법
- [ ] 사용 방법
- [ ] 환경 변수 설정 가이드
- [ ] 스크린샷/GIF 추가
- [ ] 라이센스

**예상 시간**: 3시간
**완료 조건**: README 완성

---

#### Task 10.3.2: API 문서 작성 ⬜

- [ ] `docs/API.md` 생성
- [ ] 모든 엔드포인트 문서화
  - 요청 형식
  - 응답 형식
  - 에러 코드
  - 예시
- [ ] Postman Collection 생성 (옵션)

**예상 시간**: 4시간
**완료 조건**: API 문서 완성

---

#### Task 10.3.3: 아키텍처 문서 작성 ⬜

- [ ] `docs/Architecture.md` 생성
- [ ] 시스템 아키텍처 다이어그램
- [ ] 데이터 플로우 다이어그램
- [ ] 컴포넌트 구조
- [ ] AI Agent 워크플로우 설명

**예상 시간**: 3시간
**완료 조건**: 아키텍처 문서 완성

---

#### Task 10.3.4: 프롬프트 엔지니어링 문서 ⬜

- [ ] `docs/PromptEngineering.md` 생성
- [ ] 각 Agent의 프롬프트 전략 설명
- [ ] Few-shot 예시 설명
- [ ] 프롬프트 최적화 과정
- [ ] 성능 개선 사례

**예상 시간**: 3시간
**완료 조건**: 프롬프트 문서 완성

---

### Epic 10.4: 포트폴리오 준비

**담당**: Developer | **우선순위**: P0

#### Task 10.4.1: 데모 데이터 준비 ⬜

- [ ] 샘플 트렌드 데이터 생성
- [ ] 샘플 크리에이터 데이터 생성
- [ ] 샘플 콘텐츠 아이디어 생성
- [ ] 시드 스크립트 작성 (`scripts/seed-db.ts`)
- [ ] DB 시딩 실행

**예상 시간**: 3시간
**완료 조건**: 데모 데이터 준비 완료

---

#### Task 10.4.2: 스크린샷 & 데모 영상 제작 ⬜

- [ ] 주요 화면 스크린샷 촬영
  - 대시보드
  - 트렌드 분석
  - 크리에이터 매칭
  - 콘텐츠 생성
- [ ] 사용 흐름 GIF 제작
- [ ] 데모 영상 녹화 (2-3분)
- [ ] YouTube 업로드 (옵션)

**예상 시간**: 4시간
**완료 조건**: 미디어 자료 준비 완료

---

#### Task 10.4.3: 포트폴리오 문서 작성 ⬜

- [ ] `docs/Portfolio.md` 생성
- [ ] 프로젝트 배경 & 동기
- [ ] 문제 정의
- [ ] 솔루션 설명
- [ ] 기술적 도전 과제
- [ ] 성과 & 결과
- [ ] 배운 점
- [ ] 개선 계획

**예상 시간**: 4시간
**완료 조건**: 포트폴리오 문서 완성

---

#### Task 10.4.4: popow.ai 제출 준비 ⬜

- [ ] popow.ai Agent 구현 (별도)
- [ ] Agent 설명 작성
- [ ] 사용 가이드 작성
- [ ] 데모 시나리오 준비
- [ ] 제출

**예상 시간**: 6시간
**완료 조건**: popow.ai 제출 완료

---

### Epic 10.5: 최종 점검

**담당**: Developer | **우선순위**: P0

#### Task 10.5.1: 전체 기능 테스트 ⬜

- [ ] 사용자 인증 플로우 테스트
- [ ] 트렌드 분석 E2E 테스트
- [ ] 크리에이터 매칭 E2E 테스트
- [ ] 콘텐츠 생성 E2E 테스트
- [ ] 리포트 생성 E2E 테스트
- [ ] 모바일/태블릿 테스트
- [ ] 브라우저 호환성 테스트

**예상 시간**: 4시간
**완료 조건**: 모든 기능 정상 작동

---

#### Task 10.5.2: 성능 최종 점검 ⬜

- [ ] Lighthouse 성능 점수 확인 (>90)
- [ ] Core Web Vitals 확인
- [ ] 페이지 로딩 속도 확인 (<3초)
- [ ] API 응답 시간 확인 (<2초)
- [ ] LLM 응답 시간 확인 (<20초)

**예상 시간**: 2시간
**완료 조건**: 성능 기준 충족

---

#### Task 10.5.3: 보안 최종 점검 ⬜

- [ ] 환경 변수 노출 확인
- [ ] API 엔드포인트 인증 확인
- [ ] Rate limiting 작동 확인
- [ ] XSS/CSRF 방어 확인
- [ ] HTTPS 강제 확인

**예상 시간**: 2시간
**완료 조건**: 보안 이슈 없음

---

#### Task 10.5.4: 비용 모니터링 설정 ⬜

- [ ] OpenAI API 사용량 대시보드 확인
- [ ] Supabase 사용량 확인
- [ ] Vercel 사용량 확인
- [ ] 월별 비용 추정
- [ ] 알림 설정 (예산 초과 시)

**예상 시간**: 1시간
**완료 조건**: 비용 추적 시스템 작동

---

#### Task 10.5.5: 프로젝트 마무리 ⬜

- [ ] 코드 정리 (주석, unused imports)
- [ ] 최종 커밋 & 푸시
- [ ] GitHub 릴리즈 태그 생성 (v1.0.0)
- [ ] 프로덕션 배포 확인
- [ ] 팀원/멘토 피드백 수집 (옵션)

**예상 시간**: 2시간
**완료 조건**: 프로젝트 완성 ✅

---

## 부록: 참고 자료

### 학습 자료

- [Next.js 공식 문서](https://nextjs.org/docs)
- [Vercel AI SDK 문서](https://sdk.vercel.ai/docs)
- [Supabase 문서](https://supabase.com/docs)
- [shadcn/ui 문서](https://ui.shadcn.com/)
- [OpenAI API 문서](https://platform.openai.com/docs)
- [Anthropic Claude 문서](https://docs.anthropic.com/)

### 유용한 도구

- [Excalidraw](https://excalidraw.com/) - 다이어그램 그리기
- [Figma](https://www.figma.com/) - UI 디자인
- [Postman](https://www.postman.com/) - API 테스트
- [TablePlus](https://tableplus.com/) - DB 클라이언트

---

## 진행 상황 트래킹

### 완료율

- Phase 1: ⬜ 0%
- Phase 2: ⬜ 0%
- Phase 3: ⬜ 0%
- Phase 4: ⬜ 0%
- Phase 5: ⬜ 0%
- Phase 6: ⬜ 0%
- Phase 7: ✅ 100%
- Phase 8: ✅ 100%
- Phase 9: ⬜ 0%
- Phase 10: ⬜ 0%

**전체 진행률**: 2/10 (20%)

---

## 다음 액션

1. ✅ Phase 1, Epic 1.1, Task 1.1.1 시작: Node.js 프로젝트 초기화
2. 체크리스트 하나씩 완료하며 진행
3. 각 Epic 완료 시 데모 가능 상태 확인
4. 막히는 부분 문서화 및 해결

**행운을 빕니다! 🚀**

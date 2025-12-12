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

#### Task 1.1.1: Node.js 프로젝트 초기화 ⬜
- [ ] Node.js v20.x 설치 확인
- [ ] pnpm 설치 (`npm install -g pnpm`)
- [ ] Git 저장소 초기화
- [ ] `.gitignore` 설정
- [ ] README.md 기본 구조 작성

**예상 시간**: 30분
**완료 조건**: `git init` 완료 및 기본 파일 커밋

---

#### Task 1.1.2: Next.js 프로젝트 생성 ⬜
```bash
pnpm create next-app@latest . --typescript --tailwind --app --import-alias "@/*"
```

- [ ] Next.js 15.x 설치
- [ ] TypeScript 설정
- [ ] Tailwind CSS 설정
- [ ] App Router 확인
- [ ] 기본 실행 테스트 (`pnpm dev`)

**예상 시간**: 1시간
**완료 조건**: `localhost:3000` 접속 성공

---

#### Task 1.1.3: ESLint & Prettier 설정 ⬜
- [ ] ESLint 설정 파일 생성 (`.eslintrc.json`)
- [ ] Prettier 설치 및 설정 (`.prettierrc`)
- [ ] `prettier-plugin-tailwindcss` 설치
- [ ] VSCode 설정 (`.vscode/settings.json`)
- [ ] Husky 설치 및 pre-commit hook 설정
- [ ] lint-staged 설정

**예상 시간**: 1시간
**완료 조건**: `pnpm lint` 실행 성공

---

#### Task 1.1.4: 프로젝트 디렉토리 구조 생성 ⬜
```bash
mkdir -p src/{app,components,lib,types,hooks}
mkdir -p src/lib/{ai,db,api,auth,cache,utils}
mkdir -p src/components/{ui,trends,creators,content,shared}
mkdir -p prompts/{system,examples}
mkdir -p scripts tests/{unit,integration,e2e}
```

- [ ] 디렉토리 구조 생성
- [ ] 각 디렉토리에 README.md 추가
- [ ] TypeScript path alias 설정 (`tsconfig.json`)

**예상 시간**: 30분
**완료 조건**: 모든 디렉토리 생성 완료

---

### Epic 1.2: 의존성 패키지 설치
**담당**: Developer | **우선순위**: P0

#### Task 1.2.1: UI 라이브러리 설치 ⬜
```bash
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-tabs
pnpm add clsx tailwind-merge
pnpm add lucide-react
```

- [ ] Radix UI 컴포넌트 설치
- [ ] shadcn/ui CLI 설치 (`pnpm dlx shadcn-ui@latest init`)
- [ ] 기본 UI 컴포넌트 추가 (Button, Card, Input, Dialog)
- [ ] `lib/utils.ts`에 `cn()` 함수 추가

**예상 시간**: 1시간
**완료 조건**: shadcn/ui 컴포넌트 사용 가능

---

#### Task 1.2.2: 상태 관리 & 데이터 Fetching 설치 ⬜
```bash
pnpm add zustand
pnpm add @tanstack/react-query
pnpm add axios
```

- [ ] Zustand 설치 및 기본 store 생성
- [ ] React Query 설정
- [ ] QueryClientProvider 설정 (`app/providers.tsx`)
- [ ] Axios 인스턴스 생성 (`lib/api/client.ts`)

**예상 시간**: 1.5시간
**완료 조건**: React Query DevTools 작동 확인

---

#### Task 1.2.3: 폼 & 검증 라이브러리 설치 ⬜
```bash
pnpm add react-hook-form zod @hookform/resolvers
pnpm add date-fns
```

- [ ] React Hook Form 설치
- [ ] Zod 스키마 예시 작성 (`types/schemas.ts`)
- [ ] 테스트 폼 컴포넌트 작성

**예상 시간**: 1시간
**완료 조건**: 폼 검증 테스트 성공

---

### Epic 1.3: 환경 변수 & 설정
**담당**: Developer | **우선순위**: P0

#### Task 1.3.1: 환경 변수 파일 생성 ⬜
- [ ] `.env.local` 파일 생성
- [ ] `.env.example` 파일 생성
- [ ] 필요한 환경 변수 정의:
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

**예상 시간**: 30분
**완료 조건**: `.env.example` 커밋 완료

---

#### Task 1.3.2: Next.js 설정 파일 구성 ⬜
- [ ] `next.config.js` 설정
  - 이미지 도메인 허용
  - 환경 변수 검증
  - Webpack 설정 (필요 시)
- [ ] `middleware.ts` 기본 구조 작성
  - CORS 설정
  - Rate limiting 준비

**예상 시간**: 1시간
**완료 조건**: 설정 파일 작동 확인

---

## Phase 2: 데이터베이스 & 인증
**기간**: 4일 | **목표**: Supabase 연동 및 사용자 인증 구현

### Epic 2.1: Supabase 프로젝트 설정
**담당**: Developer | **우선순위**: P0

#### Task 2.1.1: Supabase 프로젝트 생성 ⬜
- [ ] Supabase 계정 생성 (https://supabase.com)
- [ ] 새 프로젝트 생성
- [ ] 리전 선택 (Northeast Asia - Seoul)
- [ ] 데이터베이스 비밀번호 설정
- [ ] API 키 복사 (`.env.local`에 추가)

**예상 시간**: 30분
**완료 조건**: Supabase Dashboard 접속 가능

---

#### Task 2.1.2: Supabase 클라이언트 설정 ⬜
```bash
pnpm add @supabase/supabase-js @supabase/auth-helpers-nextjs
```

- [ ] Supabase 클라이언트 생성 (`lib/db/client.ts`)
- [ ] Server Component용 클라이언트
- [ ] Client Component용 클라이언트
- [ ] 연결 테스트

**예상 시간**: 1시간
**완료 조건**: DB 연결 성공

---

#### Task 2.1.3: 데이터베이스 스키마 생성 ⬜
- [ ] SQL 마이그레이션 파일 작성 (`scripts/migrations/001_initial_schema.sql`)
- [ ] `users` 테이블 생성
- [ ] `trends` 테이블 생성
- [ ] `creators` 테이블 생성
- [ ] `content_ideas` 테이블 생성
- [ ] `reports` 테이블 생성
- [ ] `api_usage` 테이블 생성
- [ ] 인덱스 생성
- [ ] Supabase SQL Editor에서 실행

**예상 시간**: 2시간
**완료 조건**: 모든 테이블 생성 완료

---

#### Task 2.1.4: Row Level Security (RLS) 설정 ⬜
- [ ] `users` 테이블 RLS 정책
  ```sql
  -- 사용자는 자신의 데이터만 조회
  CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);
  ```
- [ ] `trends` 테이블 RLS 정책
- [ ] `creators` 테이블 RLS 정책
- [ ] `content_ideas` 테이블 RLS 정책
- [ ] `reports` 테이블 RLS 정책
- [ ] RLS 활성화
- [ ] 정책 테스트

**예상 시간**: 2시간
**완료 조건**: RLS 정책 작동 확인

---

### Epic 2.2: 사용자 인증 구현
**담당**: Developer | **우선순위**: P0

#### Task 2.2.1: Auth 헬퍼 함수 작성 ⬜
- [ ] `lib/auth/supabase.ts` 생성
- [ ] 회원가입 함수
- [ ] 로그인 함수
- [ ] 로그아웃 함수
- [ ] 세션 확인 함수
- [ ] 사용자 정보 조회 함수

**예상 시간**: 2시간
**완료 조건**: Auth 함수 작동 확인

---

#### Task 2.2.2: 로그인/회원가입 UI 구현 ⬜
- [ ] `app/(auth)/login/page.tsx` 생성
- [ ] `app/(auth)/signup/page.tsx` 생성
- [ ] 로그인 폼 컴포넌트 (`components/auth/LoginForm.tsx`)
- [ ] 회원가입 폼 컴포넌트 (`components/auth/SignupForm.tsx`)
- [ ] Zod 스키마 검증
- [ ] 에러 핸들링
- [ ] 로딩 상태 표시

**예상 시간**: 3시간
**완료 조건**: 로그인/회원가입 성공

---

#### Task 2.2.3: 인증 미들웨어 구현 ⬜
- [ ] `middleware.ts` 업데이트
- [ ] 보호된 라우트 설정
- [ ] 비인증 사용자 리다이렉트
- [ ] 세션 갱신 로직
- [ ] 권한 확인 (role 기반)

**예상 시간**: 2시간
**완료 조건**: 보호된 페이지 접근 제어 확인

---

#### Task 2.2.4: 사용자 프로필 페이지 ⬜
- [ ] `app/(dashboard)/profile/page.tsx` 생성
- [ ] 프로필 조회
- [ ] 프로필 수정
- [ ] 비밀번호 변경
- [ ] 로그아웃 버튼

**예상 시간**: 2시간
**완료 조건**: 프로필 CRUD 작동

---

### Epic 2.3: 데이터베이스 쿼리 함수
**담당**: Developer | **우선순위**: P1

#### Task 2.3.1: Trends 쿼리 함수 작성 ⬜
- [ ] `lib/db/queries/trends.ts` 생성
- [ ] `getTrends()` - 트렌드 목록 조회
- [ ] `getTrendById()` - 단일 트렌드 조회
- [ ] `createTrend()` - 트렌드 생성
- [ ] `updateTrend()` - 트렌드 수정
- [ ] `deleteTrend()` - 트렌드 삭제
- [ ] TypeScript 타입 정의 (`types/trends.ts`)

**예상 시간**: 2시간
**완료 조건**: 모든 CRUD 함수 작동

---

#### Task 2.3.2: Creators 쿼리 함수 작성 ⬜
- [ ] `lib/db/queries/creators.ts` 생성
- [ ] `getCreators()` - 크리에이터 목록 조회
- [ ] `getCreatorById()` - 단일 크리에이터 조회
- [ ] `createCreator()` - 크리에이터 생성
- [ ] `updateCreator()` - 크리에이터 수정
- [ ] `deleteCreator()` - 크리에이터 삭제
- [ ] TypeScript 타입 정의 (`types/creators.ts`)

**예상 시간**: 2시간
**완료 조건**: 모든 CRUD 함수 작동

---

#### Task 2.3.3: Content Ideas 쿼리 함수 작성 ⬜
- [ ] `lib/db/queries/content-ideas.ts` 생성
- [ ] `getContentIdeas()` - 아이디어 목록 조회
- [ ] `getContentIdeaById()` - 단일 아이디어 조회
- [ ] `createContentIdea()` - 아이디어 생성
- [ ] `updateContentIdea()` - 아이디어 수정
- [ ] `deleteContentIdea()` - 아이디어 삭제
- [ ] TypeScript 타입 정의 (`types/content.ts`)

**예상 시간**: 2시간
**완료 조건**: 모든 CRUD 함수 작동

---

## Phase 3: AI/LLM 통합
**기간**: 5일 | **목표**: OpenAI 및 Claude API 연동

### Epic 3.1: LLM Provider 설정
**담당**: Developer | **우선순위**: P0

#### Task 3.1.1: Vercel AI SDK 설치 및 설정 ⬜
```bash
pnpm add ai @ai-sdk/openai @ai-sdk/anthropic
```

- [ ] AI SDK 설치
- [ ] OpenAI provider 설정 (`lib/ai/providers/openai.ts`)
- [ ] Anthropic provider 설정 (`lib/ai/providers/anthropic.ts`)
- [ ] Provider 선택 로직 (`lib/ai/providers/index.ts`)
- [ ] 기본 테스트 (간단한 채팅)

**예상 시간**: 2시간
**완료 조건**: AI SDK 작동 확인

---

#### Task 3.1.2: 프롬프트 템플릿 시스템 구축 ⬜
- [ ] `prompts/system/trend-analyzer.md` 작성
  - 삼양 브랜드 정보
  - 트렌드 분석 기준
  - 출력 형식 정의
- [ ] `prompts/system/creator-matcher.md` 작성
  - 크리에이터 평가 기준
  - 적합도 점수 산정 방식
- [ ] `prompts/system/content-generator.md` 작성
  - 숏폼 포맷 분류
  - 아이디어 생성 템플릿
- [ ] 프롬프트 로더 함수 (`lib/ai/prompts/loader.ts`)

**예상 시간**: 4시간
**완료 조건**: 모든 프롬프트 템플릿 작성 완료

---

#### Task 3.1.3: Few-shot 예시 데이터 작성 ⬜
- [ ] `prompts/examples/few-shot-examples.json` 생성
- [ ] 트렌드 분석 예시 3개
- [ ] 크리에이터 매칭 예시 3개
- [ ] 콘텐츠 아이디어 예시 3개
- [ ] JSON 스키마 검증

**예상 시간**: 3시간
**완료 조건**: 예시 데이터 JSON 파일 완성

---

### Epic 3.2: AI 유틸리티 함수
**담당**: Developer | **우선순위**: P1

#### Task 3.2.1: LLM 호출 래퍼 함수 작성 ⬜
- [ ] `lib/ai/utils.ts` 생성
- [ ] `generateText()` 래퍼 함수
  - 에러 핸들링
  - 리트라이 로직
  - 토큰 사용량 추적
- [ ] `streamText()` 래퍼 함수
  - 스트리밍 응답 처리
- [ ] `generateObject()` 래퍼 함수
  - JSON 출력 보장
  - Zod 스키마 검증

**예상 시간**: 3시간
**완료 조건**: 래퍼 함수 테스트 성공

---

#### Task 3.2.2: 토큰 카운팅 & 비용 추적 ⬜
- [ ] 토큰 카운터 함수 (`lib/ai/token-counter.ts`)
- [ ] 비용 계산 함수
  - GPT-4 Turbo 가격
  - GPT-4 Mini 가격
  - Claude 가격
- [ ] API 사용량 로깅 (`lib/db/queries/api-usage.ts`)
- [ ] 사용량 조회 API (`/api/usage`)

**예상 시간**: 2시간
**완료 조건**: 토큰 사용량 DB 저장 확인

---

#### Task 3.2.3: LLM 응답 캐싱 구현 ⬜
```bash
pnpm add @upstash/redis
```

- [ ] Upstash Redis 프로젝트 생성
- [ ] Redis 클라이언트 설정 (`lib/cache/redis.ts`)
- [ ] 캐시 키 생성 함수
- [ ] 캐시 조회 함수
- [ ] 캐시 저장 함수
- [ ] TTL 설정 (24시간)
- [ ] 캐시 무효화 함수

**예상 시간**: 3시간
**완료 조건**: Redis 캐싱 작동 확인

---

### Epic 3.3: AI Agent 코어 로직
**담당**: Developer | **우선순위**: P0

#### Task 3.3.1: 트렌드 분석 AI 함수 ⬜
- [ ] `lib/ai/agents/trend-analyzer.ts` 생성
- [ ] `analyzeTrend()` 함수
  - 입력: 키워드, 플랫폼, 국가
  - 프롬프트 구성
  - LLM 호출
  - 응답 파싱
  - 출력: 트렌드 분석 결과
- [ ] 응답 스키마 정의 (Zod)
- [ ] 에러 핸들링
- [ ] 단위 테스트

**예상 시간**: 4시간
**완료 조건**: 트렌드 분석 함수 작동

---

#### Task 3.3.2: 크리에이터 매칭 AI 함수 ⬜
- [ ] `lib/ai/agents/creator-matcher.ts` 생성
- [ ] `matchCreator()` 함수
  - 입력: 크리에이터 프로필, 캠페인 목적
  - 프롬프트 구성
  - LLM 호출
  - 적합도 점수 산정
  - 출력: 매칭 결과
- [ ] 응답 스키마 정의 (Zod)
- [ ] 에러 핸들링
- [ ] 단위 테스트

**예상 시간**: 4시간
**완료 조건**: 크리에이터 매칭 함수 작동

---

#### Task 3.3.3: 콘텐츠 아이디어 생성 AI 함수 ⬜
- [ ] `lib/ai/agents/content-generator.ts` 생성
- [ ] `generateContentIdea()` 함수
  - 입력: 트렌드 데이터, 브랜드 카테고리, 톤앤매너
  - 프롬프트 구성
  - LLM 호출
  - 응답 파싱
  - 출력: 콘텐츠 아이디어 (훅, 장면 구성, 음악 등)
- [ ] 응답 스키마 정의 (Zod)
- [ ] 에러 핸들링
- [ ] 단위 테스트

**예상 시간**: 4시간
**완료 조건**: 콘텐츠 생성 함수 작동

---

## Phase 4: 트렌드 분석 기능
**기간**: 5일 | **목표**: 트렌드 수집 및 분석 전체 플로우 구현

### Epic 4.1: 외부 API 통합
**담당**: Developer | **우선순위**: P1

#### Task 4.1.1: YouTube Data API 클라이언트 ⬜
- [ ] YouTube API 키 발급
- [ ] `lib/api/youtube.ts` 생성
- [ ] `searchVideos()` 함수
  - 키워드로 숏폼 검색
  - 필터링 (duration, date)
- [ ] `getVideoDetails()` 함수
  - 조회수, 좋아요, 댓글 수
- [ ] API 응답 타입 정의
- [ ] 에러 핸들링 (Quota 초과 등)

**예상 시간**: 3시간
**완료 조건**: YouTube 검색 성공

---

#### Task 4.1.2: SerpAPI 클라이언트 (TikTok/Instagram 대체) ⬜
- [ ] SerpAPI 키 발급
- [ ] `lib/api/serpapi.ts` 생성
- [ ] TikTok 검색 함수
- [ ] Instagram Reels 검색 함수
- [ ] 검색 결과 파싱
- [ ] API 응답 타입 정의

**예상 시간**: 3시간
**완료 조건**: SerpAPI 검색 성공

---

#### Task 4.1.3: 트렌드 데이터 수집 스크립트 ⬜
- [ ] `lib/api/trend-collector.ts` 생성
- [ ] `collectTrends()` 함수
  - 여러 플랫폼에서 데이터 수집
  - 중복 제거
  - 데이터 정규화
- [ ] 수집 스케줄링 로직 (선택 사항)
- [ ] 에러 핸들링

**예상 시간**: 4시간
**완료 조건**: 트렌드 데이터 수집 성공

---

### Epic 4.2: 트렌드 분석 API
**담당**: Developer | **우선순위**: P0

#### Task 4.2.1: 트렌드 분석 API 엔드포인트 ⬜
- [ ] `app/api/trends/analyze/route.ts` 생성
- [ ] POST 요청 핸들러
  - 요청 바디 검증 (Zod)
  - 트렌드 데이터 수집
  - AI 분석 호출
  - 결과 DB 저장
  - 응답 반환
- [ ] Rate limiting 적용
- [ ] 에러 핸들링
- [ ] API 테스트

**예상 시간**: 4시간
**완료 조건**: API 호출 성공

---

#### Task 4.2.2: 트렌드 목록 조회 API ⬜
- [ ] `app/api/trends/route.ts` 생성
- [ ] GET 요청 핸들러
  - 쿼리 파라미터 파싱 (페이지네이션, 필터링)
  - DB 조회
  - 응답 반환
- [ ] 정렬 옵션 (최신순, 점수순)
- [ ] 필터링 (플랫폼, 국가, 키워드)

**예상 시간**: 2시간
**완료 조건**: API 호출 성공

---

#### Task 4.2.3: 일일 트렌드 리포트 API ⬜
- [ ] `app/api/trends/daily/route.ts` 생성
- [ ] GET 요청 핸들러
  - 오늘 수집된 트렌드 조회
  - Top 5 트렌드 선정
  - 요약 정보 생성
- [ ] 캐싱 적용 (1시간)

**예상 시간**: 2시간
**완료 조건**: API 호출 성공

---

### Epic 4.3: 트렌드 분석 UI
**담당**: Developer | **우선순위**: P0

#### Task 4.3.1: 트렌드 분석 페이지 레이아웃 ⬜
- [ ] `app/(dashboard)/trends/page.tsx` 생성
- [ ] 헤더 섹션
  - 페이지 제목
  - 분석 버튼
- [ ] 필터링 섹션
  - 키워드 입력
  - 플랫폼 선택
  - 국가 선택
- [ ] 결과 섹션 (그리드/리스트)

**예상 시간**: 3시간
**완료 조건**: 레이아웃 완성

---

#### Task 4.3.2: 트렌드 분석 폼 컴포넌트 ⬜
- [ ] `components/trends/TrendAnalysisForm.tsx` 생성
- [ ] React Hook Form 연동
- [ ] Zod 스키마 검증
- [ ] 키워드 입력 필드
- [ ] 플랫폼 선택 (Select)
- [ ] 국가 선택 (Select)
- [ ] 제출 버튼
- [ ] 로딩 상태 표시
- [ ] 에러 메시지 표시

**예상 시간**: 3시간
**완료 조건**: 폼 제출 성공

---

#### Task 4.3.3: 트렌드 카드 컴포넌트 ⬜
- [ ] `components/trends/TrendCard.tsx` 생성
- [ ] 트렌드 정보 표시
  - 키워드
  - 플랫폼 아이콘
  - 포맷 유형
  - 바이럴 점수
  - 삼양 연관성 점수
- [ ] 상세보기 버튼
- [ ] 아이디어 생성 버튼

**예상 시간**: 2시간
**완료 조건**: 카드 렌더링 성공

---

#### Task 4.3.4: 트렌드 상세 모달 ⬜
- [ ] `components/trends/TrendDetailModal.tsx` 생성
- [ ] Dialog 컴포넌트 사용
- [ ] 트렌드 전체 정보 표시
  - 훅 패턴
  - 시각적 패턴
  - 음악 패턴
  - 댓글 분석
  - 삼양 적용 사례
- [ ] 닫기 버튼

**예상 시간**: 3시간
**완료 조건**: 모달 작동 확인

---

#### Task 4.3.5: 트렌드 목록 & 페이지네이션 ⬜
- [ ] `components/trends/TrendList.tsx` 생성
- [ ] React Query로 데이터 Fetching
- [ ] 무한 스크롤 또는 페이지네이션
- [ ] 로딩 스켈레톤
- [ ] 빈 상태 처리

**예상 시간**: 3시간
**완료 조건**: 목록 표시 성공

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

#### Task 5.1.2: 크리에이터 수동 등록 기능 ⬜
- [ ] `components/creators/CreatorForm.tsx` 생성
- [ ] 폼 필드
  - 사용자명
  - 플랫폼
  - 프로필 URL
  - 팔로워 수
  - 콘텐츠 카테고리
- [ ] 검증 로직
- [ ] 제출 핸들러

**예상 시간**: 3시간
**완료 조건**: 크리에이터 등록 성공

---

### Epic 5.2: 크리에이터 매칭 API
**담당**: Developer | **우선순위**: P0

#### Task 5.2.1: 크리에이터 매칭 API 엔드포인트 ⬜
- [ ] `app/api/creators/match/route.ts` 생성
- [ ] POST 요청 핸들러
  - 요청 바디 검증
  - 크리에이터 프로필 조회
  - AI 매칭 분석 호출
  - 적합도 점수 산정
  - 결과 DB 저장
  - 응답 반환
- [ ] 에러 핸들링

**예상 시간**: 3시간
**완료 조건**: API 호출 성공

---

#### Task 5.2.2: 크리에이터 목록 조회 API ⬜
- [ ] `app/api/creators/route.ts` 생성
- [ ] GET 요청 핸들러
  - 페이지네이션
  - 필터링 (플랫폼, 적합도 점수)
  - 정렬 (점수순, 최신순)
- [ ] 응답 반환

**예상 시간**: 2시간
**완료 조건**: API 호출 성공

---

#### Task 5.2.3: 크리에이터 프로필 분석 API ⬜
- [ ] `app/api/creators/profile/route.ts` 생성
- [ ] GET 요청 핸들러
  - 크리에이터 ID로 조회
  - 상세 정보 반환
  - 협업 이력 포함

**예상 시간**: 1시간
**완료 조건**: API 호출 성공

---

### Epic 5.3: 크리에이터 매칭 UI
**담당**: Developer | **우선순위**: P0

#### Task 5.3.1: 크리에이터 페이지 레이아웃 ⬜
- [ ] `app/(dashboard)/creators/page.tsx` 생성
- [ ] 헤더 섹션
- [ ] 필터링 섹션
  - 플랫폼 선택
  - 적합도 점수 범위
- [ ] 크리에이터 그리드

**예상 시간**: 2시간
**완료 조건**: 레이아웃 완성

---

#### Task 5.3.2: 크리에이터 카드 컴포넌트 ⬜
- [ ] `components/creators/CreatorCard.tsx` 생성
- [ ] 크리에이터 정보 표시
  - 프로필 이미지 (옵션)
  - 사용자명
  - 플랫폼 아이콘
  - 팔로워 수
  - 평균 조회수
  - 적합도 점수 (Progress bar)
- [ ] 상세보기 버튼

**예상 시간**: 3시간
**완료 조건**: 카드 렌더링 성공

---

#### Task 5.3.3: 크리에이터 상세 모달 ⬜
- [ ] `components/creators/CreatorDetailModal.tsx` 생성
- [ ] 전체 프로필 정보
- [ ] 적합도 분석 결과
  - 톤앤매너 평가
  - 콘텐츠 카테고리 적합성
  - 협업 이력
  - 리스크 요인
- [ ] 협업 아이디어 섹션
- [ ] 닫기 버튼

**예상 시간**: 3시간
**완료 조건**: 모달 작동 확인

---

#### Task 5.3.4: 크리에이터 목록 & 필터링 ⬜
- [ ] `components/creators/CreatorList.tsx` 생성
- [ ] React Query로 데이터 Fetching
- [ ] 필터링 로직
- [ ] 정렬 로직
- [ ] 페이지네이션

**예상 시간**: 3시간
**완료 조건**: 목록 표시 및 필터링 성공

---

## Phase 6: 콘텐츠 아이디어 생성
**기간**: 4일 | **목표**: AI 기반 숏폼 콘텐츠 아이디어 자동 생성

### Epic 6.1: 콘텐츠 생성 API
**담당**: Developer | **우선순위**: P0

#### Task 6.1.1: 콘텐츠 아이디어 생성 API ⬜
- [ ] `app/api/content/generate/route.ts` 생성
- [ ] POST 요청 핸들러
  - 요청 바디 검증
    - 트렌드 ID (옵션)
    - 브랜드 카테고리
    - 톤앤매너
    - 타깃 국가
  - AI 콘텐츠 생성 호출
  - 결과 DB 저장
  - 응답 반환 (3개 아이디어)
- [ ] 에러 핸들링

**예상 시간**: 4시간
**완료 조건**: API 호출 성공

---

#### Task 6.1.2: 콘텐츠 아이디어 목록 API ⬜
- [ ] `app/api/content/route.ts` 생성
- [ ] GET 요청 핸들러
  - 페이지네이션
  - 필터링 (브랜드, 톤, 국가)
  - 정렬 (최신순, 인기순)

**예상 시간**: 2시간
**완료 조건**: API 호출 성공

---

### Epic 6.2: 콘텐츠 아이디어 UI
**담당**: Developer | **우선순위**: P0

#### Task 6.2.1: 콘텐츠 생성 페이지 레이아웃 ⬜
- [ ] `app/(dashboard)/content/page.tsx` 생성
- [ ] 헤더 섹션
- [ ] 생성 폼 섹션
- [ ] 결과 표시 섹션

**예상 시간**: 2시간
**완료 조건**: 레이아웃 완성

---

#### Task 6.2.2: 콘텐츠 생성 폼 컴포넌트 ⬜
- [ ] `components/content/ContentGenerationForm.tsx` 생성
- [ ] 폼 필드
  - 브랜드 카테고리 선택 (불닭/삼양라면/젤리)
  - 톤앤매너 선택 (재미/카와이/도발적/쿨톤)
  - 타깃 국가 선택
  - 트렌드 선택 (옵션)
- [ ] 검증 로직
- [ ] 제출 핸들러
- [ ] 로딩 상태

**예상 시간**: 3시간
**완료 조건**: 폼 제출 성공

---

#### Task 6.2.3: 콘텐츠 아이디어 카드 컴포넌트 ⬜
- [ ] `components/content/ContentIdeaCard.tsx` 생성
- [ ] 아이디어 정보 표시
  - 포맷 이름
  - 5초 훅 문장
  - 장면 구성 (3-5컷)
  - 편집 포맷
  - 추천 음악 스타일
  - 필수 소품/배경
- [ ] 상세보기 버튼
- [ ] 저장/공유 버튼 (옵션)

**예상 시간**: 4시간
**완료 조건**: 카드 렌더링 성공

---

#### Task 6.2.4: 콘텐츠 아이디어 상세 모달 ⬜
- [ ] `components/content/ContentIdeaDetailModal.tsx` 생성
- [ ] 전체 아이디어 정보
- [ ] 촬영 가이드
- [ ] 예상 성과 (정성 분석)
- [ ] 편집 버튼 (옵션)
- [ ] 다운로드 버튼 (PDF/JSON)

**예상 시간**: 3시간
**완료 조건**: 모달 작동 확인

---

#### Task 6.2.5: 콘텐츠 아이디어 목록 ⬜
- [ ] `components/content/ContentIdeaList.tsx` 생성
- [ ] React Query로 데이터 Fetching
- [ ] 필터링 UI
- [ ] 정렬 UI
- [ ] 페이지네이션

**예상 시간**: 3시간
**완료 조건**: 목록 표시 성공

---

## Phase 7: 리포트 생성
**기간**: 3일 | **목표**: 데일리 리포트 및 리포트 내보내기

### Epic 7.1: 리포트 생성 로직
**담당**: Developer | **우선순위**: P1

#### Task 7.1.1: 데일리 트렌드 리포트 생성 ⬜
- [ ] `lib/reports/daily-trend-report.ts` 생성
- [ ] `generateDailyTrendReport()` 함수
  - 오늘 수집된 트렌드 조회
  - Top 5 선정
  - 요약 생성 (LLM 활용)
  - 리포트 객체 생성
- [ ] 리포트 템플릿 (Markdown/HTML)

**예상 시간**: 3시간
**완료 조건**: 리포트 생성 성공

---

#### Task 7.1.2: 크리에이터 매칭 리포트 생성 ⬜
- [ ] `lib/reports/creator-match-report.ts` 생성
- [ ] `generateCreatorMatchReport()` 함수
  - 매칭된 크리에이터 조회
  - 적합도 점수별 정렬
  - 요약 생성
  - 리포트 객체 생성

**예상 시간**: 2시간
**완료 조건**: 리포트 생성 성공

---

#### Task 7.1.3: 콘텐츠 아이디어 리포트 생성 ⬜
- [ ] `lib/reports/content-idea-report.ts` 생성
- [ ] `generateContentIdeaReport()` 함수
  - 생성된 아이디어 조회
  - 촬영 가능한 아이디어 우선 정렬
  - 리포트 객체 생성

**예상 시간**: 2시간
**완료 조건**: 리포트 생성 성공

---

### Epic 7.2: 리포트 API
**담당**: Developer | **우선순위**: P1

#### Task 7.2.1: 리포트 생성 API ⬜
- [ ] `app/api/reports/route.ts` 생성
- [ ] POST 요청 핸들러
  - 리포트 타입 선택
  - 리포트 생성 함수 호출
  - DB 저장
  - 응답 반환

**예상 시간**: 2시간
**완료 조건**: API 호출 성공

---

#### Task 7.2.2: 리포트 조회 API ⬜
- [ ] GET 요청 핸들러
  - 리포트 목록 조회
  - 필터링 (타입, 날짜)
  - 페이지네이션

**예상 시간**: 1시간
**완료 조건**: API 호출 성공

---

#### Task 7.2.3: 리포트 내보내기 API ⬜
- [ ] `app/api/reports/export/route.ts` 생성
- [ ] POST 요청 핸들러
  - 리포트 ID
  - 내보내기 형식 (JSON/PDF)
  - 파일 생성
  - 응답 반환 (다운로드)

**예상 시간**: 3시간
**완료 조건**: 파일 다운로드 성공

---

### Epic 7.3: 리포트 UI
**담당**: Developer | **우선순위**: P1

#### Task 7.3.1: 리포트 페이지 레이아웃 ⬜
- [ ] `app/(dashboard)/reports/page.tsx` 생성
- [ ] 헤더 섹션
  - 리포트 생성 버튼
- [ ] 리포트 목록 섹션
- [ ] 필터링 섹션

**예상 시간**: 2시간
**완료 조건**: 레이아웃 완성

---

#### Task 7.3.2: 리포트 카드 컴포넌트 ⬜
- [ ] `components/reports/ReportCard.tsx` 생성
- [ ] 리포트 정보 표시
  - 타입
  - 생성 날짜
  - 미리보기
- [ ] 상세보기 버튼
- [ ] 다운로드 버튼

**예상 시간**: 2시간
**완료 조건**: 카드 렌더링 성공

---

#### Task 7.3.3: 리포트 상세 페이지 ⬜
- [ ] `app/(dashboard)/reports/[id]/page.tsx` 생성
- [ ] 리포트 전체 내용 표시
- [ ] 내보내기 버튼
- [ ] 공유 버튼 (옵션)

**예상 시간**: 3시간
**완료 조건**: 상세 페이지 작동

---

## Phase 8: UI/UX 개선
**기간**: 4일 | **목표**: 사용자 경험 향상

### Epic 8.1: 대시보드 구현
**담당**: Developer | **우선순위**: P0

#### Task 8.1.1: 대시보드 레이아웃 ⬜
- [ ] `app/(dashboard)/page.tsx` 개선
- [ ] 네비게이션 바 (Sidebar)
  - 트렌드 링크
  - 크리에이터 링크
  - 콘텐츠 링크
  - 리포트 링크
  - 프로필 링크
- [ ] 헤더 (TopBar)
  - 사용자 정보
  - 로그아웃 버튼
- [ ] 메인 콘텐츠 영역

**예상 시간**: 4시간
**완료 조건**: 대시보드 레이아웃 완성

---

#### Task 8.1.2: 대시보드 위젯 구현 ⬜
- [ ] 오늘의 트렌드 요약 위젯
- [ ] 최근 생성된 아이디어 위젯
- [ ] 추천 크리에이터 위젯
- [ ] API 사용량 위젯 (차트)

**예상 시간**: 4시간
**완료 조건**: 모든 위젯 작동

---

### Epic 8.2: 반응형 디자인
**담당**: Developer | **우선순위**: P1

#### Task 8.2.1: 모바일 레이아웃 최적화 ⬜
- [ ] Tailwind 반응형 클래스 적용
- [ ] 사이드바 → 햄버거 메뉴
- [ ] 그리드 → 단일 컬럼
- [ ] 모바일 테스트

**예상 시간**: 3시간
**완료 조건**: 모바일 화면 정상 표시

---

#### Task 8.2.2: 태블릿 레이아웃 최적화 ⬜
- [ ] 2컬럼 그리드 적용
- [ ] 사이드바 축소/확장
- [ ] 태블릿 테스트

**예상 시간**: 2시간
**완료 조건**: 태블릿 화면 정상 표시

---

### Epic 8.3: 로딩 & 에러 상태
**담당**: Developer | **우선순위**: P0

#### Task 8.3.1: 로딩 스켈레톤 구현 ⬜
- [ ] `components/shared/Skeleton.tsx` 생성
- [ ] 트렌드 카드 스켈레톤
- [ ] 크리에이터 카드 스켈레톤
- [ ] 콘텐츠 카드 스켈레톤
- [ ] 리스트 스켈레톤

**예상 시간**: 2시간
**완료 조건**: 스켈레톤 표시 확인

---

#### Task 8.3.2: 에러 바운더리 구현 ⬜
- [ ] `components/shared/ErrorBoundary.tsx` 생성
- [ ] 전역 에러 바운더리 (`app/error.tsx`)
- [ ] 페이지별 에러 바운더리
- [ ] 에러 메시지 커스터마이징

**예상 시간**: 2시간
**완료 조건**: 에러 핸들링 확인

---

#### Task 8.3.3: 빈 상태 컴포넌트 ⬜
- [ ] `components/shared/EmptyState.tsx` 생성
- [ ] 트렌드 없음 상태
- [ ] 크리에이터 없음 상태
- [ ] 콘텐츠 없음 상태
- [ ] CTA 버튼 포함

**예상 시간**: 2시간
**완료 조건**: 빈 상태 표시 확인

---

### Epic 8.4: 애니메이션 & 인터랙션
**담당**: Developer | **우선순위**: P2

#### Task 8.4.1: Framer Motion 적용 ⬜
- [ ] 페이지 전환 애니메이션
- [ ] 카드 호버 효과
- [ ] 모달 열림/닫힘 애니메이션
- [ ] 리스트 아이템 Stagger 효과

**예상 시간**: 3시간
**완료 조건**: 애니메이션 작동 확인

---

#### Task 8.4.2: 인터랙티브 요소 개선 ⬜
- [ ] 버튼 호버 효과
- [ ] 폼 필드 포커스 효과
- [ ] 툴팁 추가
- [ ] Toast 알림 (성공/에러)

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
- Phase 7: ⬜ 0%
- Phase 8: ⬜ 0%
- Phase 9: ⬜ 0%
- Phase 10: ⬜ 0%

**전체 진행률**: 0/10 (0%)

---

## 다음 액션
1. ✅ Phase 1, Epic 1.1, Task 1.1.1 시작: Node.js 프로젝트 초기화
2. 체크리스트 하나씩 완료하며 진행
3. 각 Epic 완료 시 데모 가능 상태 확인
4. 막히는 부분 문서화 및 해결

**행운을 빕니다! 🚀**

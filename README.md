# 삼양 트렌드·크리에이터 인사이트 AI 에이전트

> 삼양식품 글로벌 SNS 운영을 위한 트렌드 분석, 크리에이터 매칭, 콘텐츠 아이디어 자동 생성 AI 에이전트

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-orange)](https://openai.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📖 목차

- [프로젝트 개요](#프로젝트-개요)
- [주요 기능](#주요-기능)
- [스크린샷](#스크린샷)
- [기술 스택](#기술-스택)
- [시작하기](#시작하기)
- [환경 변수 설정](#환경-변수-설정)
- [데이터베이스 설정](#데이터베이스-설정)
- [프로젝트 구조](#프로젝트-구조)
- [개발 진행 상황](#개발-진행-상황)
- [배포](#배포)
- [문서](#문서)
- [라이센스](#라이센스)

---

## 프로젝트 개요

**Samyang Viral Insight Agent**는 삼양식품 DXT 팀의 틱톡·릴스 마케팅 업무를 자동화하는 AI 에이전트입니다.

### 핵심 가치

- 🤖 **AI 기반 자동화**: GPT-4o-mini를 활용한 트렌드 분석 및 콘텐츠 아이디어 생성
- 📊 **데이터 기반 의사결정**: 바이럴 포맷 분석 및 브랜드 적합도 평가
- ⚡ **업무 효율화**: 반복적인 트렌드 수집 및 분석 작업 자동화
- 🔒 **사용자별 데이터 관리**: 팀원별 작업 내역 분리 및 관리

---

## 주요 기능

### 1. 트렌드 분석 & 수집

- **자동 트렌드 수집**: YouTube Shorts, TikTok, Instagram Reels 트렌드 자동 수집
- **AI 분석**: GPT-4o-mini 기반 바이럴 포맷 분석 (POV, Reaction, Challenge 등)
- **삼양 적합도 평가**: 트렌드별 삼양 브랜드 관련성 점수 (0-100)
- **상세 데이터**: 조회수, 바이럴 점수, 포맷 타입, 타겟 국가 등

### 2. 크리에이터 매칭

- **프로필 분석**: 크리에이터 정보 자동 분석
- **브랜드 적합도 산정**: AI 기반 삼양 브랜드 적합도 점수 (0-100)
- **필터링 & 정렬**: 플랫폼, 국가, 적합도 등 다양한 조건으로 검색
- **상세 정보**: 팔로워 수, 평균 조회수, 콘텐츠 스타일 등

### 3. 콘텐츠 아이디어 생성

- **트렌드 기반 생성**: 선택한 트렌드를 기반으로 숏폼 콘텐츠 아이디어 자동 생성
- **브랜드별 맞춤**: 불닭, 삼양라면, 젤리 등 브랜드 카테고리별 맞춤 아이디어
- **촬영 가이드**: 훅, 장면 구성, 음악, 소품, 해시태그 등 상세 가이드 제공
- **톤앤매너**: Fun, Kawaii, Provocative, Cool 등 다양한 톤 지원

### 4. 리포트 자동 생성

- **일일 트렌드 리포트**: 수집된 트렌드 분석 및 통계
- **크리에이터 매칭 리포트**: 추천 크리에이터 목록 및 분석
- **콘텐츠 아이디어 리포트**: 생성된 아이디어 모음
- **내보내기**: JSON/PDF 형식 지원 (한글 폰트 포함)

### 5. 사용자별 데이터 관리

- **내 작업 / 전체 토글**: 모든 페이지에서 개인 작업과 전체 데이터 간 전환
- **권한 기반 삭제**: 본인이 생성한 데이터만 삭제 가능
- **팀 협업**: 팀원별 작업 내역 분리 관리

---

## 시연 영상

### 1. 대시보드 (Dashboard)

[![Dashboard Demo](https://img.youtube.com/vi/hmM5SWIaeX4/0.jpg)](https://youtu.be/hmM5SWIaeX4)

- 오늘의 트렌드 Top 5 위젯 (바이럴 점수 + 삼양 연관성 점수 기준)
- 최근 분석한 크리에이터 목록
- 최근 생성한 콘텐츠 아이디어 목록
- 퀵 액션 카드 (트렌드 분석, 크리에이터 매칭, 콘텐츠 생성, 리포트 생성 바로가기)
- 실시간 API 사용량 통계 표시

### 2. 트렌드 분석 (Trends)

[![Trends Demo](https://img.youtube.com/vi/eEYzu4aJsT8/0.jpg)](https://youtu.be/eEYzu4aJsT8)

- 키워드, 플랫폼, 국가 기반 트렌드 수집
- YouTube/TikTok/Instagram 영상 데이터 자동 수집
- GPT-4o-mini 기반 AI 분석 (바이럴 포맷, 훅 패턴, 비주얼 패턴, 음악 패턴)
- 바이럴 점수 (0-100) 자동 산출
- 삼양 브랜드 연관성 점수 (0-100) 자동 평가
- 필터링 (플랫폼, 국가, 최소 점수)
- 정렬 (수집 날짜, 바이럴 점수, 삼양 연관성)
- 트렌드 상세 모달 (AI 분석 결과, 타겟 오디언스, 성공 요인, 리스크, 추천 제품)

### 3. 크리에이터 매칭 (Creators)

[![Creators Demo](https://img.youtube.com/vi/sbFUxfrviAw/0.jpg)](https://youtu.be/sbFUxfrviAw)

- 크리에이터 프로필 입력 (사용자명, 플랫폼, 팔로워 수, 참여율, 콘텐츠 카테고리)
- GPT-4o-mini 기반 브랜드 적합도 분석
- 정량적 점수 (팔로워 품질, 참여도 강도, 도달 잠재력)
- 정성적 점수 (콘텐츠 정렬도, 브랜드 안전성, 진정성)
- 총 브랜드 적합도 점수 (0-100)
- 강점 / 약점 분석
- 오디언스 분석 (인구통계, 관심사, 참여 패턴)
- 협업 전략 제안
- 리스크 평가
- 추천 제품 리스트
- 필터링 (플랫폼, 최소 팔로워, 최소 참여율, 최소 적합도)

### 4. 콘텐츠 아이디어 (Content Ideas)

[![Content Ideas Demo](https://img.youtube.com/vi/gk_PTG4ZHl0/0.jpg)](https://youtu.be/gk_PTG4ZHl0)

- 브랜드 카테고리 선택 (불닭, 삼양라면, 젤리)
- 톤앤매너 선택 (재미, 귀여움, 도발적, 쿨)
- 타겟 국가 선택 (한국, 미국, 일본)
- 트렌드 기반 아이디어 생성 (선택적)
- GPT-4o-mini로 3개의 다양한 아이디어 동시 생성
- 아이디어별 상세 정보 (훅 텍스트, 훅 비주얼, 장면 구성, 편집 형식, 음악 스타일)
- 필요 소품 리스트
- 예상 성과 (조회수, 참여율, 바이럴 잠재력)

### 5. 리포트 (Reports)

[![Reports Demo](https://img.youtube.com/vi/FYS_MB7_5ck/0.jpg)](https://youtu.be/FYS_MB7_5ck)

- 리포트 타입 선택 (데일리 트렌드, 크리에이터 매칭, 콘텐츠 아이디어)
- 원클릭 리포트 생성
- 리포트 목록 조회 (카드 형식)
- 리포트 상세 모달 (전체 분석 결과 표시)
- JSON 파일 다운로드 기능

---

## 기술 스택

### Frontend

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.3
- **Styling**: Tailwind CSS 4.0
- **UI Components**: shadcn/ui (Radix UI)
- **State Management**: React Query (TanStack Query)
- **Form Handling**: React Hook Form + Zod

### Backend

- **API**: Next.js API Routes
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Cache**: Upstash Redis
- **ORM**: Supabase JavaScript Client

### AI/LLM

- **Primary LLM**: OpenAI GPT-4o-mini
- **Backup LLM**: Anthropic Claude 3.5 Sonnet (옵션)
- **SDK**: Vercel AI SDK

### Infrastructure

- **Hosting**: Vercel
- **Database**: Supabase Cloud
- **Cache**: Upstash Redis
- **Monitoring**: Vercel Analytics (옵션)

### External APIs

- YouTube Data API v3 (Shorts 트렌드)
- SerpAPI (TikTok/Instagram 검색)

---

## 시작하기

### 필수 요구사항

- Node.js 20.x 이상
- pnpm (권장) 또는 npm
- Supabase 계정 ([supabase.com](https://supabase.com))
- OpenAI API 키 ([platform.openai.com](https://platform.openai.com))

### 설치

1. **저장소 클론**

```bash
git clone https://github.com/your-username/samyang-rnd-ai-agent.git
cd samyang-rnd-ai-agent
```

2. **의존성 설치**

```bash
pnpm install
# 또는
npm install
```

3. **환경 변수 설정**

`.env.local` 파일을 생성하고 `.env.example`을 참고하여 환경 변수를 설정하세요.
자세한 내용은 [환경 변수 설정](#환경-변수-설정) 섹션을 참고하세요.

4. **데이터베이스 설정**

Supabase 대시보드에서 SQL 마이그레이션을 실행하세요.
자세한 내용은 [데이터베이스 설정](#데이터베이스-설정) 섹션을 참고하세요.

5. **개발 서버 실행**

```bash
pnpm dev
# 또는
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

---

## 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 입력하세요:

### 필수 환경 변수

```env
# ===========================
# Supabase Configuration
# ===========================
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# ===========================
# AI/LLM Configuration
# ===========================
DEFAULT_AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key

# ===========================
# Upstash Redis
# ===========================
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

# ===========================
# Development Configuration
# ===========================
# 개발 환경에서 세션이 없을 때 사용할 기본 사용자 ID
# Supabase 대시보드의 users 테이블에서 본인의 id를 확인하세요
DEV_DEFAULT_USER_ID=your_user_id_here
```

### 선택적 환경 변수

```env
# ===========================
# External API Keys (Optional)
# ===========================
# YouTube Data API v3
YOUTUBE_API_KEY=your_youtube_api_key

# SerpAPI (TikTok/Instagram 검색)
SERPAPI_API_KEY=your_serpapi_api_key

# Anthropic Claude (백업 LLM)
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 환경 변수 얻는 방법

1. **Supabase**
   - [supabase.com](https://supabase.com)에서 프로젝트 생성
   - Settings → API에서 URL과 Keys 확인

2. **OpenAI API Key**
   - [platform.openai.com](https://platform.openai.com)에서 API Key 생성

3. **Upstash Redis**
   - [console.upstash.com](https://console.upstash.com)에서 무료 Redis 데이터베이스 생성

4. **YouTube API Key**
   - [Google Cloud Console](https://console.cloud.google.com)에서 프로젝트 생성
   - YouTube Data API v3 활성화 후 API Key 생성

5. **SerpAPI Key**
   - [serpapi.com](https://serpapi.com)에서 무료 계정 생성

---

## 데이터베이스 설정

### 1. Supabase 프로젝트 생성

1. [supabase.com](https://supabase.com)에서 새 프로젝트 생성
2. 데이터베이스 비밀번호 설정 및 리전 선택

### 2. 데이터베이스 스키마 생성

Supabase 대시보드 → SQL Editor에서 다음 파일을 순서대로 실행:

```sql
-- 1. 초기 스키마 생성
scripts/migrations/001_initial_schema.sql

-- 2. RLS 정책 설정 (옵션)
scripts/migrations/002_rls_policies.sql
```

### 3. 사용자 생성

Supabase 대시보드 → Authentication → Users에서:

- 새 사용자 추가 또는
- 애플리케이션에서 회원가입

생성된 사용자의 ID를 `.env.local`의 `DEV_DEFAULT_USER_ID`에 설정하세요.

### 4. 데이터베이스 구조

주요 테이블:

- `users`: 사용자 정보
- `trends`: 트렌드 데이터
- `creators`: 크리에이터 정보
- `content_ideas`: 콘텐츠 아이디어
- `reports`: 생성된 리포트
- `api_usage`: API 사용량 추적

모든 테이블에는 `created_by` 컬럼이 있어 사용자별 데이터 격리를 지원합니다.

---

## 프로젝트 구조

```
samyang-rnd-ai-agent/
├── docs/                          # 문서
│   ├── PRD.md                     # 프로젝트 요구사항 문서
│   ├── TechStack.md               # 기술 스택 상세
│   ├── Task.md                    # 작업 계획 (Phase/Epic/Task)
│   └── API.md                     # API 문서
├── scripts/                       # 유틸리티 스크립트
│   └── migrations/                # 데이터베이스 마이그레이션
│       ├── 001_initial_schema.sql
│       └── 002_rls_policies.sql
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/                # 인증 페이지
│   │   │   └── login/
│   │   ├── (dashboard)/           # 대시보드 페이지
│   │   │   ├── dashboard/         # 메인 대시보드
│   │   │   ├── trends/            # 트렌드 분석
│   │   │   ├── creators/          # 크리에이터 매칭
│   │   │   ├── content/           # 콘텐츠 아이디어
│   │   │   └── reports/           # 리포트
│   │   └── api/                   # API Routes
│   │       ├── trends/            # 트렌드 API
│   │       ├── creators/          # 크리에이터 API
│   │       ├── content/           # 콘텐츠 API
│   │       └── reports/           # 리포트 API
│   ├── components/                # React 컴포넌트
│   │   ├── ui/                    # shadcn/ui 기본 컴포넌트
│   │   ├── dashboard/             # 대시보드 위젯
│   │   ├── trends/                # 트렌드 컴포넌트
│   │   ├── creators/              # 크리에이터 컴포넌트
│   │   ├── content/               # 콘텐츠 컴포넌트
│   │   └── reports/               # 리포트 컴포넌트
│   ├── lib/                       # 유틸리티 & 설정
│   │   ├── ai/                    # AI/LLM 관련
│   │   ├── db/                    # 데이터베이스
│   │   │   ├── server.ts          # Supabase 클라이언트
│   │   │   └── queries/           # 데이터베이스 쿼리
│   │   ├── api/                   # 외부 API 클라이언트
│   │   ├── auth/                  # 인증
│   │   └── cache/                 # 캐싱 (Redis)
│   ├── types/                     # TypeScript 타입 정의
│   ├── hooks/                     # Custom React Hooks
│   └── styles/                    # 전역 스타일
├── prompts/                       # LLM 프롬프트 템플릿
│   ├── trend-analysis.ts
│   ├── creator-matching.ts
│   └── content-generation.ts
└── public/                        # 정적 파일
```

---

## 개발 진행 상황

현재 프로젝트는 **Phase 10: 프로덕션 배포 준비** 완료 단계입니다.

### ✅ 완료된 Phase

- ✅ Phase 1: 프로젝트 초기 설정
- ✅ Phase 2: 데이터베이스 & 인증
- ✅ Phase 3: AI/LLM 통합
- ✅ Phase 4: 트렌드 분석 기능
- ✅ Phase 5: 크리에이터 매칭 기능
- ✅ Phase 6: 콘텐츠 아이디어 생성
- ✅ Phase 7: 리포트 생성 & 관리
- ✅ Phase 8: 대시보드 & 통계
- ✅ Phase 9: UI/UX 개선
- ✅ Phase 10: 프로덕션 배포 준비
  - ✅ Epic 10.1: 사용자별 데이터 격리 구현
  - ✅ Epic 10.2: 에러 처리 및 로깅
  - 🔄 Epic 10.3: 문서화 (진행 중)

### 🔄 진행 중인 작업

- Epic 10.3: 문서화
  - 🔄 Task 10.3.1: README.md 작성
  - ⬜ Task 10.3.2: API 문서 작성
  - ⬜ Task 10.3.3: 배포 가이드 작성

전체 작업 계획 및 상세 내용은 [docs/Task.md](docs/Task.md)를 참고하세요.

---

## 배포

### Vercel 배포

1. **GitHub 연동**

```bash
git remote add origin https://github.com/your-username/samyang-rnd-ai-agent.git
git push -u origin main
```

2. **Vercel 프로젝트 생성**
   - [vercel.com](https://vercel.com)에서 New Project
   - GitHub 저장소 선택
   - Framework Preset: Next.js 자동 감지

3. **환경 변수 설정**
   - Vercel 대시보드 → Settings → Environment Variables
   - `.env.local`의 모든 환경 변수 추가
   - **주의**: `DEV_DEFAULT_USER_ID`는 프로덕션에서 제외

4. **배포 실행**
   - Vercel이 자동으로 빌드 및 배포
   - 배포 URL 확인

### 자동 배포

- `main` 브랜치에 푸시 시 자동 배포 (프로덕션)
- `develop` 브랜치에 푸시 시 프리뷰 배포

---

## 주요 특징

### 🤖 AI 기반 분석

- OpenAI GPT-4 Turbo를 활용한 정확한 트렌드 분석
- Few-shot 프롬프트 엔지니어링으로 일관성 있는 결과
- 삼양 브랜드에 특화된 프롬프트 템플릿

### 📊 실시간 데이터

- 최신 틱톡/릴스/Shorts 트렌드 수집
- 실시간 크리에이터 프로필 분석
- 자동 리포트 생성

### 🎨 사용자 친화적 UI

- shadcn/ui 기반 고품질 컴포넌트
- 반응형 디자인 (모바일/태블릿/데스크톱)
- 직관적인 대시보드 및 필터링

### ⚡ 성능 최적화

- Redis 기반 LLM 응답 캐싱
- React Query를 통한 효율적인 데이터 페칭
- Next.js 15의 최신 최적화 기능 활용

### 🔒 보안 & 권한

- Supabase Auth 기반 인증
- 사용자별 데이터 격리
- 본인 데이터만 수정/삭제 가능

---

## 문서

- [PRD (Product Requirements Document)](docs/PRD.md) - 프로젝트 요구사항 및 목표
- [TechStack](docs/TechStack.md) - 기술 스택 상세 설명
- [Task](docs/Task.md) - 작업 계획 및 진행 상황
- [API Documentation](docs/API.md) - API 엔드포인트 문서 (작성 중)

---

## 개발 가이드

### 코드 스타일

- **Linting**: ESLint + Prettier
- **Commit 메시지**: Conventional Commits
  ```
  feat: 새로운 기능 추가
  fix: 버그 수정
  docs: 문서 수정
  style: 코드 포맷팅
  refactor: 코드 리팩토링
  test: 테스트 추가
  chore: 빌드 업무 수정
  ```

### 브랜치 전략

- `main`: 프로덕션 배포
- `develop`: 개발 환경
- `feature/*`: 기능 개발
- `fix/*`: 버그 수정

### 개발 명령어

```bash
# 개발 서버 실행
pnpm dev

# 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start

# 린트
pnpm lint

# 타입 체크
pnpm type-check
```

---

## 예상 비용

### MVP 단계 (무료 티어 활용)

- **월 $0**
  - Vercel Hobby: $0
  - Supabase Free: $0
  - Upstash Redis Free: $0
  - OpenAI API: $0

### 프로덕션 단계

- **월 $150-250** (최적화 후)
  - Vercel Pro: $20
  - Supabase Pro: $25
  - Upstash Redis: $10
  - OpenAI API: $100-200

자세한 비용 분석은 [docs/TechStack.md#비용-예상](docs/TechStack.md#9-비용-예상)을 참고하세요.

---

## 트러블슈팅

### 자주 발생하는 문제

1. **"Module not found" 에러**
   - `node_modules` 삭제 후 `pnpm install` 재실행

2. **Supabase 연결 오류**
   - `.env.local`의 Supabase URL과 키 확인
   - Supabase 프로젝트가 활성화되어 있는지 확인

3. **OpenAI API 오류**
   - API 키 유효성 확인
   - 계정 크레딧 잔액 확인

4. **"내 작업" 모드에서 데이터가 안 보임**
   - `.env.local`의 `DEV_DEFAULT_USER_ID` 확인
   - 개발 서버 재시작

---

## 라이센스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.

---

## 연락처

**프로젝트 관리자**: [Your Name]

- GitHub: [@your-username](https://github.com/your-username)
- Email: your-email@example.com

---

## 감사의 글

- [Vercel](https://vercel.com/) - 호스팅 및 Next.js 프레임워크
- [Supabase](https://supabase.com/) - 데이터베이스 및 인증
- [OpenAI](https://openai.com/) - GPT-4 API
- [shadcn/ui](https://ui.shadcn.com/) - UI 컴포넌트
- [TanStack Query](https://tanstack.com/query) - 데이터 페칭
- 삼양식품 DXT 팀 - 프로젝트 영감

---

**Made with ❤️ for Samyang Foods Global Marketing**

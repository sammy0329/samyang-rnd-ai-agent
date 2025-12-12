# 삼양 트렌드·크리에이터 인사이트 AI 에이전트

> 삼양식품 글로벌 SNS 운영을 위한 트렌드 분석, 크리에이터 매칭, 콘텐츠 아이디어 자동 생성 AI 에이전트

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-orange)](https://openai.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 프로젝트 개요

**Samyang Viral Insight Agent**는 삼양식품 DXT 팀의 틱톡·릴스 마케팅 업무를 자동화하는 AI 에이전트입니다.

### 핵심 기능

#### 1. 트렌드 분석 & 수집
- 최신 틱톡/릴스/숏폼 트렌드 자동 수집
- AI 기반 바이럴 포맷 분석 (POV, Reaction, Meme 등)
- 삼양 브랜드 관점의 트렌드 적합성 평가

#### 2. 크리에이터 매칭
- 크리에이터 프로필 자동 분석
- 삼양 브랜드 적합도 점수 산정 (0-100)
- 캠페인 목적별 크리에이터 추천

#### 3. 콘텐츠 아이디어 생성
- 트렌드 기반 숏폼 콘텐츠 아이디어 자동 생성
- 촬영 가이드 (훅, 장면 구성, 음악, 소품 등) 제공
- 브랜드 카테고리별 맞춤 아이디어 (불닭, 삼양라면, 젤리)

#### 4. 리포트 자동 생성
- 일일 트렌드 리포트
- 크리에이터 매칭 리포트
- 콘텐츠 아이디어 리포트
- PDF/JSON 형식 내보내기

---

## 기술 스택

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.3
- **Styling**: Tailwind CSS 4.0
- **UI Components**: shadcn/ui (Radix UI)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)

### Backend
- **API**: Next.js API Routes + Server Actions
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Cache**: Upstash Redis

### AI/LLM
- **Primary LLM**: OpenAI GPT-4 Turbo
- **Backup LLM**: Anthropic Claude 3.5 Sonnet
- **SDK**: Vercel AI SDK

### Infrastructure
- **Hosting**: Vercel
- **Monitoring**: Sentry
- **Analytics**: Vercel Analytics

### External APIs
- YouTube Data API v3
- SerpAPI (TikTok/Instagram 검색)

---

## 프로젝트 구조

```
samyang-rnd-ai-agent/
├── docs/                          # 문서
│   ├── PRD.md                     # 프로젝트 요구사항 문서
│   ├── TechStack.md               # 기술 스택 상세
│   ├── Task.md                    # 작업 계획 (Phase/Epic/Task)
│   └── API.md                     # API 문서 (예정)
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/                # 인증 관련 페이지
│   │   ├── (dashboard)/           # 대시보드 페이지
│   │   └── api/                   # API Routes
│   ├── components/                # React 컴포넌트
│   │   ├── ui/                    # shadcn/ui 컴포넌트
│   │   ├── trends/                # 트렌드 관련 컴포넌트
│   │   ├── creators/              # 크리에이터 관련 컴포넌트
│   │   ├── content/               # 콘텐츠 관련 컴포넌트
│   │   └── shared/                # 공유 컴포넌트
│   ├── lib/                       # 유틸리티 & 설정
│   │   ├── ai/                    # AI/LLM 관련
│   │   ├── db/                    # 데이터베이스
│   │   ├── api/                   # 외부 API 클라이언트
│   │   ├── auth/                  # 인증
│   │   └── cache/                 # 캐싱
│   ├── types/                     # TypeScript 타입
│   └── hooks/                     # Custom React Hooks
├── prompts/                       # LLM 프롬프트 템플릿
│   ├── system/
│   └── examples/
├── scripts/                       # 유틸리티 스크립트
└── tests/                         # 테스트
```

---

## 시작하기

### 필수 요구사항

- Node.js 20.x 이상
- pnpm (권장) 또는 npm
- Supabase 계정
- OpenAI API 키
- GitHub 계정 (배포용)

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

`.env.local` 파일을 생성하고 다음 내용을 입력하세요:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Anthropic (옵션)
ANTHROPIC_API_KEY=your_anthropic_api_key

# Upstash Redis
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# External APIs (옵션)
YOUTUBE_API_KEY=your_youtube_api_key
SERPAPI_KEY=your_serpapi_key
```

4. **데이터베이스 마이그레이션** (예정)
```bash
pnpm db:migrate
```

5. **개발 서버 실행**
```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

---

## 개발 진행 상황

현재 프로젝트는 **Phase 1: 프로젝트 초기 설정** 단계입니다.

### 완료된 작업
- ✅ 프로젝트 요구사항 문서 (PRD) 작성
- ✅ 기술 스택 문서 작성
- ✅ 작업 계획 (Task.md) 작성
- ✅ 프로젝트 구조 설계

### 진행 중인 작업
- 🔄 Phase 1: 프로젝트 초기 설정
  - Node.js 프로젝트 초기화
  - Next.js 설치 및 설정
  - 프로젝트 디렉토리 구조 생성

### 다음 단계
- ⬜ Phase 2: 데이터베이스 & 인증
- ⬜ Phase 3: AI/LLM 통합
- ⬜ Phase 4: 트렌드 분석 기능

전체 작업 계획은 [docs/Task.md](docs/Task.md)를 참고하세요.

---

## 문서

- [PRD (Product Requirements Document)](docs/PRD.md) - 프로젝트 요구사항 및 목표
- [TechStack](docs/TechStack.md) - 기술 스택 상세 설명
- [Task](docs/Task.md) - 작업 계획 (Phase/Epic/Task 분류)
- [API Documentation](docs/API.md) - API 엔드포인트 문서 (예정)

---

## 주요 특징

### AI 기반 분석
- OpenAI GPT-4를 활용한 트렌드 분석
- Few-shot 프롬프트 엔지니어링으로 정확도 향상
- 삼양 브랜드에 특화된 프롬프트 템플릿

### 실시간 데이터
- 최신 틱톡/릴스 트렌드 수집
- 실시간 크리에이터 프로필 분석
- 일일 트렌드 리포트 자동 생성

### 사용자 친화적 UI
- shadcn/ui 기반 고품질 컴포넌트
- 반응형 디자인 (모바일/태블릿 지원)
- 직관적인 대시보드

### 성능 최적화
- LLM 응답 캐싱 (Redis)
- 데이터베이스 쿼리 최적화
- 이미지 lazy loading
- 코드 스플리팅

---

## 예상 비용

### MVP 단계 (무료 티어 활용)
- **월 $20-40** (LLM 사용료만)
  - Vercel Hobby: $0
  - Supabase Free: $0
  - Upstash Free: $0
  - OpenAI API: $20-40

### 프로덕션 단계
- **월 $236-356** (최적화 전)
- **월 $186** (최적화 후)

자세한 비용 분석은 [docs/TechStack.md#비용-예상](docs/TechStack.md#9-비용-예상)을 참고하세요.

---

## 기여하기

이 프로젝트는 삼양식품 DXT 팀 지원을 위한 포트폴리오 프로젝트입니다.

### 개발 가이드라인
1. `develop` 브랜치에서 feature 브랜치 생성
2. 커밋 메시지는 [Conventional Commits](https://www.conventionalcommits.org/) 규칙 준수
3. Pull Request 전에 `pnpm lint` 실행
4. 코드 리뷰 후 merge

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

- [Vercel](https://vercel.com/) - 호스팅 및 AI SDK
- [Supabase](https://supabase.com/) - 데이터베이스 및 인증
- [OpenAI](https://openai.com/) - GPT-4 API
- [shadcn/ui](https://ui.shadcn.com/) - UI 컴포넌트
- 삼양식품 DXT 팀 - 프로젝트 영감

---

**Made with ❤️ for Samyang Foods Global Marketing**

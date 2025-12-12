# 기술 스택 (Tech Stack)

**삼양 트렌드·크리에이터 인사이트 AI 에이전트**

---

## 목차
1. [개발 환경](#1-개발-환경)
2. [프론트엔드 스택](#2-프론트엔드-스택)
3. [백엔드 스택](#3-백엔드-스택)
4. [데이터베이스](#4-데이터베이스)
5. [AI/LLM 통합](#5-aillm-통합)
6. [인프라 및 배포](#6-인프라-및-배포)
7. [프로젝트 구조](#7-프로젝트-구조)
8. [의존성 패키지](#8-의존성-패키지)
9. [비용 예상](#9-비용-예상)

---

## 1. 개발 환경

### AI 코딩 도구
- **Claude Code CLI**: 주요 개발 도구
- **Cursor IDE**: AI 페어 프로그래밍
- **GitHub Copilot**: 코드 자동완성

### 버전 관리
- **Git**: 버전 관리 시스템
- **GitHub**: 코드 호스팅 및 협업
- **Branch 전략**: Git Flow
  - `main`: 프로덕션 배포용
  - `develop`: 개발 통합 브랜치
  - `feature/*`: 기능별 개발 브랜치
  - `hotfix/*`: 긴급 수정

### 개발 도구
- **Node.js**: v20.x LTS
- **pnpm**: 패키지 매니저 (npm보다 빠르고 효율적)
- **ESLint**: 코드 품질 관리
- **Prettier**: 코드 포맷팅
- **Husky**: Git hooks 관리
- **lint-staged**: 커밋 전 자동 검사

---

## 2. 프론트엔드 스택

### 핵심 프레임워크
- **Next.js 15.x** (App Router)
  - Server Components 활용
  - Server Actions for API 호출
  - 자동 코드 스플리팅
  - SEO 최적화

### UI/UX 라이브러리
- **React 19.x**: UI 컴포넌트 라이브러리
- **TypeScript 5.x**: 타입 안정성
- **Tailwind CSS 4.x**: 유틸리티 기반 스타일링
- **shadcn/ui**: 고품질 UI 컴포넌트
  - Radix UI 기반
  - 커스터마이징 가능
  - Accessible by default

### 상태 관리
- **Zustand**: 글로벌 상태 관리
  - 간단하고 직관적인 API
  - TypeScript 완벽 지원
  - DevTools 연동

### 데이터 Fetching
- **TanStack Query (React Query) v5**: 서버 상태 관리
  - 자동 캐싱
  - 백그라운드 리페칭
  - Optimistic UI 업데이트
  - Infinite scroll 지원

### 폼 관리
- **React Hook Form**: 폼 상태 관리
- **Zod**: 스키마 검증
  - TypeScript 타입 자동 추론
  - 런타임 검증

### 차트/시각화
- **Recharts**: 트렌드 데이터 시각화
- **Framer Motion**: 애니메이션

### 유틸리티
- **date-fns**: 날짜 처리
- **clsx / cn**: 클래스명 조합
- **react-icons**: 아이콘 라이브러리

---

## 3. 백엔드 스택

### API 설계
- **Next.js API Routes** (App Router)
  - `/app/api` 디렉토리 기반
  - Server Actions for mutations
  - Edge Runtime 지원

### API 엔드포인트 구조
```
/api
  /trends
    /analyze       - POST: 트렌드 분석 요청
    /daily         - GET: 일일 트렌드 조회
  /creators
    /match         - POST: 크리에이터 매칭
    /profile       - GET: 프로필 분석
  /content
    /generate      - POST: 콘텐츠 아이디어 생성
  /reports
    /daily         - GET: 데일리 리포트
    /export        - POST: 리포트 내보내기
```

### 인증/권한
- **Supabase Auth**
  - Email/Password 인증
  - OAuth (Google, GitHub)
  - JWT 기반 세션 관리
  - Row Level Security (RLS)

### 미들웨어
- **Rate Limiting**: Upstash Redis
  - API 요청 제한
  - DDoS 방어
- **CORS**: Next.js 미들웨어
- **Error Handling**: 중앙화된 에러 처리

### 외부 API 통합
- **YouTube Data API v3**: 숏폼 데이터 수집
- **TikTok Research API**: 트렌드 분석 (대체: SerpAPI)
- **Instagram Graph API**: 릴스 데이터
- **SerpAPI**: 검색 기반 트렌드 수집 (백업)

---

## 4. 데이터베이스

### Database: Supabase (PostgreSQL)

#### 주요 테이블 스키마

**1. users (사용자)**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'user', -- user, admin
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**2. trends (트렌드 데이터)**
```sql
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
  collected_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_trends_keyword ON trends(keyword);
CREATE INDEX idx_trends_platform ON trends(platform);
CREATE INDEX idx_trends_collected_at ON trends(collected_at DESC);
```

**3. creators (크리에이터)**
```sql
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
  last_analyzed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_creators_platform ON creators(platform);
CREATE INDEX idx_creators_brand_fit_score ON creators(brand_fit_score DESC);
```

**4. content_ideas (콘텐츠 아이디어)**
```sql
CREATE TABLE content_ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trend_id UUID REFERENCES trends(id),
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
  created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_content_ideas_trend_id ON content_ideas(trend_id);
CREATE INDEX idx_content_ideas_brand_category ON content_ideas(brand_category);
```

**5. reports (리포트)**
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL, -- daily_trend, creator_match, content_idea
  title VARCHAR(255),
  content JSONB NOT NULL,
  metadata JSONB,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reports_type ON reports(type);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
```

**6. api_usage (API 사용량 추적)**
```sql
CREATE TABLE api_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
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
```

### Supabase 기능 활용
- **Row Level Security (RLS)**: 사용자별 데이터 접근 제어
- **Realtime**: 트렌드 분석 실시간 업데이트
- **Storage**: 리포트 파일 저장 (PDF, JSON)
- **Edge Functions**: 서버리스 함수 (옵션)

---

## 5. AI/LLM 통합

### 주요 LLM Provider

#### 1. OpenAI
- **GPT-4.1 Turbo**: 메인 추론 엔진
  - 트렌드 분석
  - 크리에이터 매칭
  - 콘텐츠 아이디어 생성
- **GPT-4.1 Mini**: 빠른 응답용
  - 간단한 분류 작업
  - 데이터 전처리

#### 2. Anthropic Claude
- **Claude 3.5 Sonnet**: 복잡한 분석용
  - 긴 컨텍스트 분석 (200K tokens)
  - 멀티턴 대화
- **백업 모델**: OpenAI 장애 시 대체

### LLM 통합 방식

#### Vercel AI SDK
```typescript
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText, streamText } from 'ai';

// 트렌드 분석
const result = await generateText({
  model: openai('gpt-4-turbo'),
  system: TREND_ANALYSIS_PROMPT,
  messages: [...]
});
```

### 프롬프트 관리
- **프롬프트 버전 관리**: Git으로 관리
- **템플릿 시스템**: `/prompts` 디렉토리
  ```
  /prompts
    /system
      - trend-analyzer.md
      - creator-matcher.md
      - content-generator.md
    /examples
      - few-shot-examples.json
  ```

### 임베딩 & 벡터 검색 (옵션)
- **OpenAI Embeddings**: text-embedding-3-large
- **Supabase pgvector**: 유사 트렌드 검색
  ```sql
  CREATE EXTENSION vector;
  ALTER TABLE trends ADD COLUMN embedding vector(1536);
  ```

### LLM 최적화
- **Caching**: 동일 요청 캐싱 (Redis)
- **Streaming**: 실시간 응답 스트리밍
- **Batching**: 여러 요청 배치 처리
- **Fallback**: 모델 장애 시 자동 전환

---

## 6. 인프라 및 배포

### 호스팅 플랫폼
- **Vercel**: Next.js 앱 배포
  - 자동 CI/CD
  - Edge Functions
  - Preview Deployments
  - 글로벌 CDN

### 데이터베이스 호스팅
- **Supabase Cloud**: PostgreSQL 호스팅
  - 자동 백업
  - 글로벌 리전 선택
  - 99.9% SLA

### 캐싱 & 세션
- **Upstash Redis**: 서버리스 Redis
  - Rate limiting
  - LLM 응답 캐싱
  - 세션 저장

### 모니터링 & 로깅
- **Vercel Analytics**: 성능 모니터링
- **Sentry**: 에러 추적
- **Better Stack (Logtail)**: 로그 관리
- **PostHog**: 사용자 행동 분석 (옵션)

### CI/CD 파이프라인
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    - Lint & Type check
    - Run tests
    - Build
    - Deploy to Vercel
```

### 환경 변수 관리
- **Vercel Environment Variables**: 프로덕션 환경
- **.env.local**: 로컬 개발
- **Doppler** (옵션): 시크릿 관리 중앙화

---

## 7. 프로젝트 구조

```
samyang-rnd-ai-agent/
├── .github/
│   └── workflows/
│       ├── deploy.yml              # CI/CD 파이프라인
│       └── test.yml                # 자동 테스트
├── docs/
│   ├── PRD.md                      # 프로젝트 요구사항 문서
│   ├── TechStack.md                # 기술 스택 문서
│   └── API.md                      # API 문서
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/
│   │   │   ├── trends/             # 트렌드 분석 페이지
│   │   │   ├── creators/           # 크리에이터 매칭 페이지
│   │   │   ├── content/            # 콘텐츠 아이디어 페이지
│   │   │   └── reports/            # 리포트 페이지
│   │   ├── api/                    # API Routes
│   │   │   ├── trends/
│   │   │   ├── creators/
│   │   │   ├── content/
│   │   │   └── reports/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/                 # React 컴포넌트
│   │   ├── ui/                     # shadcn/ui 컴포넌트
│   │   ├── trends/
│   │   ├── creators/
│   │   ├── content/
│   │   └── shared/
│   ├── lib/                        # 유틸리티 & 설정
│   │   ├── ai/                     # AI/LLM 관련
│   │   │   ├── providers/
│   │   │   │   ├── openai.ts
│   │   │   │   └── anthropic.ts
│   │   │   ├── prompts/
│   │   │   │   ├── trend-analyzer.ts
│   │   │   │   ├── creator-matcher.ts
│   │   │   │   └── content-generator.ts
│   │   │   └── utils.ts
│   │   ├── db/                     # 데이터베이스
│   │   │   ├── client.ts
│   │   │   ├── schema.ts
│   │   │   └── queries/
│   │   ├── api/                    # 외부 API 클라이언트
│   │   │   ├── youtube.ts
│   │   │   ├── tiktok.ts
│   │   │   └── serpapi.ts
│   │   ├── auth/
│   │   │   └── supabase.ts
│   │   ├── cache/
│   │   │   └── redis.ts
│   │   └── utils/
│   │       ├── validation.ts
│   │       └── formatting.ts
│   ├── types/                      # TypeScript 타입
│   │   ├── trends.ts
│   │   ├── creators.ts
│   │   ├── content.ts
│   │   └── api.ts
│   └── hooks/                      # Custom React Hooks
│       ├── useTrends.ts
│       ├── useCreators.ts
│       └── useContentIdeas.ts
├── prompts/                        # LLM 프롬프트 템플릿
│   ├── system/
│   │   ├── trend-analyzer.md
│   │   ├── creator-matcher.md
│   │   └── content-generator.md
│   └── examples/
│       └── few-shot-examples.json
├── scripts/                        # 유틸리티 스크립트
│   ├── seed-db.ts                  # DB 초기 데이터
│   └── migrate.ts                  # DB 마이그레이션
├── tests/                          # 테스트
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── public/                         # 정적 파일
├── .env.example                    # 환경 변수 예시
├── .eslintrc.json
├── .prettierrc
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 8. 의존성 패키지

### package.json (주요 의존성)

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.3.0",

    "@supabase/supabase-js": "^2.39.0",
    "@supabase/auth-helpers-nextjs": "^0.8.0",

    "ai": "^3.0.0",
    "@ai-sdk/openai": "^0.0.20",
    "@ai-sdk/anthropic": "^0.0.15",

    "@tanstack/react-query": "^5.17.0",
    "zustand": "^4.4.7",

    "react-hook-form": "^7.49.0",
    "zod": "^3.22.4",

    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.4",

    "tailwindcss": "^4.0.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",

    "recharts": "^2.10.0",
    "framer-motion": "^11.0.0",
    "react-icons": "^5.0.0",

    "date-fns": "^3.0.0",
    "axios": "^1.6.0",

    "@upstash/redis": "^1.28.0",
    "@upstash/ratelimit": "^1.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",

    "eslint": "^8.56.0",
    "eslint-config-next": "^15.0.0",
    "prettier": "^3.1.0",
    "prettier-plugin-tailwindcss": "^0.5.0",

    "husky": "^8.0.3",
    "lint-staged": "^15.2.0",

    "@testing-library/react": "^14.1.0",
    "@testing-library/jest-dom": "^6.1.0",
    "vitest": "^1.0.0",

    "@playwright/test": "^1.40.0"
  }
}
```

---

## 9. 비용 예상

### 월간 비용 추정 (MVP 단계)

#### 1. 인프라 비용

| 서비스 | 플랜 | 월 비용 | 비고 |
|--------|------|---------|------|
| **Vercel** | Pro | $20 | 프론트엔드 호스팅 |
| **Supabase** | Pro | $25 | 데이터베이스 + Auth + Storage (8GB) |
| **Upstash Redis** | Pay-as-you-go | $5-10 | 100만 요청 기준 |
| **Sentry** | Team | $26 | 에러 모니터링 (50K events) |
| **합계** | - | **$76-81** | - |

#### 2. AI/LLM 비용 (사용량 기반)

**가정**: 일 100회 분석 (월 3,000회)

| 기능 | 모델 | 평균 토큰 | 단가 | 월 비용 |
|------|------|-----------|------|---------|
| 트렌드 분석 | GPT-4 Turbo | 2,000 입력 + 1,000 출력 | $0.01/1K + $0.03/1K | $90 |
| 크리에이터 매칭 | GPT-4 Turbo | 1,500 입력 + 800 출력 | $0.01/1K + $0.03/1K | $60 |
| 콘텐츠 생성 | GPT-4 Turbo | 1,000 입력 + 1,500 출력 | $0.01/1K + $0.03/1K | $75 |
| **LLM 합계** | - | - | - | **$225** |

**최적화 옵션**:
- GPT-4 Mini 활용 시: **$45-60** (75% 절감)
- 캐싱 적용 시: **$110-135** (40% 절감)

#### 3. 외부 API 비용

| 서비스 | 플랜 | 월 비용 | 비고 |
|--------|------|---------|------|
| YouTube Data API | 무료 | $0 | 일 10,000 쿼터 (충분) |
| SerpAPI | Starter | $50 | 5,000 검색/월 |
| **합계** | - | **$50** | - |

#### 4. 총 비용 요약

| 카테고리 | 최소 | 최대 | 최적화 시 |
|----------|------|------|-----------|
| 인프라 | $76 | $81 | $76 |
| AI/LLM | $110 | $225 | $60 |
| 외부 API | $50 | $50 | $50 |
| **월 총계** | **$236** | **$356** | **$186** |
| **연 총계** | **$2,832** | **$4,272** | **$2,232** |

### 비용 최적화 전략

1. **LLM 비용 절감**
   - GPT-4 Mini 사용 (간단한 작업)
   - 응답 캐싱 (Redis)
   - 프롬프트 최적화로 토큰 수 감소
   - 배치 처리

2. **인프라 비용 절감**
   - Vercel Hobby 플랜 ($0) - 개인 프로젝트
   - Supabase Free 플랜 ($0) - 500MB DB
   - Upstash Free 플랜 ($0) - 10,000 요청/일

3. **API 비용 절감**
   - 검색 결과 캐싱 (24시간)
   - 불필요한 API 호출 최소화
   - 무료 대체 API 활용

### MVP 단계 (무료 티어 활용)

| 서비스 | 플랜 | 월 비용 |
|--------|------|---------|
| Vercel | Hobby | $0 |
| Supabase | Free | $0 |
| Upstash | Free | $0 |
| LLM (제한적 사용) | Pay-as-you-go | $20-40 |
| **MVP 총계** | - | **$20-40** |

---

## 10. 개발 단계별 우선순위

### Phase 1: MVP (2주)
- ✅ Next.js + TypeScript 기본 구조
- ✅ Supabase 연동 및 스키마 생성
- ✅ OpenAI API 통합
- ✅ 트렌드 분석 기본 기능
- ✅ 간단한 UI (shadcn/ui)

### Phase 2: 핵심 기능 (2주)
- ✅ 크리에이터 매칭 기능
- ✅ 콘텐츠 아이디어 생성
- ✅ 리포트 생성 및 내보내기
- ✅ 사용자 인증 (Supabase Auth)

### Phase 3: 최적화 (1주)
- ✅ LLM 응답 캐싱
- ✅ Rate limiting
- ✅ 에러 핸들링
- ✅ 로딩 상태 개선

### Phase 4: 배포 및 문서화 (1주)
- ✅ Vercel 배포
- ✅ 모니터링 설정
- ✅ API 문서 작성
- ✅ README 및 포트폴리오 준비

---

## 참고 자료

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [OpenAI API](https://platform.openai.com/docs)
- [Anthropic Claude](https://docs.anthropic.com/)

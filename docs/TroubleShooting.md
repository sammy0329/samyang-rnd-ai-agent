# Troubleshooting Guide

프로젝트 개발 중 발생할 수 있는 문제와 해결 방법을 정리한 문서입니다.

---

## API 관련 이슈

### SerpAPI - TikTok/Instagram 검색 결과 0개 문제

**증상:**
- `searchTikTokVideos()` 호출 시 항상 0개 반환
- `searchInstagramReels()` 호출 시 항상 0개 반환
- YouTube 결과만 계속 나옴

**원인:**
이것은 **버그가 아니라 Google Videos API의 근본적인 제약사항**입니다.

SerpAPI는 Google Videos API를 사용하므로:
- Google은 자사 플랫폼(YouTube)을 우선적으로 노출
- TikTok/Instagram 컨텐츠는 Google 검색에 거의 인덱싱되지 않음
- Google이 인덱싱한 컨텐츠만 검색 가능

**테스트 결과 분석:**

```bash
npx tsx scripts/test-serpapi.ts

# 결과:
📹 테스트 1: TikTok 비디오 검색
✅ 검색 성공! 찾은 TikTok 비디오: 0개

📸 테스트 2: Instagram Reels 검색
✅ 검색 성공! 찾은 Instagram Reels: 0개

🌐 테스트 4: 모든 플랫폼 숏폼 검색 (키워드: "Korean noodles")
✅ 검색 성공! 찾은 숏폼: 10개
플랫폼별 분포:
   YouTube: 9개
   Instagram: 1개  # 드물게 Google에 인덱싱된 경우
```

**해결 방법:**

1. **YouTube 컨텐츠 검색에는 YouTube Data API 사용** (권장)
   ```typescript
   import { searchShorts, searchTrendingShorts } from '@/lib/api/youtube';

   // YouTube Shorts 검색 (Task 4.1.1)
   const shorts = await searchShorts('삼양라면', 10);
   ```

2. **TikTok/Instagram은 별도 API 또는 스크래핑 서비스 필요**
   - TikTok Research API (공식, 연구 목적)
   - Instagram Graph API (공식, 제한적)
   - Apify, ScrapFly 등 서드파티 스크래핑 서비스

3. **SerpAPI는 보조적으로 활용**
   - YouTube 검색의 대안으로 사용
   - 가끔 Google에 인덱싱된 Instagram/TikTok 컨텐츠 발견 가능

**관련 문서:**
- [docs/SERPAPI_SETUP.md - 제약 사항](./SERPAPI_SETUP.md#제약-사항)

**완료 일시:** 2025-12-13
**담당자:** AI Agent
**상태:** ✅ 정상 (제약사항 문서화 완료)

---

## 환경 변수 관련 이슈

### API 키 관련 에러

**증상:**
```
YouTubeAPIKeyMissingError: YOUTUBE_API_KEY is not set in environment variables
SerpAPIKeyMissingError: SERPAPI_API_KEY is not set in environment variables
```

**해결 방법:**

1. `.env.local` 파일 확인
   ```bash
   # 프로젝트 루트에 .env.local 파일이 있는지 확인
   ls -la .env.local
   ```

2. API 키 설정
   ```bash
   # .env.local 파일에 아래 내용 추가
   YOUTUBE_API_KEY=your_actual_youtube_api_key
   SERPAPI_API_KEY=your_actual_serpapi_key
   ```

3. 개발 서버 재시작
   ```bash
   # 환경 변수 변경 후 반드시 재시작
   npm run dev
   ```

4. 테스트 스크립트는 자동으로 `.env.local` 로드
   ```bash
   # .env.local을 자동으로 읽음
   npx tsx scripts/test-youtube-api.ts
   npx tsx scripts/test-serpapi.ts
   ```

---

## TypeScript 컴파일 에러

### 기존 코드와의 타입 충돌

**증상:**
```
error TS2345: Argument of type '{ provider?: ProviderType | undefined; ... }'
is not assignable to parameter of type 'ProviderConfig'
```

**원인:**
- 기존 AI 에이전트 코드(`src/lib/ai/agents/`)에서 `ProviderConfig` 타입 불일치

**해결 방법:**
- **현재 상태:** YouTube API, SerpAPI 클라이언트는 정상 작동
- **영향 범위:** 기존 AI 에이전트 코드에만 영향
- **조치:** 다음 단계(트렌드 분석 API)에서 함께 수정 예정

---

## Supabase RLS 관련 이슈

### API 라우트에서 RLS 정책 위반 에러

**증상:**
```
PostgresError: new row violates row-level security policy for table "api_usage"
PostgresError: new row violates row-level security policy for table "trends"
```

**원인:**
- API 라우트(`app/api/**/route.ts`)는 인증된 사용자 컨텍스트 없이 실행됨
- `createServerSupabaseClient()`는 anon key를 사용하므로 RLS 정책에 막힘
- `api_usage`, `trends` 테이블의 RLS 정책은 인증된 사용자만 INSERT 허용

**해결 방법:**

시스템 작업(API usage tracking, 자동 데이터 수집 등)에는 Admin Client 사용:

```typescript
// ❌ 잘못된 방법 - API 라우트에서 RLS 정책에 막힘
import { createServerSupabaseClient } from '@/lib/db/server';

export async function createAPIUsage(input: CreateAPIUsageInput) {
  const supabase = await createServerSupabaseClient(); // anon key 사용
  const { data, error } = await supabase.from('api_usage').insert([...]);
  // Error: new row violates row-level security policy
}

// ✅ 올바른 방법 - Admin Client로 RLS 우회
import { createAdminClient } from '@/lib/db/server';

export async function createAPIUsage(input: CreateAPIUsageInput) {
  const supabase = createAdminClient(); // service role key 사용
  const { data, error } = await supabase.from('api_usage').insert([...]);
  // Success!
}
```

**적용 파일:**
- `src/lib/db/queries/api-usage.ts` - `createAPIUsage()` 함수
- `src/lib/db/queries/trends.ts` - `createTrend()` 함수

**주의사항:**
- Admin Client는 모든 RLS 정책을 우회하므로 신중하게 사용
- 사용자 인증이 필요한 작업에는 `createServerSupabaseClient()` 사용
- Service role key가 `.env.local`에 설정되어 있어야 함:
  ```bash
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Admin Client용
  ```

**완료 일시:** 2025-12-13
**담당자:** AI Agent
**상태:** ✅ 해결됨

---

## AI 관련 이슈

### AI generateObject 스키마 검증 실패

**증상:**
```
Error [AI_NoObjectGeneratedError]: No object generated: response did not match schema.
Missing fields: trend_name, brand_fit_reason, recommended_products,
                target_audience, estimated_reach, key_success_factors, risks
```

**원인:**
- AI 프롬프트 템플릿(`prompts/system/trend-analyzer.md`)의 JSON 출력 형식과
- Zod 스키마(`src/lib/ai/agents/trend-analyzer.ts`)가 불일치
- 프롬프트는 중첩된 `analysis_data` 객체를 사용했지만, 스키마는 플랫한 구조 요구

**해결 방법:**

1. **프롬프트 템플릿을 Zod 스키마와 정확히 일치시키기**

```markdown
<!-- prompts/system/trend-analyzer.md -->

## 출력 형식

다음 JSON 형식으로 분석 결과를 제공하세요:

\`\`\`json
{
  "trend_name": "트렌드 이름 (예: Spicy Noodle Challenge)",
  "platform": "youtube",
  "country": "KR",
  "format_type": "Challenge",
  "hook_pattern": "첫 3초에 매운맛 반응을 보여주며 호기심 유발",
  "visual_pattern": "클로즈업과 빠른 컷 전환으로 긴장감 조성",
  "music_pattern": "트렌딩 사운드를 배경으로 챌린지 분위기 강조",
  "viral_score": 85,
  "samyang_relevance": 95,
  "brand_fit_reason": "불닭볶음면의 매운맛이...",
  "recommended_products": ["buldak", "samyang_ramen"],
  "target_audience": "10-30대 MZ세대",
  "estimated_reach": "100만 조회수 이상 예상",
  "key_success_factors": ["...", "...", "..."],
  "risks": ["...", "..."]
}
\`\`\`

**중요**: 위 형식을 정확히 따라야 합니다. 모든 필드가 필수입니다.
```

2. **Zod 스키마 확인**
```typescript
// src/lib/ai/agents/trend-analyzer.ts
const trendAnalysisSchema = z.object({
  trend_name: z.string(),
  platform: z.enum(['youtube', 'tiktok', 'instagram', 'shorts', 'reels']),
  country: z.string(),
  format_type: z.string().optional(),
  hook_pattern: z.string().optional(),
  // ... 모든 필드가 프롬프트와 일치해야 함
});
```

**베스트 프랙티스:**
- 프롬프트 작성 시 Zod 스키마를 먼저 정의
- JSON 예시를 프롬프트에 명확히 제공
- 배열 필드는 예시 값을 3개 이상 보여주기
- 필수 필드 강조 (예: "**중요**: 모든 필드가 필수입니다")

**완료 일시:** 2025-12-13
**담당자:** AI Agent
**상태:** ✅ 해결됨

---

### AI Provider 모듈 로드 시점 에러

**증상:**
```
Error: OPENAI_API_KEY environment variable is not set
    at module evaluation (src/lib/ai/providers/openai.ts:11:9)

Error: ANTHROPIC_API_KEY environment variable is not set
    at module evaluation (src/lib/ai/providers/anthropic.ts:11:9)
```

**원인:**
- `src/lib/ai/providers/index.ts`가 `openai.ts`와 `anthropic.ts`를 모두 import
- 각 provider 파일이 API 키가 없으면 모듈 로드 시점에 즉시 에러 throw
- 하나의 provider만 사용하려고 해도 다른 provider의 API 키까지 필요하게 됨

**잘못된 구현:**
```typescript
// src/lib/ai/providers/openai.ts
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('OPENAI_API_KEY environment variable is not set');
}
export const openai = createOpenAI({ apiKey });
```

**해결 방법:**

API 키 검증을 모듈 로드 시점이 아닌 사용 시점으로 지연:

```typescript
// src/lib/ai/providers/openai.ts
const apiKey = process.env.OPENAI_API_KEY || '';

export const openai = createOpenAI({
  apiKey,  // 빈 문자열도 허용
});

// src/lib/ai/providers/index.ts
function getDefaultProvider(): ProviderType {
  const defaultProvider = process.env.DEFAULT_AI_PROVIDER as ProviderType;

  // 사용 시점에 검증
  if (defaultProvider === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
    return 'anthropic';
  }

  if (defaultProvider === 'openai' && process.env.OPENAI_API_KEY) {
    return 'openai';
  }

  // API 키가 있는 provider 자동 선택
  if (process.env.ANTHROPIC_API_KEY) {
    return 'anthropic';
  }

  return 'openai';  // 기본값
}
```

**장점:**
- OpenAI만 사용할 때 Anthropic API 키 불필요
- Anthropic만 사용할 때 OpenAI API 키 불필요
- `.env.local`에 placeholder 값 있어도 에러 없음
- 모듈 import 순서에 관계없이 작동

**주의사항:**
- 실제 API 호출 시에는 여전히 유효한 API 키 필요
- `DEFAULT_AI_PROVIDER` 환경 변수로 우선 provider 지정 가능

**완료 일시:** 2025-12-13
**담당자:** AI Agent
**상태:** ✅ 해결됨

---

## 다음 단계

이 문서는 프로젝트 진행 중 발견되는 이슈들을 계속 추가할 예정입니다.

새로운 이슈를 발견하면:
1. 증상과 원인을 명확히 기록
2. 해결 방법 또는 workaround 제시
3. 관련 문서 링크 추가
4. 완료 일시와 상태 업데이트

---

**마지막 업데이트:** 2025-12-13

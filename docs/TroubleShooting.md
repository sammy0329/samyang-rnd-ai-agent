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

**완료 일시:** 2024-12-13
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

## 다음 단계

이 문서는 프로젝트 진행 중 발견되는 이슈들을 계속 추가할 예정입니다.

새로운 이슈를 발견하면:
1. 증상과 원인을 명확히 기록
2. 해결 방법 또는 workaround 제시
3. 관련 문서 링크 추가
4. 완료 일시와 상태 업데이트

---

**마지막 업데이트:** 2024-12-13

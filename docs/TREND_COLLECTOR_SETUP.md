# 트렌드 데이터 수집 스크립트 - 설정 및 사용 가이드

## ✅ Task 4.1.3 완료 내역

### 구현된 기능

1. **트렌드 수집 모듈** ([src/lib/api/trend-collector.ts](../src/lib/api/trend-collector.ts))
   - ✅ `collectTrends()` - 여러 플랫폼에서 트렌드 데이터 수집
   - ✅ `collectTrendingTrends()` - 최근 7일 트렌딩 데이터 수집
   - ✅ 데이터 정규화 (YouTube, TikTok, Instagram → 통합 형식)
   - ✅ URL 기반 중복 제거
   - ✅ 제목 유사도 기반 중복 제거 (선택)
   - ✅ 플랫폼별 에러 핸들링

2. **타입 정의** ([src/types/trend.ts](../src/types/trend.ts))
   - ✅ `NormalizedTrendVideo` - 정규화된 트렌드 비디오 데이터
   - ✅ `TrendCollectionOptions` - 수집 옵션
   - ✅ `TrendCollectionResult` - 수집 결과
   - ✅ `DeduplicationOptions` - 중복 제거 옵션

3. **데이터 정규화**
   - YouTube API → `NormalizedTrendVideo`
   - SerpAPI → `NormalizedTrendVideo`
   - 모든 플랫폼의 데이터를 통합 형식으로 변환

4. **테스트 스크립트** ([scripts/test-trend-collector.ts](../scripts/test-trend-collector.ts))
   - ✅ 모든 플랫폼 수집 테스트
   - ✅ 특정 플랫폼만 수집 테스트
   - ✅ 트렌딩 데이터 수집 테스트

---

## 🚀 사용 방법

### 1. 기본 사용법

```typescript
import { collectTrends } from '@/lib/api/trend-collector';

// 모든 플랫폼에서 트렌드 수집
const result = await collectTrends({
  keyword: '삼양라면',
  maxResults: 10,
});

console.log(`총 ${result.totalVideos}개 수집`);
console.log('플랫폼별 분포:', result.breakdown);
```

### 2. 특정 플랫폼만 수집

```typescript
// YouTube만 수집
const youtubeOnly = await collectTrends({
  keyword: '불닭볶음면',
  maxResults: 20,
  platforms: ['YouTube'],
});

// YouTube + Instagram만 수집
const multiPlatform = await collectTrends({
  keyword: 'Korean noodles',
  maxResults: 15,
  platforms: ['YouTube', 'Instagram'],
});
```

### 3. 날짜 필터 사용 (YouTube만 지원)

```typescript
// 최근 30일 데이터만 수집
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const recent = await collectTrends({
  keyword: '삼양',
  maxResults: 10,
  platforms: ['YouTube'],
  dateFilter: {
    publishedAfter: thirtyDaysAgo.toISOString(),
  },
});
```

### 4. 트렌딩 데이터 수집 (최근 7일, 높은 조회수)

```typescript
import { collectTrendingTrends } from '@/lib/api/trend-collector';

// 최근 7일간 인기 트렌드
const trending = await collectTrendingTrends('Korean food', 20);

// 조회수 순으로 정렬
const sorted = trending.videos.sort((a, b) =>
  (b.viewCount || 0) - (a.viewCount || 0)
);
```

---

## 📊 데이터 구조

### NormalizedTrendVideo

모든 플랫폼의 데이터가 이 형식으로 정규화됩니다:

```typescript
interface NormalizedTrendVideo {
  // 필수 필드
  id: string;
  title: string;
  platform: 'YouTube' | 'TikTok' | 'Instagram' | 'Facebook' | 'Other';
  thumbnailUrl: string;
  videoUrl: string;

  // 선택 필드
  publishedAt?: string; // ISO 8601
  duration?: string; // ISO 8601 또는 "MM:SS"
  creatorName?: string;
  creatorId?: string;
  viewCount?: number; // YouTube만 제공
  likeCount?: number; // YouTube만 제공
  commentCount?: number; // YouTube만 제공
  description?: string; // YouTube만 제공
  tags?: string[]; // YouTube만 제공
  clipUrl?: string; // SerpAPI에서 제공 (미리보기)

  // 메타데이터
  collectedAt: string; // 수집 시간
  source: 'youtube-api' | 'serpapi'; // 데이터 출처
}
```

### TrendCollectionResult

```typescript
interface TrendCollectionResult {
  keyword: string;
  totalVideos: number;
  videos: NormalizedTrendVideo[];
  breakdown: {
    YouTube?: number;
    TikTok?: number;
    Instagram?: number;
    // ...
  };
  collectedAt: string;
  errors?: Array<{
    platform: string;
    source: string;
    error: string;
  }>;
}
```

---

## 🧪 테스트 방법

### 방법 1: 테스트 스크립트 실행 (권장)

```bash
npx tsx scripts/test-trend-collector.ts
```

**예상 결과:**
```
✅ .env.local 파일 로드 완료

🎬 트렌드 데이터 수집 스크립트 테스트 시작

============================================================

📊 테스트 1: 모든 플랫폼 트렌드 수집 (키워드: "삼양라면")
------------------------------------------------------------

[TrendCollector] Collecting YouTube data for: 삼양라면
[TrendCollector] Collected 5 YouTube videos
[TrendCollector] Collecting TikTok data for: 삼양라면
[TrendCollector] Collected 0 TikTok videos
[TrendCollector] Collecting Instagram data for: 삼양라면
[TrendCollector] Collected 0 Instagram videos
[TrendCollector] Deduplicating 5 videos...
[TrendCollector] After deduplication: 5 videos

✅ 수집 완료!
   총 비디오: 5개
   플랫폼별 분포:
     - YouTube: 5개

[... 더 많은 결과 ...]

✅ 모든 테스트 성공!
```

### 방법 2: 코드에서 직접 사용

```typescript
import { collectTrends } from '@/lib/api/trend-collector';

const result = await collectTrends({
  keyword: '삼양라면',
  maxResults: 10,
});

// 결과 활용
for (const video of result.videos) {
  console.log(`${video.platform}: ${video.title}`);
  console.log(`  조회수: ${video.viewCount?.toLocaleString() || 'N/A'}`);
  console.log(`  URL: ${video.videoUrl}`);
}
```

---

## 🔧 중복 제거 옵션

### URL 기반 중복 제거 (기본)

```typescript
// URL이 같으면 중복으로 간주 (대소문자 무시)
const result = await collectTrends({
  keyword: '삼양',
  maxResults: 20,
  // URL 중복 제거는 기본적으로 활성화됨
});
```

### 제목 유사도 기반 중복 제거 (고급)

```typescript
// 제목이 90% 이상 유사하면 중복으로 간주
// 주의: 내부적으로 Jaccard similarity 사용
// 실제 프로덕션에서는 더 정교한 알고리즘 권장
```

---

## 📈 플랫폼별 데이터 특성

### YouTube (youtube-api)
✅ **장점:**
- 풍부한 메타데이터 (조회수, 좋아요, 댓글, 태그)
- 정확한 게시일 및 길이 정보
- 날짜 필터 지원

⚠️ **제약:**
- API Quota 제한 (하루 10,000 units)

### TikTok/Instagram (serpapi)
⚠️ **제약:**
- Google Videos API 의존 → 대부분 YouTube 결과 반환
- 메타데이터 제한적 (조회수, 좋아요 등 없음)
- 실제 TikTok/Instagram 결과는 거의 없음

✅ **장점:**
- 가끔 Google에 인덱싱된 컨텐츠 발견 가능

**권장:**
- YouTube 컨텐츠 수집에 집중
- TikTok/Instagram은 별도 API 또는 스크래핑 서비스 사용

---

## ⚠️ 알려진 제약 사항

### 1. SerpAPI의 TikTok/Instagram 제한
- Google Videos API 특성상 주로 YouTube 결과만 반환
- 자세한 내용: [docs/TroubleShooting.md](./TroubleShooting.md#serpapi---tiktokinstagram-검색-결과-0개-문제)

### 2. API Quota 관리
- YouTube: 하루 10,000 units (검색 1회 = 약 101 units)
- SerpAPI: 월 100 searches (무료 플랜)

### 3. 중복 제거의 한계
- 현재 구현은 간단한 Jaccard similarity 사용
- 동일 비디오의 다른 업로드는 감지 못 할 수 있음
- 프로덕션에서는 더 정교한 알고리즘 권장

---

## 💡 사용 팁

### 1. 플랫폼별 수집 최적화

```typescript
// YouTube만 사용 (가장 효과적)
const youtubeData = await collectTrends({
  keyword: '삼양',
  maxResults: 50,
  platforms: ['YouTube'],
});

// 날짜 필터로 최신 데이터만
const recent = await collectTrendingTrends('불닭볶음면', 30);
```

### 2. 에러 핸들링

```typescript
const result = await collectTrends({
  keyword: '삼양',
  maxResults: 10,
});

// 에러 확인
if (result.errors && result.errors.length > 0) {
  console.warn('일부 플랫폼에서 수집 실패:');
  result.errors.forEach(err => {
    console.warn(`  ${err.platform}: ${err.error}`);
  });
}

// 성공한 데이터는 사용 가능
console.log(`수집 성공: ${result.totalVideos}개`);
```

### 3. 데이터 정렬 및 필터링

```typescript
const result = await collectTrends({
  keyword: '삼양',
  maxResults: 50,
});

// 조회수 순 정렬
const byViews = result.videos
  .filter(v => v.viewCount)
  .sort((a, b) => (b.viewCount! - a.viewCount!));

// 플랫폼별 필터링
const youtubeVideos = result.videos.filter(v => v.platform === 'YouTube');
const instagramVideos = result.videos.filter(v => v.platform === 'Instagram');
```

---

## 📝 구현된 파일 목록

```
src/
├── types/
│   └── trend.ts                      # 트렌드 데이터 타입 정의
└── lib/
    └── api/
        └── trend-collector.ts        # 트렌드 수집 스크립트

scripts/
└── test-trend-collector.ts           # 테스트 스크립트
```

---

## 🚀 다음 단계

Task 4.1.3이 완료되었습니다! 다음 작업을 진행하세요:

- **Task 4.2**: 트렌드 분석 API 엔드포인트

---

**작업 완료자**: AI Agent
**작업 일시**: 2025-12-13
**완료 조건**: ✅ 트렌드 데이터 수집 성공

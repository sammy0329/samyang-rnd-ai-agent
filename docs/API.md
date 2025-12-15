# API 문서

삼양식품 숏폼 마케팅 AI 에이전트 API 문서입니다.

## 목차

- [개요](#개요)
- [인증 (Authentication)](#인증-authentication)
- [Rate Limiting](#rate-limiting)
- [공통 응답 형식](#공통-응답-형식)
- [엔드포인트](#엔드포인트)
  - [트렌드 (Trends)](#트렌드-trends)
  - [크리에이터 (Creators)](#크리에이터-creators)
  - [콘텐츠 아이디어 (Content Ideas)](#콘텐츠-아이디어-content-ideas)
  - [리포트 (Reports)](#리포트-reports)
- [에러 코드](#에러-코드)
- [사용 예시](#사용-예시)

---

## 개요

### Base URL

```
개발: http://localhost:3000
프로덕션: https://your-domain.vercel.app
```

### AI 모델

- **GPT-4o-mini**: 콘텐츠 생성, 트렌드 분석, 크리에이터 매칭 등 모든 AI 작업에 사용
- **비용 효율적**: OpenAI 무료 크레딧으로도 사용 가능

### 기술 스택

- **프레임워크**: Next.js 15 App Router
- **인증**: Supabase Auth
- **데이터베이스**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4o-mini
- **검증**: Zod

---

## 인증 (Authentication)

### 세션 기반 인증

모든 API 엔드포인트는 Supabase 세션 쿠키를 사용하여 인증합니다.

```typescript
// 클라이언트에서 요청 시 자동으로 쿠키 포함
const response = await fetch('/api/trends', {
  credentials: 'include', // 쿠키 자동 포함
});
```

### 개발 환경 기본 사용자

개발 환경에서는 `.env.local`의 `DEV_DEFAULT_USER_ID`를 사용하여 인증 없이 테스트할 수 있습니다.

```bash
# .env.local
DEV_DEFAULT_USER_ID=your_user_id_here
```

### 사용자 데이터 격리

- 대부분의 엔드포인트는 `showAll` 파라미터를 지원합니다
- `showAll=false` (기본값): 로그인한 사용자가 생성한 데이터만 조회
- `showAll=true`: 모든 사용자의 데이터 조회

---

## Rate Limiting

IP 기반 Rate Limiting이 적용됩니다.

| 엔드포인트 | 제한 | 시간 윈도우 |
|-----------|------|------------|
| `POST /api/trends/analyze` | 10회 | 5분 |
| `POST /api/creators/match` | 20회 | 5분 |
| `POST /api/content/generate` | 5회 | 5분 |

### Rate Limit 응답 헤더

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1234567890
Retry-After: 120
```

---

## 공통 응답 형식

### 성공 응답

```json
{
  "success": true,
  "data": {
    // 응답 데이터
  },
  "meta": {
    "duration": "123ms",
    "timestamp": "2025-01-15T12:34:56.789Z"
  }
}
```

### 에러 응답

```json
{
  "success": false,
  "error": "에러 타입",
  "message": "상세 에러 메시지",
  "details": {
    // 추가 에러 정보 (선택적)
  }
}
```

---

## 엔드포인트

### 트렌드 (Trends)

#### 1. 트렌드 목록 조회

트렌드 데이터를 필터링하고 정렬하여 조회합니다.

**요청**

```http
GET /api/trends
```

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 | 기본값 |
|---------|------|------|------|--------|
| keyword | string | ❌ | 키워드 필터링 | - |
| platform | `tiktok` \| `reels` \| `shorts` | ❌ | 플랫폼 필터링 | - |
| country | `KR` \| `US` \| `JP` | ❌ | 국가 필터링 | - |
| minViralScore | number (0-100) | ❌ | 최소 바이럴 점수 | - |
| minSamyangRelevance | number (0-100) | ❌ | 최소 삼양 연관성 점수 | - |
| sortBy | `collected_at` \| `viral_score` \| `samyang_relevance` \| `created_at` | ❌ | 정렬 기준 | `collected_at` |
| sortOrder | `asc` \| `desc` | ❌ | 정렬 순서 | `desc` |
| limit | number (1-100) | ❌ | 페이지당 개수 | 50 |
| offset | number | ❌ | 페이지 오프셋 | 0 |
| showAll | boolean | ❌ | 전체 데이터 조회 여부 | false |

**응답 예시**

```json
{
  "success": true,
  "data": {
    "trends": [
      {
        "id": "uuid",
        "keyword": "불닭볶음면 챌린지",
        "platform": "shorts",
        "country": "KR",
        "format_type": "챌린지",
        "hook_pattern": "첫 3초 리액션",
        "visual_pattern": "클로즈업 촬영",
        "music_pattern": "업템포 비트",
        "viral_score": 85,
        "samyang_relevance": 92,
        "analysis_data": {
          "brand_fit_reason": "브랜드 적합 이유",
          "recommended_products": ["불닭볶음면"],
          "target_audience": "10-20대",
          "estimated_reach": "100만+",
          "key_success_factors": ["중독성", "참여 유도"],
          "risks": ["과도한 자극"],
          "collected_videos": [...]
        },
        "collected_at": "2025-01-15T10:00:00Z",
        "created_at": "2025-01-15T10:05:00Z",
        "created_by": "user-uuid"
      }
    ],
    "total": 42,
    "limit": 50,
    "offset": 0
  }
}
```

---

#### 2. 트렌드 분석 수행

YouTube/TikTok/Instagram에서 트렌드 데이터를 수집하고 AI로 분석합니다.

**요청**

```http
POST /api/trends/analyze
Content-Type: application/json
```

**Request Body**

```json
{
  "keyword": "불닭볶음면",
  "platform": "youtube",
  "country": "KR",
  "additionalContext": "챌린지 콘텐츠 중심으로 분석"
}
```

| 필드 | 타입 | 필수 | 설명 |
|-----|------|------|------|
| keyword | string | ✅ | 검색 키워드 (최대 100자) |
| platform | `youtube` \| `tiktok` \| `instagram` | ✅ | 플랫폼 |
| country | `KR` \| `US` \| `JP` | ❌ | 타겟 국가 (기본값: KR) |
| additionalContext | string | ❌ | 추가 분석 컨텍스트 |

**응답 예시**

```json
{
  "success": true,
  "data": {
    "trend": {
      "id": "uuid",
      "keyword": "불닭볶음면",
      "platform": "shorts",
      "country": "KR",
      "viral_score": 85,
      "samyang_relevance": 92,
      // ... 기타 트렌드 필드
    },
    "analysis": {
      "viral_score": 85,
      "samyang_relevance": 92,
      "format_type": "챌린지",
      "brand_fit_reason": "젊은 층의 높은 참여율과 브랜드 노출 효과",
      "recommended_products": ["불닭볶음면", "까르보불닭"],
      "target_audience": "10-20대, SNS 활동적인 사용자",
      "estimated_reach": "100만 이상",
      "key_success_factors": [
        "중독성 있는 음악",
        "간단한 참여 방식",
        "리액션 요소"
      ],
      "risks": [
        "과도한 자극 우려",
        "건강 관련 논란 가능성"
      ]
    },
    "collection": {
      "totalVideos": 15,
      "breakdown": {
        "YouTube": 15
      },
      "topVideos": [
        {
          "title": "불닭볶음면 챌린지!",
          "platform": "YouTube",
          "url": "https://youtube.com/watch?v=...",
          "viewCount": 1500000,
          "creatorName": "크리에이터명"
        }
      ]
    }
  },
  "meta": {
    "duration": "3456ms",
    "timestamp": "2025-01-15T12:34:56Z"
  }
}
```

**에러 응답**

```json
// 429 Too Many Requests
{
  "success": false,
  "error": "Too many requests",
  "message": "Rate limit exceeded. Please try again in 120 seconds.",
  "retryAfter": 1234567890
}

// 404 Not Found
{
  "success": false,
  "error": "No trend data found",
  "message": "No videos found for keyword \"불닭볶음면\" on youtube",
  "hint": "Try a different keyword or check if the YouTube API quota is exceeded."
}
```

---

#### 3. 데일리 트렌드 리포트

오늘 수집된 트렌드 중 상위 5개를 반환합니다. (1시간 캐싱 적용)

**요청**

```http
GET /api/trends/daily
```

**응답 예시**

```json
{
  "success": true,
  "data": {
    "date": "2025-01-15",
    "topTrends": [
      // ... 상위 5개 트렌드
    ],
    "summary": {
      "totalCount": 42,
      "averageViralScore": 78,
      "averageSamyangRelevance": 65,
      "platformDistribution": {
        "shorts": 20,
        "reels": 12,
        "tiktok": 10
      }
    }
  }
}
```

---

### 크리에이터 (Creators)

#### 1. 크리에이터 목록 조회

크리에이터 데이터를 필터링하고 정렬하여 조회합니다.

**요청**

```http
GET /api/creators
```

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 | 기본값 |
|---------|------|------|------|--------|
| username | string | ❌ | 사용자명 필터링 (부분 매칭) | - |
| platform | `tiktok` \| `instagram` \| `youtube` | ❌ | 플랫폼 필터링 | - |
| content_category | string | ❌ | 콘텐츠 카테고리 (부분 매칭) | - |
| minFollowerCount | number | ❌ | 최소 팔로워 수 | - |
| minEngagementRate | number (0-100) | ❌ | 최소 참여율 | - |
| minBrandFitScore | number (0-100) | ❌ | 최소 브랜드 적합도 점수 | - |
| sortBy | `follower_count` \| `engagement_rate` \| `brand_fit_score` \| `last_analyzed_at` \| `created_at` | ❌ | 정렬 기준 | `created_at` |
| sortOrder | `asc` \| `desc` | ❌ | 정렬 순서 | `desc` |
| limit | number (1-100) | ❌ | 페이지당 개수 | 20 |
| offset | number | ❌ | 페이지 오프셋 | 0 |
| showAll | boolean | ❌ | 전체 데이터 조회 여부 | false |

**응답 예시**

```json
{
  "success": true,
  "data": {
    "creators": [
      {
        "id": "uuid",
        "username": "creator_name",
        "platform": "youtube",
        "profile_url": "https://youtube.com/@creator",
        "follower_count": 500000,
        "avg_views": 150000,
        "engagement_rate": 8.5,
        "content_category": "먹방, 챌린지",
        "tone_manner": "밝고 유쾌한",
        "brand_fit_score": 85,
        "collaboration_history": "과거 식품 브랜드 협업 경험 있음",
        "risk_factors": "논란 없음",
        "analysis_data": {
          "quantitative_scores": {...},
          "qualitative_scores": {...},
          "strengths": ["높은 참여율", "타겟 오디언스 일치"],
          "weaknesses": ["콘텐츠 업로드 빈도 낮음"],
          "audience_analysis": {...},
          "content_style_analysis": {...},
          "recommended_products": ["불닭볶음면"]
        },
        "last_analyzed_at": "2025-01-15T10:00:00Z",
        "created_at": "2025-01-15T09:00:00Z",
        "created_by": "user-uuid"
      }
    ],
    "total": 25,
    "filters": {
      "limit": 20,
      "offset": 0
    }
  },
  "meta": {
    "duration": "45ms",
    "timestamp": "2025-01-15T12:34:56Z"
  }
}
```

---

#### 2. 크리에이터 매칭 분석

크리에이터를 분석하고 브랜드 적합도를 평가합니다.

**요청**

```http
POST /api/creators/match
Content-Type: application/json
```

**Request Body**

```json
{
  "username": "creator_name",
  "platform": "youtube",
  "profileUrl": "https://youtube.com/@creator",
  "followerCount": 500000,
  "avgViews": 150000,
  "engagementRate": 8.5,
  "contentCategory": "먹방, 챌린지",
  "toneManner": "밝고 유쾌한",
  "campaignPurpose": "불닭볶음면 신제품 홍보",
  "targetProduct": "buldak",
  "targetCountry": "KR",
  "additionalContext": "Z세대 타겟"
}
```

| 필드 | 타입 | 필수 | 설명 |
|-----|------|------|------|
| username | string | ✅ | 크리에이터 사용자명 (최대 100자) |
| platform | `tiktok` \| `instagram` \| `youtube` | ✅ | 플랫폼 |
| profileUrl | string (URL) | ✅ | 프로필 URL |
| followerCount | number | ❌ | 팔로워 수 |
| avgViews | number | ❌ | 평균 조회수 |
| engagementRate | number (0-100) | ❌ | 참여율 |
| contentCategory | string | ❌ | 콘텐츠 카테고리 (최대 200자) |
| toneManner | string | ❌ | 톤앤매너 (최대 500자) |
| campaignPurpose | string | ❌ | 캠페인 목적 (최대 500자) |
| targetProduct | `buldak` \| `samyang_ramen` \| `jelly` | ❌ | 타겟 제품 |
| targetCountry | `KR` \| `US` \| `JP` | ❌ | 타겟 국가 (기본값: KR) |
| additionalContext | string | ❌ | 추가 컨텍스트 |

**응답 예시**

```json
{
  "success": true,
  "data": {
    "creator": {
      "id": "uuid",
      "username": "creator_name",
      "platform": "youtube",
      "brand_fit_score": 85,
      // ... 기타 크리에이터 필드
    },
    "matching": {
      "total_fit_score": 85,
      "quantitative_scores": {
        "follower_quality": 80,
        "engagement_strength": 90,
        "reach_potential": 85
      },
      "qualitative_scores": {
        "content_alignment": 88,
        "brand_safety": 95,
        "authenticity": 82
      },
      "strengths": [
        "높은 참여율과 충성도 높은 팔로워",
        "타겟 오디언스와 브랜드 타겟 일치",
        "과거 식품 브랜드 협업 성공 경험"
      ],
      "weaknesses": [
        "콘텐츠 업로드 빈도가 낮음",
        "일부 콘텐츠에서 부정적 피드백 존재"
      ],
      "audience_analysis": {
        "demographics": "18-34세, 60% 여성",
        "interests": "먹방, 챌린지, 일상 브이로그",
        "engagement_pattern": "저녁 시간대 높은 활동"
      },
      "content_style_analysis": {
        "format": "15-60초 숏폼",
        "tone": "밝고 유쾌",
        "visual_style": "화려한 편집, 빠른 전개"
      },
      "collaboration_strategy": "제품 챌린지 콘텐츠 제안, 2-3편 시리즈 구성",
      "risk_assessment": "낮음 - 과거 논란 없음, 브랜드 이미지 안전",
      "recommended_products": ["불닭볶음면", "까르보불닭"]
    }
  },
  "meta": {
    "duration": "2345ms",
    "timestamp": "2025-01-15T12:34:56Z"
  }
}
```

---

### 콘텐츠 아이디어 (Content Ideas)

#### 1. 콘텐츠 아이디어 목록 조회

저장된 콘텐츠 아이디어를 필터링하여 조회합니다.

**요청**

```http
GET /api/content
```

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 | 기본값 |
|---------|------|------|------|--------|
| trend_id | string (UUID) | ❌ | 트렌드 ID 필터 | - |
| brand_category | `buldak` \| `samyang_ramen` \| `jelly` | ❌ | 브랜드 카테고리 | - |
| tone | `fun` \| `kawaii` \| `provocative` \| `cool` | ❌ | 톤앤매너 | - |
| target_country | `KR` \| `US` \| `JP` | ❌ | 타겟 국가 | - |
| sortBy | `generated_at` \| `created_at` \| `title` | ❌ | 정렬 기준 | `generated_at` |
| sortOrder | `asc` \| `desc` | ❌ | 정렬 순서 | `desc` |
| limit | number (1-100) | ❌ | 페이지당 개수 | 20 |
| offset | number | ❌ | 페이지 오프셋 | 0 |
| showAll | boolean | ❌ | 전체 데이터 조회 여부 | false |

**응답 예시**

```json
{
  "success": true,
  "data": {
    "ideas": [
      {
        "id": "uuid",
        "trend_id": "uuid",
        "title": "불닭 챌린지 리믹스",
        "brand_category": "buldak",
        "tone": "fun",
        "format_type": "챌린지",
        "platform": "tiktok",
        "hook_text": "이거 진짜 맵다는데...?",
        "hook_visual": "클로즈업 + 제품 강조",
        "scene_structure": {
          "opening": "제품 소개",
          "middle": "챌린지 진행",
          "ending": "리액션 + CTA"
        },
        "editing_format": "빠른 컷, 자막 강조",
        "music_style": "업템포 힙합",
        "props_needed": ["불닭볶음면", "우유", "물티슈"],
        "hashtags": ["#불닭챌린지", "#매운맛", "#삼양"],
        "target_country": "KR",
        "expected_performance": {
          "estimated_views": "50만 이상",
          "engagement_rate": "8-12%",
          "viral_potential": "높음"
        },
        "production_tips": [
          "첫 3초에 강렬한 리액션 배치",
          "자막은 큼직하게"
        ],
        "common_mistakes": [
          "너무 긴 인트로",
          "제품 노출 부족"
        ],
        "generated_at": "2025-01-15T10:00:00Z",
        "created_at": "2025-01-15T10:05:00Z",
        "created_by": "user-uuid"
      }
    ],
    "total": 15,
    "filters": {
      "limit": 20,
      "offset": 0,
      "sortBy": "generated_at",
      "sortOrder": "desc"
    }
  }
}
```

---

#### 2. 콘텐츠 아이디어 생성

AI를 사용하여 3개의 다양한 콘텐츠 아이디어를 생성합니다.

**요청**

```http
POST /api/content/generate
Content-Type: application/json
```

**Request Body**

```json
{
  "brandCategory": "buldak",
  "tone": "fun",
  "targetCountry": "KR",
  "trendId": "uuid",
  "trendKeyword": "불닭챌린지",
  "trendDescription": "매운맛 챌린지 트렌드",
  "preferredPlatform": "tiktok",
  "additionalRequirements": "Z세대 타겟, 유머러스하게"
}
```

| 필드 | 타입 | 필수 | 설명 |
|-----|------|------|------|
| brandCategory | `buldak` \| `samyang_ramen` \| `jelly` | ✅ | 브랜드 카테고리 |
| tone | `fun` \| `kawaii` \| `provocative` \| `cool` | ✅ | 톤앤매너 |
| targetCountry | `KR` \| `US` \| `JP` | ✅ | 타겟 국가 |
| trendId | string (UUID) | ❌ | 참고할 트렌드 ID |
| trendKeyword | string | ❌ | 트렌드 키워드 (최대 100자) |
| trendDescription | string | ❌ | 트렌드 설명 (최대 1000자) |
| preferredPlatform | `tiktok` \| `instagram` \| `youtube` | ❌ | 선호 플랫폼 |
| additionalRequirements | string | ❌ | 추가 요구사항 (최대 1000자) |

**응답 예시**

```json
{
  "success": true,
  "data": {
    "ideas": [
      {
        "id": "uuid-1",
        "title": "불닭 챌린지 리믹스",
        // ... 아이디어 1
      },
      {
        "id": "uuid-2",
        "title": "불닭 먹방 ASMR",
        // ... 아이디어 2
      },
      {
        "id": "uuid-3",
        "title": "불닭 레시피 변주",
        // ... 아이디어 3
      }
    ],
    "generatedCount": 3,
    "successRate": 3
  },
  "message": "Successfully generated 3 content idea(s)"
}
```

---

### 리포트 (Reports)

#### 1. 리포트 생성

트렌드/크리에이터/콘텐츠 아이디어 리포트를 생성합니다.

**요청**

```http
POST /api/reports
Content-Type: application/json
```

**Request Body**

```json
{
  "type": "daily_trend"
}
```

| 필드 | 타입 | 필수 | 설명 |
|-----|------|------|------|
| type | `daily_trend` \| `creator_match` \| `content_idea` | ✅ | 리포트 타입 |

**응답 예시**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "daily_trend",
    "title": "데일리 트렌드 리포트 - 2025-01-15",
    "content": {
      "date": "2025-01-15",
      "summary": {
        "totalTrends": 42,
        "topKeywords": ["불닭챌린지", "먹방", "ASMR"],
        "platformBreakdown": {...}
      },
      "topTrends": [...],
      "insights": [...]
    },
    "metadata": {},
    "created_at": "2025-01-15T12:00:00Z",
    "created_by": "user-uuid"
  }
}
```

---

#### 2. 리포트 목록 조회

저장된 리포트 목록을 조회합니다.

**요청**

```http
GET /api/reports
```

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 | 기본값 |
|---------|------|------|------|--------|
| type | `daily_trend` \| `creator_match` \| `content_idea` | ❌ | 리포트 타입 필터 | - |
| startDate | string (ISO 8601) | ❌ | 시작 날짜 | - |
| endDate | string (ISO 8601) | ❌ | 종료 날짜 | - |
| limit | number (1-100) | ❌ | 페이지당 개수 | 20 |
| offset | number | ❌ | 페이지 오프셋 | 0 |
| showAll | boolean | ❌ | 전체 데이터 조회 여부 | false |

**응답 예시**

```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "uuid",
        "type": "daily_trend",
        "title": "데일리 트렌드 리포트 - 2025-01-15",
        "content": {...},
        "metadata": {},
        "created_at": "2025-01-15T12:00:00Z",
        "created_by": "user-uuid"
      }
    ],
    "total": 10,
    "filters": {
      "limit": 20,
      "offset": 0
    }
  }
}
```

---

#### 3. 리포트 삭제

본인이 생성한 리포트를 삭제합니다.

**요청**

```http
DELETE /api/reports?id=uuid
```

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| id | string (UUID) | ✅ | 삭제할 리포트 ID |

**응답 예시**

```json
{
  "success": true,
  "message": "리포트가 삭제되었습니다."
}
```

**에러 응답**

```json
// 401 Unauthorized
{
  "success": false,
  "error": "Unauthorized",
  "message": "로그인이 필요합니다."
}

// 403 Forbidden
{
  "success": false,
  "error": "Failed to delete report",
  "message": "본인이 작성한 리포트만 삭제할 수 있습니다."
}
```

---

#### 4. 리포트 내보내기

리포트를 JSON 파일로 다운로드합니다.

**요청**

```http
POST /api/reports/export
Content-Type: application/json
```

**Request Body**

```json
{
  "reportId": "uuid",
  "format": "json"
}
```

| 필드 | 타입 | 필수 | 설명 |
|-----|------|------|------|
| reportId | string (UUID) | ✅ | 리포트 ID |
| format | `json` \| `pdf` | ❌ | 내보내기 형식 (기본값: json) |

**응답**

파일 다운로드

```
# JSON 형식
Content-Type: application/json
Content-Disposition: attachment; filename="daily_trend_uuid_2025-01-15.json"

# PDF 형식
Content-Type: application/pdf
Content-Disposition: attachment; filename="daily_trend_uuid_2025-01-15.pdf"
```

**PDF 내보내기 특징**

- 한글 폰트 지원 (NotoSansKR)
- 리포트 타입별 맞춤 레이아웃
- 테이블 형식의 데이터 표시
- 페이지 번호 자동 추가

---

## 에러 코드

| HTTP 코드 | 에러 타입 | 설명 |
|-----------|----------|------|
| 400 | Validation error | 요청 파라미터 검증 실패 |
| 401 | Unauthorized | 인증 필요 |
| 403 | Forbidden | 권한 부족 |
| 404 | Not found | 리소스를 찾을 수 없음 |
| 429 | Too many requests | Rate limit 초과 |
| 500 | Internal server error | 서버 내부 오류 |

---

## 사용 예시

### 1. 트렌드 분석부터 콘텐츠 생성까지 전체 플로우

```typescript
// 1. 트렌드 분석
const trendResponse = await fetch('/api/trends/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    keyword: '불닭볶음면',
    platform: 'youtube',
    country: 'KR',
  }),
});
const { data: trendData } = await trendResponse.json();
const trendId = trendData.trend.id;

// 2. 콘텐츠 아이디어 생성
const contentResponse = await fetch('/api/content/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    brandCategory: 'buldak',
    tone: 'fun',
    targetCountry: 'KR',
    trendId: trendId,
    trendKeyword: '불닭볶음면',
    preferredPlatform: 'tiktok',
  }),
});
const { data: contentData } = await contentResponse.json();

// 3. 생성된 아이디어 조회
const ideasResponse = await fetch(`/api/content?trend_id=${trendId}`);
const { data: ideasData } = await ideasResponse.json();

console.log('생성된 아이디어:', ideasData.ideas);
```

---

### 2. 크리에이터 매칭 및 리포트 생성

```typescript
// 1. 크리에이터 분석
const matchResponse = await fetch('/api/creators/match', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'creator_name',
    platform: 'youtube',
    profileUrl: 'https://youtube.com/@creator',
    followerCount: 500000,
    campaignPurpose: '불닭볶음면 신제품 홍보',
    targetProduct: 'buldak',
  }),
});
const { data: matchData } = await matchResponse.json();

console.log('브랜드 적합도:', matchData.matching.total_fit_score);
console.log('장점:', matchData.matching.strengths);

// 2. 크리에이터 매칭 리포트 생성
const reportResponse = await fetch('/api/reports', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'creator_match',
  }),
});
const { data: reportData } = await reportResponse.json();

// 3. 리포트 다운로드
const exportResponse = await fetch('/api/reports/export', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    reportId: reportData.id,
    format: 'json',
  }),
});
const blob = await exportResponse.blob();
// 파일 다운로드 처리
```

---

### 3. Rate Limit 처리

```typescript
async function analyzeWithRetry(keyword: string, platform: string) {
  try {
    const response = await fetch('/api/trends/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword, platform }),
    });

    if (response.status === 429) {
      // Rate limit 초과
      const retryAfter = response.headers.get('Retry-After');
      const waitTime = parseInt(retryAfter || '60', 10);

      console.log(`Rate limit exceeded. Retrying in ${waitTime} seconds...`);

      await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
      return analyzeWithRetry(keyword, platform); // 재시도
    }

    return await response.json();
  } catch (error) {
    console.error('Analysis failed:', error);
    throw error;
  }
}
```

---

### 4. 사용자별 데이터 필터링

```typescript
// 본인 데이터만 조회 (기본값)
const myTrends = await fetch('/api/trends');
const { data: myData } = await myTrends.json();
console.log('내 트렌드:', myData.trends);

// 전체 데이터 조회
const allTrends = await fetch('/api/trends?showAll=true');
const { data: allData } = await allTrends.json();
console.log('전체 트렌드:', allData.trends);
```

---

## 추가 정보

### API 성능 최적화

1. **캐싱**: 일부 엔드포인트는 Vercel Edge Cache를 사용합니다
   - `/api/trends/daily`: 1시간 캐싱

2. **페이지네이션**: 대량 데이터 조회 시 limit/offset 활용
   ```typescript
   // 100개씩 페이지네이션
   const page1 = await fetch('/api/trends?limit=100&offset=0');
   const page2 = await fetch('/api/trends?limit=100&offset=100');
   ```

3. **필터링**: 필요한 데이터만 조회하여 성능 개선
   ```typescript
   // 고점수 트렌드만 조회
   const highScoreTrends = await fetch(
     '/api/trends?minViralScore=80&minSamyangRelevance=70'
   );
   ```

### 보안 고려사항

1. **인증**: 모든 요청은 Supabase 세션 쿠키로 인증
2. **데이터 격리**: showAll=false 시 사용자별 데이터만 조회
3. **Rate Limiting**: IP 기반 요청 제한으로 남용 방지
4. **입력 검증**: Zod 스키마로 모든 입력 검증

### 비용 관리

- **OpenAI API**: GPT-4o-mini 사용으로 비용 효율화
- **무료 크레딧**: $5 무료 크레딧으로도 충분히 테스트 가능
- **Rate Limiting**: 과도한 API 호출 방지

---

## 문의 및 지원

- **이슈 리포트**: (내용: GitHub Issues URL 또는 이슈 리포트 방법)
- **기술 지원**: (내용: 기술 지원 이메일 또는 연락처)
- **문서 업데이트**: (내용: 문서 최종 업데이트 날짜)

---

**마지막 업데이트**: 2025-01-15
**API 버전**: v1.0

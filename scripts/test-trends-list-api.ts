/**
 * 트렌드 목록 조회 API 테스트 스크립트
 *
 * GET /api/trends 엔드포인트를 테스트합니다.
 *
 * 실행 방법:
 * npx tsx scripts/test-trends-list-api.ts
 */

import axios from 'axios';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// 테스트 결과 타입
interface TestResult {
  success: boolean;
  message: string;
  duration?: number;
}

/**
 * API 테스트 헬퍼 함수
 */
async function testAPI(
  testName: string,
  queryParams: Record<string, string | number> = {}
): Promise<TestResult> {
  try {
    const startTime = Date.now();

    // Query string 생성
    const queryString = new URLSearchParams(
      Object.entries(queryParams).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    const url = `${API_BASE_URL}/api/trends${queryString ? `?${queryString}` : ''}`;

    console.log(`\n📊 테스트: ${testName}`);
    console.log('------------------------------------------------------------');
    console.log(`URL: ${url}`);

    const response = await axios.get(url);
    const duration = Date.now() - startTime;

    console.log(`✅ 성공! (${duration}ms)`);
    console.log(`응답 상태: ${response.status}`);
    console.log(`찾은 트렌드: ${response.data.data?.trends?.length || 0}개`);
    console.log(`전체 개수: ${response.data.data?.total || 0}`);

    if (response.data.data?.trends?.length > 0) {
      console.log('\n상위 3개 트렌드:');
      response.data.data.trends.slice(0, 3).forEach((trend: any, idx: number) => {
        console.log(
          `  ${idx + 1}. [${trend.platform}] ${trend.keyword} (바이럴: ${trend.viral_score || 'N/A'}, 삼양: ${trend.samyang_relevance || 'N/A'})`
        );
      });
    }

    return {
      success: true,
      message: `Found ${response.data.data?.trends?.length || 0} trends`,
      duration,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(`❌ 에러 발생 (${error.response?.status || 'unknown'})`);
      console.log(`에러 메시지: ${error.response?.data?.error || error.message}`);

      if (error.response?.data?.details) {
        console.log('상세 정보:');
        error.response.data.details.forEach((detail: any) => {
          console.log(`  - ${detail.field}: ${detail.message}`);
        });
      }

      return {
        success: false,
        message: error.response?.data?.error || error.message,
      };
    }

    throw error;
  }
}

/**
 * 메인 테스트 실행
 */
async function runTests() {
  console.log('🧪 트렌드 목록 조회 API 테스트 시작\n');
  console.log('============================================================');

  const results: TestResult[] = [];

  // 테스트 1: 기본 조회 (파라미터 없음)
  results.push(
    await testAPI('기본 조회 (최근 50개)')
  );

  // 테스트 2: 키워드 필터링
  results.push(
    await testAPI('키워드 필터링 ("삼양")', {
      keyword: '삼양',
    })
  );

  // 테스트 3: 플랫폼 필터링
  results.push(
    await testAPI('플랫폼 필터링 (YouTube Shorts)', {
      platform: 'shorts',
    })
  );

  // 테스트 4: 정렬 (바이럴 점수 높은 순)
  results.push(
    await testAPI('바이럴 점수 높은 순 정렬', {
      sortBy: 'viral_score',
      sortOrder: 'desc',
      limit: 10,
    })
  );

  // 테스트 5: 정렬 (삼양 연관성 높은 순)
  results.push(
    await testAPI('삼양 연관성 높은 순 정렬', {
      sortBy: 'samyang_relevance',
      sortOrder: 'desc',
      limit: 10,
    })
  );

  // 테스트 6: 최소 점수 필터
  results.push(
    await testAPI('고품질 트렌드 (바이럴 80+ & 삼양 80+)', {
      minViralScore: 80,
      minSamyangRelevance: 80,
    })
  );

  // 테스트 7: 페이지네이션
  results.push(
    await testAPI('페이지네이션 (2페이지, 5개씩)', {
      limit: 5,
      offset: 5,
    })
  );

  // 테스트 8: 복합 필터링
  results.push(
    await testAPI('복합 필터 (KR + Shorts + 바이럴 70+)', {
      country: 'KR',
      platform: 'shorts',
      minViralScore: 70,
      sortBy: 'collected_at',
      sortOrder: 'desc',
    })
  );

  // 테스트 9: 유효성 검사 실패 (잘못된 limit)
  results.push(
    await testAPI('유효성 검사 실패 (limit > 100)', {
      limit: 200,
    })
  );

  // 테스트 10: 유효성 검사 실패 (잘못된 platform)
  results.push(
    await testAPI('유효성 검사 실패 (잘못된 platform)', {
      platform: 'facebook',
    })
  );

  // 테스트 결과 요약
  console.log('\n============================================================');
  console.log('✅ 모든 테스트 완료!\n');

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;

  console.log(`총 테스트: ${results.length}개`);
  console.log(`성공: ${successCount}개`);
  console.log(`실패: ${failCount}개`);

  console.log('\n💡 다음 단계:');
  console.log('  1. 프론트엔드에서 GET /api/trends 호출');
  console.log('  2. 필터링 및 정렬 옵션 UI 구현');
  console.log('  3. 페이지네이션 UI 구현');
}

// 테스트 실행
runTests().catch(console.error);

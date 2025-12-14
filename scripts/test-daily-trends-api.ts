/**
 * 일일 트렌드 리포트 API 테스트 스크립트
 *
 * GET /api/trends/daily 엔드포인트를 테스트합니다.
 *
 * 실행 방법:
 * npx tsx scripts/test-daily-trends-api.ts
 */

import axios from 'axios';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * API 테스트 함수
 */
async function testDailyTrendsAPI() {
  console.log('🧪 일일 트렌드 리포트 API 테스트 시작\n');
  console.log('============================================================');

  try {
    console.log('📊 테스트: 일일 트렌드 리포트 조회');
    console.log('------------------------------------------------------------');
    console.log(`URL: ${API_BASE_URL}/api/trends/daily`);

    const startTime = Date.now();
    const response = await axios.get(`${API_BASE_URL}/api/trends/daily`);
    const duration = Date.now() - startTime;

    console.log(`\n✅ 성공! (${duration}ms)`);
    console.log(`응답 상태: ${response.status}`);

    const { data } = response.data;

    console.log(`\n📅 날짜: ${data.date}`);
    console.log(`\n📈 요약 통계:`);
    console.log(`  - 총 트렌드: ${data.summary.totalCount}개`);
    console.log(`  - 평균 바이럴 점수: ${data.summary.averageViralScore}`);
    console.log(`  - 평균 삼양 연관성: ${data.summary.averageSamyangRelevance}`);

    if (Object.keys(data.summary.platformDistribution).length > 0) {
      console.log(`\n  플랫폼별 분포:`);
      Object.entries(data.summary.platformDistribution).forEach(([platform, count]) => {
        console.log(`    - ${platform}: ${count}개`);
      });
    }

    if (data.topTrends.length > 0) {
      console.log(`\n🏆 Top ${data.topTrends.length} 트렌드:\n`);
      data.topTrends.forEach((trend: any, idx: number) => {
        const totalScore = (trend.viral_score || 0) + (trend.samyang_relevance || 0);
        console.log(`  ${idx + 1}. [${trend.platform.toUpperCase()}] ${trend.keyword}`);
        console.log(`     바이럴: ${trend.viral_score || 'N/A'} | 삼양: ${trend.samyang_relevance || 'N/A'} | 합계: ${totalScore}`);
        if (trend.format_type) {
          console.log(`     포맷: ${trend.format_type}`);
        }
        console.log('');
      });
    } else {
      console.log('\n⚠️  오늘 수집된 트렌드가 없습니다.');
      console.log('   트렌드 분석 API를 먼저 호출하여 데이터를 생성하세요:');
      console.log('   npx tsx scripts/test-trend-analyze-api.ts');
    }

    // Cache-Control 헤더 확인
    if (response.headers['cache-control']) {
      console.log(`\n💾 캐싱 정보:`);
      console.log(`  Cache-Control: ${response.headers['cache-control']}`);
    }

    console.log('\n============================================================');
    console.log('✅ 테스트 완료!\n');

    console.log('💡 다음 단계:');
    console.log('  1. 프론트엔드에서 GET /api/trends/daily 호출');
    console.log('  2. 대시보드에 일일 트렌드 요약 표시');
    console.log('  3. Top 5 트렌드를 카드 형태로 표시');
    console.log('  4. 1시간마다 자동 갱신 (캐싱)');

    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(`\n❌ 에러 발생 (${error.response?.status || 'unknown'})`);
      console.log(`에러 메시지: ${error.response?.data?.error || error.message}`);

      if (error.response?.data?.message) {
        console.log(`상세 메시지: ${error.response.data.message}`);
      }

      console.log('\n============================================================');
      console.log('❌ 테스트 실패\n');
      return false;
    }

    throw error;
  }
}

// 테스트 실행
testDailyTrendsAPI().catch(console.error);

/**
 * 트렌드 분석 API 테스트 스크립트
 *
 * 사용 방법:
 * npm run dev (별도 터미널에서 실행)
 * npx tsx scripts/test-trend-analyze-api.ts
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const ANALYZE_ENDPOINT = `${API_BASE_URL}/api/trends/analyze`;

interface TrendAnalyzeRequest {
  keyword: string;
  platform: 'youtube' | 'tiktok' | 'instagram';
  country?: 'KR' | 'US' | 'JP';
  additionalContext?: string;
}

async function testTrendAnalyzeAPI() {
  console.log('🧪 트렌드 분석 API 테스트 시작\n');
  console.log('='.repeat(60));

  try {
    // 테스트 1: 정상적인 요청 (YouTube)
    console.log('\n📊 테스트 1: 정상적인 트렌드 분석 요청 (YouTube)');
    console.log('-'.repeat(60));

    const request1: TrendAnalyzeRequest = {
      keyword: '삼양라면',
      platform: 'youtube',
      country: 'KR',
    };

    console.log('요청 데이터:', JSON.stringify(request1, null, 2));
    console.log('\n요청 중...');

    const startTime1 = Date.now();
    const response1 = await axios.post(ANALYZE_ENDPOINT, request1);
    const duration1 = Date.now() - startTime1;

    console.log(`\n✅ 성공! (${duration1}ms)`);
    console.log('\nRate Limit 헤더:');
    console.log(`  X-RateLimit-Limit: ${response1.headers['x-ratelimit-limit']}`);
    console.log(`  X-RateLimit-Remaining: ${response1.headers['x-ratelimit-remaining']}`);
    console.log(`  X-RateLimit-Reset: ${response1.headers['x-ratelimit-reset']}`);

    const data1 = response1.data;
    console.log('\n트렌드 분석 결과:');
    console.log(`  ID: ${data1.data.trend.id}`);
    console.log(`  Keyword: ${data1.data.trend.keyword}`);
    console.log(`  Platform: ${data1.data.trend.platform}`);
    console.log(`  Viral Score: ${data1.data.analysis.viral_score}/100`);
    console.log(`  Samyang Relevance: ${data1.data.analysis.samyang_relevance}/100`);
    console.log(`  Format Type: ${data1.data.analysis.format_type}`);
    console.log(`  Target Audience: ${data1.data.analysis.target_audience}`);

    console.log('\n수집된 비디오:');
    console.log(`  Total: ${data1.data.collection.totalVideos}개`);
    console.log(`  Breakdown:`, data1.data.collection.breakdown);

    if (data1.data.collection.topVideos && data1.data.collection.topVideos.length > 0) {
      console.log('\nTop 3 비디오:');
      data1.data.collection.topVideos.forEach((video: any, index: number) => {
        console.log(`  ${index + 1}. ${video.title}`);
        console.log(`     조회수: ${video.viewCount?.toLocaleString() || 'N/A'}`);
        console.log(`     크리에이터: ${video.creatorName || 'N/A'}`);
      });
    }

    // 테스트 2: 유효성 검사 실패 (빈 키워드)
    console.log('\n\n📊 테스트 2: 유효성 검사 실패 (빈 키워드)');
    console.log('-'.repeat(60));

    try {
      const request2 = {
        keyword: '',
        platform: 'youtube',
      };

      console.log('요청 데이터:', JSON.stringify(request2, null, 2));
      await axios.post(ANALYZE_ENDPOINT, request2);
      console.log('❌ 예상치 못한 성공');
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        console.log('✅ 예상대로 400 에러 발생');
        console.log('에러 메시지:', error.response.data.error);
      } else {
        throw error;
      }
    }

    // 테스트 3: 잘못된 플랫폼
    console.log('\n\n📊 테스트 3: 유효성 검사 실패 (잘못된 플랫폼)');
    console.log('-'.repeat(60));

    try {
      const request3 = {
        keyword: '삼양',
        platform: 'facebook', // 지원하지 않는 플랫폼
      };

      console.log('요청 데이터:', JSON.stringify(request3, null, 2));
      await axios.post(ANALYZE_ENDPOINT, request3);
      console.log('❌ 예상치 못한 성공');
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        console.log('✅ 예상대로 400 에러 발생');
        console.log('에러 메시지:', error.response.data.error);
      } else {
        throw error;
      }
    }

    // 테스트 4: Rate Limiting 테스트 (주석 처리 - 실제로 제한에 걸리므로)
    /*
    console.log('\n\n📊 테스트 4: Rate Limiting 테스트');
    console.log('-'.repeat(60));
    console.log('5분에 10회 제한 테스트 (11번째 요청 시 429 에러 예상)');

    for (let i = 1; i <= 12; i++) {
      try {
        console.log(`\n요청 ${i}/12...`);
        const response = await axios.post(ANALYZE_ENDPOINT, request1);
        console.log(`✅ 성공 - Remaining: ${response.headers['x-ratelimit-remaining']}`);
      } catch (error: any) {
        if (error.response && error.response.status === 429) {
          console.log(`❌ Rate limit 초과! (요청 ${i})`);
          console.log('Retry-After:', error.response.headers['retry-after'], 'seconds');
          break;
        } else {
          throw error;
        }
      }

      // 요청 간 짧은 딜레이
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    */

    console.log('\n' + '='.repeat(60));
    console.log('✅ 모든 테스트 완료!');
    console.log('\n💡 다음 단계:');
    console.log('  1. 프론트엔드에서 POST /api/trends/analyze 호출');
    console.log('  2. 결과 데이터를 UI에 표시');
    console.log('  3. Rate Limit 헤더를 확인하여 사용자에게 안내\n');
  } catch (error: any) {
    console.error('\n❌ 테스트 실패:', error.message);

    if (error.response) {
      console.error('\n응답 상태:', error.response.status);
      console.error('응답 데이터:', JSON.stringify(error.response.data, null, 2));
    }

    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 해결 방법:');
      console.log('  1. 개발 서버가 실행 중인지 확인하세요: npm run dev');
      console.log('  2. API URL이 올바른지 확인하세요:', API_BASE_URL);
    }

    process.exit(1);
  }
}

// 실행
testTrendAnalyzeAPI();

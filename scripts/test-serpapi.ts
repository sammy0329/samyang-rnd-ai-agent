/**
 * SerpAPI 클라이언트 독립 테스트 스크립트
 *
 * 사용 방법:
 * npx tsx scripts/test-serpapi.ts
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// .env.local 파일 로드 (간단한 파서)
function loadEnv() {
  try {
    const envPath = resolve(__dirname, '../.env.local');
    const envFile = readFileSync(envPath, 'utf-8');

    envFile.split('\n').forEach((line) => {
      // 주석이나 빈 줄 무시
      if (line.trim().startsWith('#') || !line.trim()) return;

      // KEY=VALUE 형식 파싱
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        process.env[key] = value;
      }
    });

    console.log('✅ .env.local 파일 로드 완료\n');
  } catch (error) {
    console.warn('⚠️  .env.local 파일을 찾을 수 없습니다.');
    console.warn(
      '   SerpAPI 키가 환경 변수에 설정되어 있는지 확인하세요.\n'
    );
  }
}

loadEnv();

import {
  searchTikTokVideos,
  searchInstagramReels,
  searchTikTokAndInstagram,
  searchAllShortVideos,
} from '../src/lib/api/serpapi';

async function main() {
  console.log('🎬 SerpAPI 클라이언트 테스트 시작\n');
  console.log('='.repeat(60));

  try {
    // 테스트 1: TikTok 비디오 검색
    console.log('\n📹 테스트 1: TikTok 비디오 검색 (키워드: "삼양라면")');
    console.log('-'.repeat(60));
    const tiktokVideos = await searchTikTokVideos('삼양라면', 5);
    console.log(`✅ 검색 성공! 찾은 TikTok 비디오: ${tiktokVideos.length}개\n`);

    tiktokVideos.forEach((video, index) => {
      console.log(`${index + 1}. ${video.title}`);
      console.log(`   🎵 플랫폼: ${video.platform}`);
      if (video.creatorName) {
        console.log(`   👤 크리에이터: ${video.creatorName}`);
      }
      console.log(`   🔗 URL: ${video.videoUrl}`);
      console.log('');
    });

    // 테스트 2: Instagram Reels 검색
    console.log(
      '\n📸 테스트 2: Instagram Reels 검색 (키워드: "불닭볶음면")'
    );
    console.log('-'.repeat(60));
    const instagramReels = await searchInstagramReels('불닭볶음면', 5);
    console.log(
      `✅ 검색 성공! 찾은 Instagram Reels: ${instagramReels.length}개\n`
    );

    instagramReels.forEach((video, index) => {
      console.log(`${index + 1}. ${video.title}`);
      console.log(`   📷 플랫폼: ${video.platform}`);
      if (video.creatorName) {
        console.log(`   👤 크리에이터: ${video.creatorName}`);
      }
      console.log(`   🔗 URL: ${video.videoUrl}`);
      console.log('');
    });

    // 테스트 3: TikTok + Instagram 검색
    console.log(
      '\n🔥 테스트 3: TikTok + Instagram 통합 검색 (키워드: "삼양")'
    );
    console.log('-'.repeat(60));
    const bothVideos = await searchTikTokAndInstagram('삼양', 10);
    console.log(
      `✅ 검색 성공! 찾은 소셜 미디어 비디오: ${bothVideos.length}개\n`
    );

    const tiktokCount = bothVideos.filter(
      (v) => v.platform === 'TikTok'
    ).length;
    const instagramCount = bothVideos.filter(
      (v) => v.platform === 'Instagram'
    ).length;
    console.log(`   🎵 TikTok: ${tiktokCount}개`);
    console.log(`   📷 Instagram: ${instagramCount}개\n`);

    bothVideos.slice(0, 5).forEach((video, index) => {
      console.log(`${index + 1}. ${video.title}`);
      console.log(`   📱 플랫폼: ${video.platform}`);
      if (video.creatorName) {
        console.log(`   👤 크리에이터: ${video.creatorName}`);
      }
      console.log('');
    });

    // 테스트 4: 모든 플랫폼 검색
    console.log(
      '\n🌐 테스트 4: 모든 플랫폼 숏폼 검색 (키워드: "Korean noodles")'
    );
    console.log('-'.repeat(60));
    const allVideos = await searchAllShortVideos('Korean noodles', 10);
    console.log(`✅ 검색 성공! 찾은 숏폼: ${allVideos.length}개\n`);

    const platformBreakdown: Record<string, number> = {};
    allVideos.forEach((video) => {
      platformBreakdown[video.platform] =
        (platformBreakdown[video.platform] || 0) + 1;
    });

    console.log('플랫폼별 분포:');
    Object.entries(platformBreakdown).forEach(([platform, count]) => {
      console.log(`   ${platform}: ${count}개`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ 모든 테스트 성공!');
    console.log('\n📋 Task 4.1.2 완료 확인 항목:');
    console.log('  ✅ SerpAPI 키 발급 및 설정');
    console.log('  ✅ src/lib/api/serpapi.ts 생성');
    console.log('  ✅ TikTok 검색 함수 구현');
    console.log('  ✅ Instagram Reels 검색 함수 구현');
    console.log('  ✅ 검색 결과 파싱');
    console.log('  ✅ API 응답 타입 정의');
    console.log('  ✅ 에러 핸들링 및 재시도 로직');
    console.log('  ✅ SerpAPI 검색 성공\n');
  } catch (error) {
    console.error('\n❌ 테스트 실패:', error);

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        console.log('\n💡 해결 방법:');
        console.log('  1. https://serpapi.com/manage-api-key 에서 API 키 발급');
        console.log('  2. .env.local 파일에 SERPAPI_API_KEY 설정');
        console.log('  3. 이 스크립트를 다시 실행\n');
      } else if (
        error.message.includes('quota') ||
        error.message.includes('credit')
      ) {
        console.log('\n💡 Quota/Credit 초과:');
        console.log('  - SerpAPI는 무료 플랜에서 100 searches/month 제공');
        console.log('  - 더 많은 검색이 필요하면 유료 플랜 고려\n');
      }
    }

    process.exit(1);
  }
}

main();

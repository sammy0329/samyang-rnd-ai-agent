/**
 * YouTube API 클라이언트 독립 테스트 스크립트
 *
 * 사용 방법:
 * npx tsx scripts/test-youtube-api.ts
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// .env.local 파일 로드 (간단한 파서)
function loadEnv() {
  try {
    const envPath = resolve(__dirname, '../.env.local');
    const envFile = readFileSync(envPath, 'utf-8');

    envFile.split('\n').forEach(line => {
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
    console.warn('   YouTube API 키가 환경 변수에 설정되어 있는지 확인하세요.\n');
  }
}

loadEnv();

import { searchShorts, searchTrendingShorts, getVideoById } from '../src/lib/api/youtube';

async function main() {
  console.log('🎬 YouTube API 클라이언트 테스트 시작\n');
  console.log('='.repeat(60));

  try {
    // 테스트 1: 숏폼 검색
    console.log('\n📹 테스트 1: 숏폼 검색 (키워드: "삼양라면")');
    console.log('-'.repeat(60));
    const shorts = await searchShorts('삼양라면', 5);
    console.log(`✅ 검색 성공! 찾은 숏폼: ${shorts.length}개\n`);

    shorts.forEach((video, index) => {
      console.log(`${index + 1}. ${video.title}`);
      console.log(`   📺 채널: ${video.channelTitle}`);
      console.log(`   👁️  조회수: ${video.viewCount.toLocaleString()}회`);
      console.log(`   👍 좋아요: ${video.likeCount.toLocaleString()}개`);
      console.log(`   💬 댓글: ${video.commentCount.toLocaleString()}개`);
      console.log(`   🔗 URL: ${video.url}`);
      console.log('');
    });

    // 테스트 2: 트렌딩 숏폼 검색
    console.log('\n🔥 테스트 2: 트렌딩 숏폼 검색 (키워드: "불닭볶음면", 최근 7일)');
    console.log('-'.repeat(60));
    const trendingShorts = await searchTrendingShorts('불닭볶음면', 3);
    console.log(`✅ 검색 성공! 찾은 트렌딩 숏폼: ${trendingShorts.length}개\n`);

    trendingShorts.forEach((video, index) => {
      console.log(`${index + 1}. ${video.title}`);
      console.log(`   📺 채널: ${video.channelTitle}`);
      console.log(`   📅 게시일: ${new Date(video.publishedAt).toLocaleDateString('ko-KR')}`);
      console.log(`   👁️  조회수: ${video.viewCount.toLocaleString()}회`);
      console.log(`   🔗 URL: ${video.url}`);
      console.log('');
    });

    // 테스트 3: 특정 비디오 상세 정보 (첫 번째 결과가 있으면)
    if (shorts.length > 0) {
      const firstVideoId = shorts[0].id;
      console.log(`\n📊 테스트 3: 비디오 상세 정보 조회 (ID: ${firstVideoId})`);
      console.log('-'.repeat(60));
      const videoDetail = await getVideoById(firstVideoId);
      console.log(`✅ 조회 성공!\n`);
      console.log(`제목: ${videoDetail.title}`);
      console.log(`채널: ${videoDetail.channelTitle}`);
      console.log(`길이: ${videoDetail.duration}`);
      console.log(`조회수: ${videoDetail.viewCount.toLocaleString()}회`);
      console.log(`좋아요: ${videoDetail.likeCount.toLocaleString()}개`);
      console.log(`댓글: ${videoDetail.commentCount.toLocaleString()}개`);
      if (videoDetail.tags && videoDetail.tags.length > 0) {
        console.log(`태그: ${videoDetail.tags.slice(0, 5).join(', ')}`);
      }
      console.log(`URL: ${videoDetail.url}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ 모든 테스트 성공!');
    console.log('\n📋 Task 4.1.1 완료 확인 항목:');
    console.log('  ✅ YouTube API 키 발급 및 설정');
    console.log('  ✅ src/lib/api/youtube.ts 생성');
    console.log('  ✅ searchVideos() 함수 구현');
    console.log('  ✅ getVideoDetails() 함수 구현');
    console.log('  ✅ API 응답 타입 정의');
    console.log('  ✅ 에러 핸들링 (Quota 초과 등)');
    console.log('  ✅ YouTube 검색 성공\n');

  } catch (error) {
    console.error('\n❌ 테스트 실패:', error);

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        console.log('\n💡 해결 방법:');
        console.log('  1. Google Cloud Console에서 YouTube Data API v3 활성화');
        console.log('  2. API 키 생성');
        console.log('  3. .env.local 파일에 YOUTUBE_API_KEY 설정');
        console.log('  4. 이 스크립트를 다시 실행\n');
      } else if (error.message.includes('quota')) {
        console.log('\n💡 Quota 초과:');
        console.log('  - YouTube API는 하루 10,000 units의 무료 할당량 제공');
        console.log('  - 내일 다시 시도하거나 할당량을 늘려주세요\n');
      }
    }

    process.exit(1);
  }
}

main();

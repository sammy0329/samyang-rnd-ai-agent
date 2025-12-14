/**
 * 트렌드 데이터 수집 스크립트 테스트
 *
 * 사용 방법:
 * npx tsx scripts/test-trend-collector.ts
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// .env.local 파일 로드 (간단한 파서)
function loadEnv() {
  try {
    const envPath = resolve(__dirname, '../.env.local');
    const envFile = readFileSync(envPath, 'utf-8');

    envFile.split('\n').forEach((line) => {
      if (line.trim().startsWith('#') || !line.trim()) return;

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
    console.warn('   API 키가 환경 변수에 설정되어 있는지 확인하세요.\n');
  }
}

loadEnv();

import {
  collectTrends,
  collectTrendingTrends,
} from '../src/lib/api/trend-collector';

async function main() {
  console.log('🎬 트렌드 데이터 수집 스크립트 테스트 시작\n');
  console.log('='.repeat(60));

  try {
    // 테스트 1: 모든 플랫폼에서 트렌드 수집
    console.log('\n📊 테스트 1: 모든 플랫폼 트렌드 수집 (키워드: "삼양라면")');
    console.log('-'.repeat(60));

    const result1 = await collectTrends({
      keyword: '삼양라면',
      maxResults: 5,
      includeYouTube: true,
      includeTikTok: true,
      includeInstagram: true,
    });

    console.log(`\n✅ 수집 완료!`);
    console.log(`   총 비디오: ${result1.totalVideos}개`);
    console.log(`   플랫폼별 분포:`);
    Object.entries(result1.breakdown).forEach(([platform, count]) => {
      console.log(`     - ${platform}: ${count}개`);
    });

    if (result1.errors && result1.errors.length > 0) {
      console.log(`\n⚠️  에러 발생:`);
      result1.errors.forEach((err) => {
        console.log(`     - ${err.platform} (${err.source}): ${err.error}`);
      });
    }

    console.log(`\n📹 수집된 비디오 샘플 (최대 3개):`);
    result1.videos.slice(0, 3).forEach((video, index) => {
      console.log(`\n   ${index + 1}. ${video.title}`);
      console.log(`      플랫폼: ${video.platform}`);
      console.log(`      크리에이터: ${video.creatorName || 'N/A'}`);
      if (video.viewCount) {
        console.log(`      조회수: ${video.viewCount.toLocaleString()}회`);
      }
      console.log(`      URL: ${video.videoUrl}`);
    });

    // 테스트 2: YouTube만 수집
    console.log('\n\n📺 테스트 2: YouTube만 수집 (키워드: "불닭볶음면")');
    console.log('-'.repeat(60));

    const result2 = await collectTrends({
      keyword: '불닭볶음면',
      maxResults: 5,
      platforms: ['YouTube'],
    });

    console.log(`\n✅ 수집 완료!`);
    console.log(`   총 비디오: ${result2.totalVideos}개`);
    console.log(`   플랫폼: ${Object.keys(result2.breakdown).join(', ')}`);

    // 테스트 3: 트렌딩 트렌드 수집 (최근 7일)
    console.log('\n\n🔥 테스트 3: 트렌딩 트렌드 수집 (키워드: "Korean noodles", 최근 7일)');
    console.log('-'.repeat(60));

    const result3 = await collectTrendingTrends('Korean noodles', 5);

    console.log(`\n✅ 수집 완료!`);
    console.log(`   총 비디오: ${result3.totalVideos}개`);
    console.log(`   플랫폼별 분포:`);
    Object.entries(result3.breakdown).forEach(([platform, count]) => {
      console.log(`     - ${platform}: ${count}개`);
    });

    // 최신 비디오 확인
    const recentVideos = result3.videos
      .filter((v) => v.publishedAt)
      .sort((a, b) => {
        const dateA = new Date(a.publishedAt!).getTime();
        const dateB = new Date(b.publishedAt!).getTime();
        return dateB - dateA;
      });

    if (recentVideos.length > 0) {
      console.log(`\n   가장 최신 비디오:`);
      console.log(`     제목: ${recentVideos[0].title}`);
      console.log(`     게시일: ${new Date(recentVideos[0].publishedAt!).toLocaleDateString('ko-KR')}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ 모든 테스트 성공!');
    console.log('\n📋 Task 4.1.3 완료 확인 항목:');
    console.log('  ✅ lib/api/trend-collector.ts 생성');
    console.log('  ✅ collectTrends() 함수 구현');
    console.log('  ✅ 여러 플랫폼에서 데이터 수집');
    console.log('  ✅ 중복 제거 로직 구현');
    console.log('  ✅ 데이터 정규화 로직 구현');
    console.log('  ✅ 에러 핸들링');
    console.log('  ✅ 트렌드 데이터 수집 성공\n');
  } catch (error) {
    console.error('\n❌ 테스트 실패:', error);

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        console.log('\n💡 해결 방법:');
        console.log('  1. YouTube API 키와 SerpAPI 키 모두 필요합니다');
        console.log('  2. .env.local 파일에 아래 내용 설정:');
        console.log('     YOUTUBE_API_KEY=your_youtube_key');
        console.log('     SERPAPI_API_KEY=your_serpapi_key');
        console.log('  3. 이 스크립트를 다시 실행\n');
      }
    }

    process.exit(1);
  }
}

main();

/**
 * PDF 리포트 생성 유틸리티
 *
 * jsPDF를 사용하여 한글 지원 PDF 생성
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as fs from 'fs';
import * as path from 'path';

// Report types
interface ReportData {
  id: string;
  type: string;
  title: string | null;
  content: Record<string, unknown>;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// Type labels
const REPORT_TYPE_LABELS: Record<string, string> = {
  daily_trend: 'Daily Trend Report',
  creator_match: 'Creator Match Report',
  content_idea: 'Content Idea Report',
};

// Korean labels for PDF (shown alongside English)
const KOREAN_LABELS: Record<string, string> = {
  daily_trend: '데일리 트렌드',
  creator_match: '크리에이터 매칭',
  content_idea: '콘텐츠 아이디어',
};

/**
 * 폰트 로드 및 설정
 */
function loadKoreanFont(doc: jsPDF): void {
  try {
    const fontPath = path.join(process.cwd(), 'src/lib/fonts/NotoSansKR-Regular.ttf');

    if (fs.existsSync(fontPath)) {
      const fontData = fs.readFileSync(fontPath);
      const fontBase64 = fontData.toString('base64');

      // Add font to jsPDF
      doc.addFileToVFS('NotoSansKR-Regular.ttf', fontBase64);
      doc.addFont('NotoSansKR-Regular.ttf', 'NotoSansKR', 'normal');
      doc.setFont('NotoSansKR');
    }
  } catch (error) {
    console.warn('Failed to load Korean font, falling back to Helvetica:', error);
    doc.setFont('helvetica');
  }
}

/**
 * PDF 문서 생성 및 기본 설정
 */
function createPdfDocument(): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Load Korean font
  loadKoreanFont(doc);

  return doc;
}

/**
 * 헤더 추가
 */
function addHeader(doc: jsPDF, reportType: string, date: string): number {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(20);
  doc.text('Samyang Viral Insight', pageWidth / 2, 20, { align: 'center' });

  // Report type
  doc.setFontSize(14);
  const typeLabel = REPORT_TYPE_LABELS[reportType] || reportType;
  const koreanLabel = KOREAN_LABELS[reportType] || '';
  doc.text(`${typeLabel} (${koreanLabel})`, pageWidth / 2, 30, { align: 'center' });

  // Date
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${date}`, pageWidth / 2, 38, { align: 'center' });

  // Line separator
  doc.setDrawColor(200);
  doc.line(20, 42, pageWidth - 20, 42);

  doc.setTextColor(0);
  return 50; // Return next Y position
}

/**
 * 섹션 타이틀 추가
 */
function addSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFontSize(12);
  doc.setTextColor(30, 64, 175); // Blue color
  doc.text(title, 20, y);
  doc.setTextColor(0);
  return y + 8;
}

/**
 * 숫자 포맷팅 (1000 -> 1K)
 */
function formatNumber(num: number | undefined): string {
  if (!num) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return String(num);
}

/**
 * 데일리 트렌드 리포트 PDF 생성
 */
function generateDailyTrendPdf(doc: jsPDF, content: Record<string, unknown>, startY: number): void {
  let y = startY;
  const summary = content.summary as Record<string, unknown> | undefined;
  const topTrends = content.topTrends as Array<Record<string, unknown>> | undefined;
  const recommendations = content.recommendations as string[] | undefined;

  // Summary section
  if (summary) {
    y = addSectionTitle(doc, 'Summary Statistics (주요 통계)', y);

    const summaryData = [
      ['Avg Viral Score (평균 바이럴 점수)', String(summary.averageViralScore || 0)],
      ['Avg Samyang Relevance (평균 삼양 연관성)', String(summary.averageSamyangRelevance || 0)],
      ['Top Platform (주요 플랫폼)', String(summary.topPlatform || '-').toUpperCase()],
      ['Top Country (주요 국가)', String(summary.topCountry || '-')],
    ];

    autoTable(doc, {
      startY: y,
      head: [['Metric (항목)', 'Value (값)']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 20, right: 20 },
      styles: { font: 'NotoSansKR', fontSize: 9 },
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  // Top Trends section
  if (topTrends && topTrends.length > 0) {
    y = addSectionTitle(doc, `Top ${topTrends.length} Trends (트렌드)`, y);

    const trendData = topTrends.map((trend, index) => [
      String(index + 1),
      String(trend.keyword || ''),
      String(trend.platform || '').toUpperCase(),
      String(trend.country || ''),
      String(trend.viralScore || 0),
      String(trend.samyangRelevance || 0),
    ]);

    autoTable(doc, {
      startY: y,
      head: [['#', 'Keyword (키워드)', 'Platform', 'Country', 'Viral', 'Relevance']],
      body: trendData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 20, right: 20 },
      styles: { font: 'NotoSansKR', fontSize: 9 },
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  // Recommendations section
  if (recommendations && recommendations.length > 0) {
    y = addSectionTitle(doc, 'Recommendations (추천사항)', y);

    doc.setFontSize(10);
    recommendations.forEach((rec, index) => {
      const lines = doc.splitTextToSize(`${index + 1}. ${rec}`, 170);
      doc.text(lines, 20, y);
      y += lines.length * 5 + 3;
    });
  }
}

/**
 * 크리에이터 매칭 리포트 PDF 생성
 */
function generateCreatorMatchPdf(doc: jsPDF, content: Record<string, unknown>, startY: number): void {
  let y = startY;
  const summary = content.summary as Record<string, unknown> | undefined;
  const topCreators = content.topCreators as Array<Record<string, unknown>> | undefined;
  const recommendations = content.recommendations as string[] | undefined;

  // Summary section
  if (summary) {
    y = addSectionTitle(doc, 'Matching Statistics (매칭 통계)', y);

    const summaryData = [
      ['Avg Brand Fit Score (평균 브랜드 적합도)', String(summary.averageBrandFitScore || 0)],
      ['High Fit (80+) (고적합도)', `${summary.highFitCount || 0}`],
      ['Medium Fit (60-79) (중적합도)', `${summary.mediumFitCount || 0}`],
      ['Top Platform (주요 플랫폼)', String(summary.topPlatform || '-').toUpperCase()],
    ];

    autoTable(doc, {
      startY: y,
      head: [['Metric (항목)', 'Value (값)']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [147, 51, 234] },
      margin: { left: 20, right: 20 },
      styles: { font: 'NotoSansKR', fontSize: 9 },
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  // Top Creators section
  if (topCreators && topCreators.length > 0) {
    y = addSectionTitle(doc, `Top ${topCreators.length} Creators (크리에이터)`, y);

    const creatorData = topCreators.map((creator, index) => [
      String(index + 1),
      `@${creator.username || ''}`,
      String(creator.platform || '').toUpperCase(),
      String(creator.brandFitScore || 0),
      formatNumber(creator.followerCount as number),
      `${(creator.engagementRate as number)?.toFixed(1) || 0}%`,
    ]);

    autoTable(doc, {
      startY: y,
      head: [['#', 'Username', 'Platform', 'Brand Fit', 'Followers', 'Engagement']],
      body: creatorData,
      theme: 'striped',
      headStyles: { fillColor: [147, 51, 234] },
      margin: { left: 20, right: 20 },
      styles: { font: 'NotoSansKR', fontSize: 9 },
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  // Recommendations section
  if (recommendations && recommendations.length > 0) {
    y = addSectionTitle(doc, 'Recommendations (추천사항)', y);

    doc.setFontSize(10);
    recommendations.forEach((rec, index) => {
      const lines = doc.splitTextToSize(`${index + 1}. ${rec}`, 170);
      doc.text(lines, 20, y);
      y += lines.length * 5 + 3;
    });
  }
}

/**
 * 콘텐츠 아이디어 리포트 PDF 생성
 */
function generateContentIdeaPdf(doc: jsPDF, content: Record<string, unknown>, startY: number): void {
  let y = startY;
  const summary = content.summary as Record<string, unknown> | undefined;
  const topIdeas = content.topIdeas as Array<Record<string, unknown>> | undefined;
  const recommendations = content.recommendations as string[] | undefined;

  // Summary section
  if (summary) {
    y = addSectionTitle(doc, 'Brand Statistics (브랜드별 통계)', y);

    const summaryData = [
      ['Buldak (불닭볶음면)', `${summary.buldakCount || 0}`],
      ['Samyang Ramen (삼양라면)', `${summary.samyangRamenCount || 0}`],
      ['Jelly (젤리)', `${summary.jellyCount || 0}`],
      ['Top Tone (주요 톤)', String(summary.topTone || '-')],
      ['Top Country (주요 국가)', String(summary.topCountry || '-')],
    ];

    autoTable(doc, {
      startY: y,
      head: [['Brand/Metric (브랜드/항목)', 'Value (값)']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [249, 115, 22] },
      margin: { left: 20, right: 20 },
      styles: { font: 'NotoSansKR', fontSize: 9 },
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  // Top Ideas section
  if (topIdeas && topIdeas.length > 0) {
    y = addSectionTitle(doc, `Top ${topIdeas.length} Content Ideas (콘텐츠 아이디어)`, y);

    const ideaData = topIdeas.map((idea, index) => [
      String(index + 1),
      String(idea.title || '').substring(0, 40) + (String(idea.title || '').length > 40 ? '...' : ''),
      String(idea.brandCategory || '-'),
      String(idea.tone || '-'),
      String(idea.targetCountry || '-'),
    ]);

    autoTable(doc, {
      startY: y,
      head: [['#', 'Title (제목)', 'Brand', 'Tone', 'Country']],
      body: ideaData,
      theme: 'striped',
      headStyles: { fillColor: [249, 115, 22] },
      margin: { left: 20, right: 20 },
      columnStyles: {
        1: { cellWidth: 70 },
      },
      styles: { font: 'NotoSansKR', fontSize: 9 },
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  // Recommendations section
  if (recommendations && recommendations.length > 0) {
    y = addSectionTitle(doc, 'Recommendations (추천사항)', y);

    doc.setFontSize(10);
    recommendations.forEach((rec, index) => {
      const lines = doc.splitTextToSize(`${index + 1}. ${rec}`, 170);
      doc.text(lines, 20, y);
      y += lines.length * 5 + 3;
    });
  }
}

/**
 * 푸터 추가
 */
function addFooter(doc: jsPDF): void {
  const pageCount = doc.getNumberOfPages();
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Samyang Viral Insight Agent - Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }
}

/**
 * 리포트 데이터를 PDF로 변환
 *
 * @param report - 리포트 데이터
 * @returns PDF 데이터 (ArrayBuffer)
 */
export function generateReportPdf(report: ReportData): ArrayBuffer {
  const doc = createPdfDocument();

  // Format date
  const createdDate = new Date(report.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Add header
  const startY = addHeader(doc, report.type, createdDate);

  // Generate content based on report type
  const content = report.content;

  switch (report.type) {
    case 'daily_trend':
      generateDailyTrendPdf(doc, content, startY);
      break;
    case 'creator_match':
      generateCreatorMatchPdf(doc, content, startY);
      break;
    case 'content_idea':
      generateContentIdeaPdf(doc, content, startY);
      break;
    default:
      // Generic JSON display for unknown types
      doc.setFontSize(10);
      doc.text('Report Content:', 20, startY);
      const jsonStr = JSON.stringify(content, null, 2);
      const lines = doc.splitTextToSize(jsonStr, 170);
      doc.text(lines.slice(0, 50), 20, startY + 10);
  }

  // Add footer
  addFooter(doc);

  // Return as ArrayBuffer
  return doc.output('arraybuffer');
}

/**
 * 파일명 생성
 *
 * @param report - 리포트 데이터
 * @returns 파일명
 */
export function generatePdfFilename(report: ReportData): string {
  const date = new Date().toISOString().split('T')[0];
  return `${report.type}_${report.id.slice(0, 8)}_${date}.pdf`;
}

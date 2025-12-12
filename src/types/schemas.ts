import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다'),
});

export const signupSchema = z
  .object({
    email: z.string().email('유효한 이메일을 입력해주세요'),
    password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다'),
    confirmPassword: z.string(),
    name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다').optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  });

// Trend analysis schema
export const trendAnalysisSchema = z.object({
  keyword: z.string().min(1, '키워드를 입력해주세요'),
  platform: z.enum(['tiktok', 'reels', 'shorts'], {
    errorMap: () => ({ message: '플랫폼을 선택해주세요' }),
  }),
  country: z.enum(['KR', 'US', 'JP'], {
    errorMap: () => ({ message: '국가를 선택해주세요' }),
  }),
});

// Content generation schema
export const contentGenerationSchema = z.object({
  trendId: z.string().optional(),
  brandCategory: z.enum(['buldak', 'samyang_ramen', 'jelly'], {
    errorMap: () => ({ message: '브랜드 카테고리를 선택해주세요' }),
  }),
  tone: z.enum(['fun', 'kawaii', 'provocative', 'cool'], {
    errorMap: () => ({ message: '톤앤매너를 선택해주세요' }),
  }),
  targetCountry: z.enum(['KR', 'US', 'JP']),
});

// Creator matching schema
export const creatorMatchingSchema = z.object({
  username: z.string().min(1, '사용자명을 입력해주세요'),
  platform: z.enum(['tiktok', 'instagram', 'youtube']),
  profileUrl: z.string().url('유효한 URL을 입력해주세요'),
  followerCount: z.number().min(0, '팔로워 수는 0 이상이어야 합니다').optional(),
  contentCategory: z.string().optional(),
  campaignPurpose: z.enum(['awareness', 'engagement', 'conversion']),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type TrendAnalysisInput = z.infer<typeof trendAnalysisSchema>;
export type ContentGenerationInput = z.infer<typeof contentGenerationSchema>;
export type CreatorMatchingInput = z.infer<typeof creatorMatchingSchema>;

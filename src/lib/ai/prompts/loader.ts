/**
 * 프롬프트 템플릿 로더
 */

import fs from 'fs/promises';
import path from 'path';

// 프롬프트 타입 정의
export type PromptType = 'trend-analyzer' | 'creator-matcher' | 'content-generator';

// 프롬프트 캐시 (성능 최적화)
const promptCache = new Map<string, string>();

/**
 * 프롬프트 템플릿 파일 경로 가져오기
 */
function getPromptPath(promptType: PromptType): string {
  const promptsDir = path.join(process.cwd(), 'prompts', 'system');
  const filename = `${promptType}.md`;
  return path.join(promptsDir, filename);
}

/**
 * 프롬프트 템플릿 로드
 */
export async function loadPrompt(promptType: PromptType): Promise<string> {
  // 캐시 확인
  if (promptCache.has(promptType)) {
    return promptCache.get(promptType)!;
  }

  try {
    const filePath = getPromptPath(promptType);
    const content = await fs.readFile(filePath, 'utf-8');

    // 캐시에 저장
    promptCache.set(promptType, content);

    return content;
  } catch (error) {
    console.error(`Failed to load prompt: ${promptType}`, error);
    throw new Error(`Prompt template not found: ${promptType}`);
  }
}

/**
 * 프롬프트 템플릿 + 사용자 입력 결합
 */
export async function buildPrompt(
  promptType: PromptType,
  userInput: string
): Promise<string> {
  const systemPrompt = await loadPrompt(promptType);
  return `${systemPrompt}\n\n---\n\n사용자 요청:\n${userInput}`;
}

/**
 * 변수 치환이 있는 프롬프트 빌드
 */
export async function buildPromptWithVars(
  promptType: PromptType,
  variables: Record<string, string>
): Promise<string> {
  let prompt = await loadPrompt(promptType);

  // 변수 치환 ({{variable_name}} 형식)
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    prompt = prompt.replace(new RegExp(placeholder, 'g'), value);
  });

  return prompt;
}

/**
 * 모든 프롬프트 프리로드 (서버 시작 시 사용)
 */
export async function preloadAllPrompts(): Promise<void> {
  const promptTypes: PromptType[] = [
    'trend-analyzer',
    'creator-matcher',
    'content-generator',
  ];

  try {
    await Promise.all(promptTypes.map((type) => loadPrompt(type)));
    console.log('All prompts preloaded successfully');
  } catch (error) {
    console.error('Failed to preload prompts:', error);
  }
}

/**
 * 프롬프트 캐시 클리어
 */
export function clearPromptCache(): void {
  promptCache.clear();
}

/**
 * 특정 프롬프트 캐시 삭제
 */
export function clearPrompt(promptType: PromptType): void {
  promptCache.delete(promptType);
}

/**
 * 프롬프트 존재 여부 확인
 */
export async function promptExists(promptType: PromptType): Promise<boolean> {
  try {
    const filePath = getPromptPath(promptType);
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 사용 가능한 프롬프트 목록 조회
 */
export async function getAvailablePrompts(): Promise<PromptType[]> {
  const promptTypes: PromptType[] = [
    'trend-analyzer',
    'creator-matcher',
    'content-generator',
  ];

  const available: PromptType[] = [];

  for (const type of promptTypes) {
    if (await promptExists(type)) {
      available.push(type);
    }
  }

  return available;
}

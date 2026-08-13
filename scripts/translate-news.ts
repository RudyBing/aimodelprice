/**
 * 新闻翻译模块 - 腾讯翻译君官方 SDK
 * 
 * 使用方法:
 *   import { translateNewsItem, translateNewsBatch } from './scripts/translate-news';
 *   const translated = await translateNewsItem(title, summary, content);
 * 
 * 翻译服务:
 *   腾讯翻译君（官方 SDK，免费额度 500 万字符/月）
 */

import * as tencentcloud from "tencentcloud-sdk-nodejs";

// 导入机器翻译 TMT 模块的 Client
const TmtClient = tencentcloud.tmt.v20180321.Client;

// API 配置
const TENCENT_CONFIG = {
  secretId: process.env.TENCENT_SECRET_ID || '',
  secretKey: process.env.TENCENT_SECRET_KEY || '',
  region: "ap-beijing",
  endpoint: "tmt.tencentcloudapi.com",
};

/**
 * 创建腾讯翻译君客户端
 */
function createClient() {
  if (!TENCENT_CONFIG.secretId || !TENCENT_CONFIG.secretKey) {
    throw new Error('腾讯翻译君配置缺失：请设置 TENCENT_SECRET_ID 和 TENCENT_SECRET_KEY');
  }

  const clientConfig = {
    credential: {
      secretId: TENCENT_CONFIG.secretId,
      secretKey: TENCENT_CONFIG.secretKey,
    },
    region: TENCENT_CONFIG.region,
    profile: {
      httpProfile: {
        endpoint: TENCENT_CONFIG.endpoint,
      },
    },
  };

  return new TmtClient(clientConfig);
}

/**
 * 腾讯翻译君 API 调用
 */
async function translateWithTencent(text: string): Promise<{
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
}> {
  const client = createClient();

  const params = {
    SourceText: text,
    Source: "en",
    Target: "zh",
    ProjectId: 0,
  };

  try {
    const result = await client.request("TextTranslate", params) as any;
    return {
      sourceText: text,
      translatedText: result.TargetText,
      sourceLang: "en",
      targetLang: "zh",
    };
  } catch (err) {
    throw new Error(`腾讯翻译君翻译失败：${(err as Error).message}`);
  }
}

/**
 * 翻译单条新闻
 */
export async function translateNewsItem(
  title: string,
  summary: string,
  content?: string
): Promise<{
  title: string;
  summary: string;
  content?: string;
  translatedFrom: string;
  originalTitle: string;
  translatedAt: string;
  translateService: string;
}> {
  console.log(`   使用腾讯翻译君...`);
  
  // 翻译标题
  const titleResult = await translateWithTencent(title);
  const translatedTitle = titleResult.translatedText;
  
  // 翻译摘要（如果太长则截断）
  const summaryToTranslate = summary.length > 2000 ? summary.substring(0, 2000) : summary;
  const summaryResult = await translateWithTencent(summaryToTranslate);
  const translatedSummary = summaryResult.translatedText;
  
  // 翻译内容（如果有）
  let translatedContent: string | undefined;
  if (content && content.length > 0) {
    try {
      const contentToTranslate = content.length > 2000 ? content.substring(0, 2000) : content;
      const contentResult = await translateWithTencent(contentToTranslate);
      translatedContent = contentResult.translatedText;
    } catch (contentError) {
      console.warn(`   ⚠️ 内容翻译失败，保留原文`);
      translatedContent = content;
    }
  }
  
  console.log(`   ✅ 翻译成功`);

  return {
    title: translatedTitle,
    summary: translatedSummary,
    content: translatedContent,
    translatedFrom: 'en',
    originalTitle: title, // 保存原始英文标题用于生成 slug
    translatedAt: new Date().toISOString(),
    translateService: '腾讯翻译君',
  };
}

/**
 * 批量翻译新闻
 */
export async function translateNewsBatch<T extends {
  title: string;
  summary: string;
  language?: string;
  id?: string;
  content?: string;
}>(
  news: T[]
): Promise<Array<T & {
  translatedFrom?: string;
  translatedAt?: string;
  translateService?: string;
  originalTitle?: string;
}>> {
  console.log(`\n🌐 开始批量翻译 (${news.length} 条)...`);
  
  const results = [];
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < news.length; i++) {
    const item = news[i];
    
    // 只翻译英文新闻
    if (item.language !== 'en') {
      results.push(item);
      continue;
    }

    console.log(`\n[${i + 1}/${news.length}] 翻译：${item.title.substring(0, 50)}...`);
    
    try {
      const translated = await translateNewsItem(item.title, item.summary, item.content);
      results.push({
        ...item,
        ...translated,
      });
      successCount++;
      
      // 避免 API 限流，添加短暂延迟（5 次/秒）
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.warn(`   跳过此条新闻，保留原文`);
      results.push(item);
      failCount++;
    }
  }

  console.log(`\n📊 翻译完成：成功 ${successCount} 条，失败 ${failCount} 条`);
  return results;
}

/**
 * 检查翻译配置
 */
export function checkTranslateConfig(): {
  tencent: boolean;
  youdao: boolean;
  ready: boolean;
} {
  const tencent = !!(TENCENT_CONFIG.secretId && TENCENT_CONFIG.secretKey);
  
  return {
    tencent,
    youdao: false,
    ready: tencent,
  };
}

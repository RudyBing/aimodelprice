/**
 * 新闻抓取脚本 - RSS + API 组合方案
 * 
 * 使用方法:
 *   npm run fetch:news
 * 
 * 功能:
 *   1. 从 RSS 源抓取新闻
 *   2. 从 NewsAPI 抓取新闻
 *   3. 合并并保存原始数据
 */

import fs from 'fs';
import path from 'path';
import Parser from 'rss-parser';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

// 解决 ES Module 的 __dirname 问题
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 类型定义
interface RSSSource {
  name: string;
  url: string;
  category: string;
  language: string;
  enabled: boolean;
}

interface APISource {
  enabled: boolean;
  keywords: string[];
  languages: string[];
  sortBy: string;
  pageSize: number;
}

interface RawNews {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  sourceUrl: string;
  originalUrl: string;
  publishedAt: string;
  fetchedAt: string;
  imageUrl?: string;
  category: string;
  tags: string[];
  relatedModels: string[];
  sentiment: string;
  hotness: number;
  language: string;
}

interface NewsSourcesConfig {
  rssSources: RSSSource[];
  apiSources: {
    newsapi: APISource;
  };
  settings: {
    maxNewsPerRun: number;
    minHotness: number;
    deduplicationThreshold: number;
    cacheExpiryHours: number;
  };
}

// 加载配置文件
function loadConfig(): NewsSourcesConfig {
  const configPath = path.join(rootDir, 'data', 'news-sources.json');
  const content = fs.readFileSync(configPath, 'utf-8');
  return JSON.parse(content);
}

// 生成 slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 80);
}

// 生成唯一 ID（使用 MD5 哈希确保唯一性）
function generateId(source: string, url: string): string {
  const hash = createHash('md5').update(`${source}-${url}`).digest('hex').substring(0, 16);
  return `news-${hash}`;
}

// 从 RSS 抓取新闻
async function fetchRSSNews(config: NewsSourcesConfig): Promise<RawNews[]> {
  const parser = new Parser({
    customFields: {
      item: [
        ['description', 'summary'],
        ['content:encoded', 'content'],
        ['media:content', 'imageUrl', { keepArray: true }],
        ['category', 'categories', { keepArray: true }],
      ],
    },
  });

  const allNews: RawNews[] = [];
  const enabledSources = config.rssSources.filter(s => s.enabled);

  console.log(`\n📡 开始从 ${enabledSources.length} 个 RSS 源抓取新闻...`);

  for (const source of enabledSources) {
    try {
      console.log(`  → 抓取 ${source.name}...`);
      const feed = await parser.parseURL(source.url);
      
      const items = feed.items.slice(0, 10).map((item): RawNews => ({
        id: generateId(source.name, item.link || ''),
        title: item.title || '无标题',
        summary: (item.summary || item.contentSnippet || '').substring(0, 500),
        content: '',
        source: source.name,
        sourceUrl: source.url,
        originalUrl: item.link || '',
        publishedAt: item.pubDate || new Date().toISOString(),
        fetchedAt: new Date().toISOString(),
        imageUrl: (item as any).imageUrl?.[0]?.$?.url || (item as any).imageUrl?.[0] || undefined,
        category: source.category,
        tags: (item as any).categories || [],
        relatedModels: [],
        sentiment: 'neutral',
        hotness: 50,
        language: source.language,
      }));

      allNews.push(...items);
      console.log(`    ✓ 获取 ${items.length} 条新闻`);
    } catch (error) {
      console.error(`    ✗ 抓取 ${source.name} 失败:`, (error as Error).message);
    }
  }

  return allNews;
}

// 从 NewsAPI 抓取新闻
async function fetchAPINews(config: NewsSourcesConfig): Promise<RawNews[]> {
  const apiConfig = config.apiSources.newsapi;
  
  if (!apiConfig.enabled) {
    console.log('\n⚠️  NewsAPI 已禁用，跳过抓取');
    return [];
  }

  const apiKey = process.env.NEWSAPI_KEY;
  if (!apiKey) {
    console.log('\n⚠️  未设置 NEWSAPI_KEY 环境变量，跳过 API 抓取');
    console.log('   如需使用 NewsAPI，请在 .env 文件中设置 NEWSAPI_KEY');
    return [];
  }

  const allNews: RawNews[] = [];
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 7); // 只抓取最近 7 天的新闻

  console.log(`\n🔌 开始从 NewsAPI 抓取新闻...`);
  console.log(`  关键词：${apiConfig.keywords.join(', ')}`);

  for (const keyword of apiConfig.keywords.slice(0, 5)) { // 限制关键词数量避免超限
    try {
      const url = new URL('https://newsapi.org/v2/everything');
      url.searchParams.append('q', keyword);
      url.searchParams.append('apiKey', apiKey);
      url.searchParams.append('language', 'en');
      url.searchParams.append('sortBy', apiConfig.sortBy);
      url.searchParams.append('pageSize', apiConfig.pageSize.toString());
      url.searchParams.append('from', fromDate.toISOString().split('T')[0]);

      console.log(`  → 搜索 "${keyword}"...`);
      
      const response = await fetch(url.toString());
      const data = await response.json() as any;

      if (data.status === 'ok') {
        const items = data.articles.slice(0, 10).map((article: any): RawNews => ({
          id: generateId('NewsAPI', article.url),
          title: article.title || '无标题',
          summary: (article.description || '').substring(0, 500),
          content: '',
          source: article.source.name || 'NewsAPI',
          sourceUrl: 'https://newsapi.org',
          originalUrl: article.url || '',
          publishedAt: article.publishedAt,
          fetchedAt: new Date().toISOString(),
          imageUrl: article.urlToImage || undefined,
          category: '科技媒体',
          tags: [keyword],
          relatedModels: [],
          sentiment: 'neutral',
          hotness: 60,
          language: 'en',
        }));

        allNews.push(...items);
        console.log(`    ✓ 获取 ${items.length} 条新闻`);
      } else {
        console.error(`    ✗ API 错误：${data.message}`);
      }
    } catch (error) {
      console.error(`    ✗ 搜索 "${keyword}" 失败:`, (error as Error).message);
    }

    // 避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return allNews;
}

// 保存原始数据
function saveRawNews(news: RawNews[]) {
  const outputPath = path.join(rootDir, 'data', 'news-raw.json');
  fs.writeFileSync(outputPath, JSON.stringify(news, null, 2), 'utf-8');
  console.log(`\n💾 原始数据已保存到：${outputPath}`);
  console.log(`   共 ${news.length} 条新闻`);
}

// 主函数
async function main() {
  console.log('='.repeat(60));
  console.log('🚀 AI 模型新闻抓取工具 - RSS + API 组合方案');
  console.log('='.repeat(60));

  try {
    // 加载配置
    const config = loadConfig();
    console.log('\n📋 配置已加载');
    console.log(`   RSS 源：${config.rssSources.filter(s => s.enabled).length} 个`);
    console.log(`   API 关键词：${config.apiSources.newsapi.keywords.length} 个`);

    // 抓取 RSS
    const rssNews = await fetchRSSNews(config);

    // 抓取 API
    const apiNews = await fetchAPINews(config);

    // 合并新闻
    const allNews = [...rssNews, ...apiNews];

    // 保存原始数据
    saveRawNews(allNews);

    console.log('\n✅ 抓取完成！');
    console.log('下一步运行：npm run process:news');

  } catch (error) {
    console.error('\n❌ 抓取失败:', (error as Error).message);
    process.exit(1);
  }
}

// 执行
main();

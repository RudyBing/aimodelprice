// 新闻数据访问层 - 从 PostgreSQL 数据库读取 AI 新闻数据

import sql from './db';

// 数据库新闻接口
interface DbNews {
  id: string;
  title: string;
  title_cn?: string;
  content: string;
  content_cn?: string;
  source: string;
  original_url?: string;
  published_at: string;
  category: string;
  tags: string[];
  related_models: string[];
  sentiment: string;
  hotness: number;
  language: string;
  translated_from: string | null;
  translated_at: string | null;
  translate_service: string | null;
  slug: string;
  is_published: boolean;
  site: string;
}

// 应用层新闻接口
export interface NewsItem {
  id: string;
  title: string;
  titleCn?: string;
  content: string;
  contentCn?: string;
  source: string;
  originalUrl: string;
  publishedAt: string;
  category: string;
  tags: string[];
  relatedModels: string[];
  sentiment: string;
  hotness: number;
  language: string;
  translatedFrom?: string;
  translatedAt?: string;
  translateService?: string;
  slug: string;
  isPublished: boolean;
  site: string;
}

// 将数据库记录转换为 NewsItem 对象
function mapDbToNews(dbNews: DbNews): NewsItem {
  const news: NewsItem = {
    id: dbNews.id,
    title: dbNews.title,
    titleCn: dbNews.title_cn || dbNews.title,
    content: dbNews.content,
    contentCn: dbNews.content_cn || dbNews.content,
    source: dbNews.source,
    originalUrl: dbNews.original_url || '',
    publishedAt: dbNews.published_at,
    category: dbNews.category,
    tags: dbNews.tags || [],
    relatedModels: dbNews.related_models || [],
    sentiment: dbNews.sentiment,
    hotness: dbNews.hotness,
    language: dbNews.language,
    slug: dbNews.slug,
    isPublished: dbNews.is_published,
    site: dbNews.site,
  };
  
  // 可选字段
  if (dbNews.translated_from) {
    news.translatedFrom = dbNews.translated_from;
  }
  if (dbNews.translated_at) {
    news.translatedAt = dbNews.translated_at;
  }
  if (dbNews.translate_service) {
    news.translateService = dbNews.translate_service;
  }
  
  return news;
}

// 从数据库获取所有新闻数据
export async function getNewsFromDb(): Promise<NewsItem[]> {
  try {
    const news = await sql<DbNews[]>`
      SELECT
        id, title, title_cn, content, content_cn, source, original_url,
        published_at, category, tags, related_models,
        sentiment, hotness, language, slug, is_published, site
      FROM spider_news
      WHERE is_published = true AND site = 'aimodelprice'
      ORDER BY published_at DESC
    `;
    
    return news.map(mapDbToNews);
  } catch (error) {
    console.error('从数据库读取新闻数据失败:', error);
    return [];
  }
}

// 根据 slug 获取单条新闻
export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  try {
    let decodedSlug = slug;
    try {
      decodedSlug = decodeURIComponent(slug);
    } catch {}

    const news = await sql<DbNews[]>`
      SELECT
        id, title, title_cn, content, content_cn, source, original_url,
        published_at, category, tags, related_models,
        sentiment, hotness, language, slug, is_published, site
      FROM spider_news
      WHERE slug = ${decodedSlug} AND is_published = true AND site = 'aimodelprice'
      LIMIT 1
    `;
    
    if (news.length === 0) {
      return null;
    }
    
    return mapDbToNews(news[0]);
  } catch (error) {
    console.error(`从数据库读取新闻 ${slug} 失败:`, error);
    return null;
  }
}

// 获取热门新闻（按热度排序）
export async function getHotNews(limit: number = 10): Promise<NewsItem[]> {
  try {
    const news = await sql<DbNews[]>`
      SELECT
        id, title, title_cn, content, content_cn, source, original_url,
        published_at, category, tags, related_models,
        sentiment, hotness, language, slug, is_published, site
      FROM spider_news
      WHERE is_published = true AND site = 'aimodelprice'
      ORDER BY hotness DESC, published_at DESC
      LIMIT ${limit}
    `;
    
    return news.map(mapDbToNews);
  } catch (error) {
    console.error('从数据库读取热门新闻失败:', error);
    return [];
  }
}

// 按分类获取新闻
export async function getNewsByCategory(category: string): Promise<NewsItem[]> {
  try {
    const news = await sql<DbNews[]>`
      SELECT
        id, title, title_cn, content, content_cn, source, original_url,
        published_at, category, tags, related_models,
        sentiment, hotness, language, slug, is_published, site
      FROM spider_news
      WHERE category = ${category} AND is_published = true AND site = 'aimodelprice'
      ORDER BY published_at DESC
    `;
    
    return news.map(mapDbToNews);
  } catch (error) {
    console.error(`从数据库读取分类 ${category} 的新闻失败:`, error);
    return [];
  }
}

// 获取新闻分类统计
export async function getNewsCategoryCounts(): Promise<{ category: string; count: number }[]> {
  try {
    const counts = await sql<{ category: string; count: number }[]>`
      SELECT category, COUNT(*) as count
      FROM spider_news
      WHERE is_published = true AND site = 'aimodelprice'
      GROUP BY category
      ORDER BY count DESC
    `;
    
    return counts;
  } catch (error) {
    console.error('从数据库读取新闻分类统计失败:', error);
    return [];
  }
}

// 获取相关新闻（同分类的其他新闻）
export async function getRelatedNews(
  currentNewsId: string,
  category: string,
  limit: number = 3
): Promise<NewsItem[]> {
  try {
    const news = await sql<DbNews[]>`
      SELECT
        id, title, title_cn, content, content_cn, source, original_url,
        published_at, category, tags, related_models,
        sentiment, hotness, language, slug, is_published, site
      FROM spider_news
      WHERE id != ${currentNewsId} AND category = ${category} AND is_published = true AND site = 'aimodelprice'
      ORDER BY hotness DESC, published_at DESC
      LIMIT ${limit}
    `;
    
    return news.map(mapDbToNews);
  } catch (error) {
    console.error(`从数据库读取相关新闻失败:`, error);
    return [];
  }
}

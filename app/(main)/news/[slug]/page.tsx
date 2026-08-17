import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { NewsCard } from '@/components/news/NewsCard';
import {
  ArrowLeft,
  ExternalLink,
  Clock,
  TrendingUp,
  Share2,
  Bookmark,
  Newspaper,
  Tag,
  Link2,
} from 'lucide-react';
import type { Metadata } from 'next';

// 加载新闻数据
function loadNews(): any[] {
  try {
    const newsData = require('@/data/news-metadata.json');
    return newsData.news || [];
  } catch (error) {
    console.error('Failed to load news data:', error);
    return [];
  }
}

// 根据 slug 查找新闻
function getNewsBySlug(slug: string): any | null {
  const allNews = loadNews();
  // 尝试直接匹配或解码后匹配
  return allNews.find(n => n.slug === slug || decodeURIComponent(n.slug) === slug) || null;
}

// 获取相关新闻
function getRelatedNews(currentNews: any, limit: number = 3): any[] {
  const allNews = loadNews();
  return allNews
    .filter(n => n.id !== currentNews.id && n.category === currentNews.category)
    .sort((a, b) => b.hotness - a.hotness)
    .slice(0, limit);
}

// 格式化日期
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 格式化相对时间
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return '刚刚';
  if (diffInHours < 24) return `${diffInHours}小时前`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}天前`;
  
  return formatDate(dateString);
}

// 获取分类颜色
function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    '产品发布': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    '价格调整': 'bg-green-500/10 text-green-500 border-green-500/20',
    '技术突破': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    '行业动态': 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    '更新迭代': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  };
  return colors[category] || colors['行业动态'];
}

// 生成 Metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const newsItem = getNewsBySlug(slug);
  
  if (!newsItem) {
    return {
      title: '新闻未找到 - AI Model Prices',
      description: '该新闻不存在或已被移除',
    };
  }
  
  const siteName = 'AI Model Prices';
  const title = `${newsItem.title} - ${siteName}`;
  const description = newsItem.summary;
  
  return {
    title: {
      default: title,
      template: `%s - ${siteName}`,
    },
    description,
    keywords: [
      ...newsItem.tags,
      newsItem.category,
      'AI 新闻',
      'AI 模型',
    ],
    openGraph: {
      title,
      description,
      type: 'article',
      siteName,
      locale: 'zh_CN',
      publishedTime: newsItem.publishedAt,
      authors: [newsItem.source],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

// 新闻详情页组件
export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const newsItem = getNewsBySlug(slug);
  
  if (!newsItem) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">新闻未找到</h1>
          <p className="text-muted-foreground mb-6">该新闻不存在或已被移除</p>
          <Button asChild>
            <Link href="/news">返回新闻列表</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  const relatedNews = getRelatedNews(newsItem);
  
  return (
    <div className="relative min-h-screen py-12 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-fast">首页</Link>
          <span>/</span>
          <Link href="/news" className="hover:text-foreground transition-fast">新闻</Link>
          <span>/</span>
          <span className="text-foreground font-medium line-clamp-1">{newsItem.title}</span>
        </div>
        
        {/* Back button */}
        <Link href="/news" className="inline-block mb-8">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground h-8">
            <ArrowLeft className="h-3.5 w-3.5" />
            返回新闻列表
          </Button>
        </Link>
        
        {/* Article Header */}
        <article>
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge className={cn('text-xs', getCategoryColor(newsItem.category))}>
                {newsItem.category}
              </Badge>
              {newsItem.hotness >= 80 && (
                <Badge variant="secondary" className="text-xs h-5 gap-1">
                  <TrendingUp className="h-3 w-3 text-orange-500" />
                  热门 {newsItem.hotness}
                </Badge>
              )}
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 leading-tight">
              {newsItem.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Newspaper className="h-4 w-4" />
                <span>{newsItem.source}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{formatRelativeTime(newsItem.publishedAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                <span>{formatDate(newsItem.publishedAt)}</span>
              </div>
            </div>
          </header>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2 mb-8 pb-8 border-b border-border/30">
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              分享
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Bookmark className="h-4 w-4" />
              收藏
            </Button>
            <Button variant="outline" size="sm" className="gap-2 ml-auto" asChild>
              <a
                href={newsItem.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                访问原文
              </a>
            </Button>
          </div>
          
          {/* Summary */}
          <Card className="border-border/40 bg-secondary/30 mb-8">
            <CardContent className="p-6">
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                摘要
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {newsItem.summary}
              </p>
            </CardContent>
          </Card>
          
          {/* Content */}
          {newsItem.content && newsItem.content !== newsItem.summary && (
            <div className="prose prose-sm max-w-none mb-8">
              <div className="text-muted-foreground leading-relaxed space-y-4">
                <p>{newsItem.content}</p>
                <p className="text-sm text-muted-foreground italic">
                  注：以上内容摘选自原始新闻，点击「访问原文」查看完整内容。
                </p>
              </div>
            </div>
          )}
          
          {/* Tags */}
          {newsItem.tags && newsItem.tags.length > 0 && (
            <div className="mb-8 pb-8 border-b border-border/30">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                标签
              </h3>
              <div className="flex flex-wrap gap-2">
                {newsItem.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Related Models */}
          {newsItem.relatedModels && newsItem.relatedModels.length > 0 && (
            <div className="mb-8 pb-8 border-b border-border/30">
              <h3 className="text-sm font-semibold mb-3">相关 AI 模型</h3>
              <div className="flex flex-wrap gap-2">
                {newsItem.relatedModels.map((modelSlug: string) => (
                  <Link key={modelSlug} href={`/models/${modelSlug}`}>
                    <Badge variant="outline" className="text-xs px-3 py-1.5 hover:bg-secondary transition-colors cursor-pointer">
                      {modelSlug}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {/* Source Link */}
          <Card className="border-border/40 bg-card/60 mb-8">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold mb-1">新闻来源</h3>
                  <p className="text-xs text-muted-foreground">
                    {newsItem.source} · {formatDate(newsItem.publishedAt)}
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={newsItem.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    查看原文
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </article>
        
        {/* Related News */}
        {relatedNews.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4">相关新闻</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedNews.map((item) => (
                <NewsCard key={item.id} news={item} variant="compact" />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Clock, TrendingUp, ExternalLink } from 'lucide-react';

interface News {
  id: string;
  slug: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  category: string;
  tags: string[];
  relatedModels: string[];
  hotness: number;
  sentiment: string;
}

interface NewsCardProps {
  news: News;
  variant?: 'default' | 'compact' | 'featured';
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
  
  return date.toLocaleDateString('zh-CN');
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

// 获取情感图标
function getSentimentIcon(sentiment: string): string {
  switch (sentiment) {
    case 'positive': return '📈';
    case 'negative': return '📉';
    default: return '➖';
  }
}

export function NewsCard({ news, variant = 'default' }: NewsCardProps) {
  if (variant === 'featured') {
    return (
      <Link href={`/news/${news.slug}`} className="block group">
        <Card className="border-border/30 bg-card/40 hover:bg-secondary/40 hover:border-border/50 transition-normal focus-within:ring-2 focus-within:ring-primary rounded-lg h-full">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <Badge className={cn('text-xs', getCategoryColor(news.category))}>
                {news.category}
              </Badge>
              {news.hotness >= 80 && (
                <div className="flex items-center gap-1 text-orange-500 text-xs font-medium">
                  <TrendingUp className="h-3 w-3" />
                  热门
                </div>
              )}
            </div>
            
            <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
              {news.title}
            </h3>
            
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
              {news.summary}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{news.source}</span>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatRelativeTime(news.publishedAt)}
                </div>
              </div>
              
              {news.relatedModels.length > 0 && (
                <div className="flex items-center gap-1">
                  {news.relatedModels.slice(0, 2).map((modelId) => (
                    <Badge key={modelId} variant="outline" className="text-[10px] h-5">
                      {modelId}
                    </Badge>
                  ))}
                  {news.relatedModels.length > 2 && (
                    <span className="text-xs text-muted-foreground">
                      +{news.relatedModels.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }
  
  if (variant === 'compact') {
    return (
      <Link href={`/news/${news.slug}`} className="block group">
        <div className="py-3 border-b border-border/30 last:border-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2 mb-1">
                {news.title}
              </h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{news.source}</span>
                <span>·</span>
                <span>{formatRelativeTime(news.publishedAt)}</span>
              </div>
            </div>
            {news.hotness >= 80 && (
              <div className="flex-shrink-0 text-orange-500">
                <TrendingUp className="h-4 w-4" />
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }
  
  // Default variant
  return (
    <Link href={`/news/${news.slug}`} className="block group">
      <Card className="border-border/30 bg-card/40 hover:bg-secondary/40 hover:border-border/50 transition-normal focus-within:ring-2 focus-within:ring-primary rounded-lg h-full">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <Badge className={cn('text-xs', getCategoryColor(news.category))}>
              {news.category}
            </Badge>
            <span className="text-xs text-muted-foreground" title={news.sentiment}>
              {getSentimentIcon(news.sentiment)}
            </span>
          </div>
          
          <h3 className="text-base font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {news.title}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {news.summary}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{news.source}</span>
              <span>·</span>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatRelativeTime(news.publishedAt)}
              </div>
            </div>
            
            {news.hotness >= 70 && (
              <div className="flex items-center gap-1 text-xs font-medium" style={{ color: news.hotness >= 85 ? '#f97316' : '#eab308' }}>
                <TrendingUp className="h-3 w-3" />
                {news.hotness}
              </div>
            )}
          </div>
          
          {news.relatedModels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-border/30">
              {news.relatedModels.slice(0, 3).map((modelId) => (
                <Badge key={modelId} variant="secondary" className="text-[10px] h-5 px-1.5">
                  {modelId}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

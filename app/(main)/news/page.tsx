import { NewsCard } from '@/components/news/NewsCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  TrendingUp,
  Clock,
  Filter,
  Newspaper,
  Zap,
  DollarSign,
  Cpu,
  Briefcase,
  Package,
} from 'lucide-react';
import Link from 'next/link';
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

// 分类配置
const categories = [
  { id: 'all', name: '全部', icon: Newspaper, count: 0 },
  { id: '产品发布', name: '产品发布', icon: Package, count: 0 },
  { id: '价格调整', name: '价格调整', icon: DollarSign, count: 0 },
  { id: '技术突破', name: '技术突破', icon: Cpu, count: 0 },
  { id: '行业动态', name: '行业动态', icon: Briefcase, count: 0 },
  { id: '更新迭代', name: '更新迭代', icon: Zap, count: 0 },
];

export const metadata: Metadata = {
  title: 'AI 模型新闻 - 追踪最新 AI 动态',
  description: '获取最新 AI 模型相关新闻，包括产品发布、价格调整、技术突破和行业动态',
  keywords: ['AI 新闻', 'AI 模型', '大语言模型', 'GPT', 'Claude', 'Gemini', 'AI 动态'],
};

export default function NewsListPage() {
  const allNews = loadNews();
  
  // 统计各分类新闻数量
  categories.forEach(cat => {
    if (cat.id !== 'all') {
      cat.count = allNews.filter(n => n.category === cat.id).length;
    } else {
      cat.count = allNews.length;
    }
  });
  
  // 按热度排序
  const hotNews = [...allNews].sort((a, b) => b.hotness - a.hotness).slice(0, 10);
  
  // 按时间排序
  const latestNews = [...allNews].sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  
  return (
    <div className="relative min-h-screen py-12 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <Link href="/" className="hover:text-foreground transition-fast">首页</Link>
            <span>/</span>
            <span className="text-foreground font-medium">新闻中心</span>
          </div>
          
          <div className="flex items-center gap-3 mb-4">
            <Newspaper className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">AI 模型新闻</h1>
          </div>
          
          <p className="text-muted-foreground max-w-3xl">
            追踪最新 AI 模型动态，包括产品发布、价格调整、技术突破和行业资讯
          </p>
        </div>
        
        {/* Search and Filters */}
        <Card className="mb-8 border-border/40 bg-card/60">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索新闻..."
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  筛选
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Clock className="h-4 w-4" />
                  时间
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Button
                key={cat.id}
                variant="secondary"
                size="sm"
                className="gap-2"
              >
                <Icon className="h-4 w-4" />
                {cat.name}
                <Badge variant="outline" className="ml-1 h-5 px-1.5 text-[10px]">
                  {cat.count}
                </Badge>
              </Button>
            );
          })}
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* News List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5" />
                最新新闻
              </h2>
              <Button variant="ghost" size="sm" className="text-xs">
                加载更多
              </Button>
            </div>
            
            <div className="space-y-4">
              {latestNews.length > 0 ? (
                latestNews.map((item) => (
                  <NewsCard key={item.id} news={item} variant="default" />
                ))
              ) : (
                <Card className="border-border/30 bg-card/40">
                  <CardContent className="p-12 text-center">
                    <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">暂无新闻数据</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      运行 <code className="bg-secondary px-2 py-1 rounded">npm run fetch:news</code> 抓取新闻
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Hot News */}
            <Card className="border-border/40 bg-card/60 sticky top-20">
              <CardContent className="p-5">
                <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                  热门新闻
                </h3>
                
                <div className="space-y-1">
                  {hotNews.slice(0, 8).map((item, index) => (
                    <Link
                      key={item.id}
                      href={`/news/${item.slug}`}
                      className="block group py-2 border-b border-border/30 last:border-0"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary text-xs font-medium flex items-center justify-center">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span>{item.source}</span>
                            <span>·</span>
                            <span>{item.hotness}🔥</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Quick Links */}
            <Card className="border-border/40 bg-card/60">
              <CardContent className="p-5">
                <h3 className="text-base font-semibold mb-4">快速链接</h3>
                <div className="space-y-2">
                  <Link href="/models" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    → 查看 AI 模型列表
                  </Link>
                  <Link href="/compare" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    → 对比 AI 模型
                  </Link>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    → 提交新闻源建议
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

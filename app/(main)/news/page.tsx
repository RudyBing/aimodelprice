"use client";

import { NewsCard } from '@/components/news/NewsCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

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

const NEWS_PER_PAGE = 20;

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
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(latestNews.length / NEWS_PER_PAGE);
  
  // 当前页的新闻
  const startIndex = (currentPage - 1) * NEWS_PER_PAGE;
  const endIndex = startIndex + NEWS_PER_PAGE;
  const currentNews = latestNews.slice(startIndex, endIndex);
  
  // 页码按钮
  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };
  
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
              <span className="text-sm text-muted-foreground">
                共 {latestNews.length} 条
              </span>
            </div>
            
            <div className="space-y-4">
              {currentNews.length > 0 ? (
                currentNews.map((item) => (
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
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  上一页
                </Button>
                
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, i) => (
                    page === '...' ? (
                      <span key={i} className="px-3 py-2 text-muted-foreground">...</span>
                    ) : (
                      <Button
                        key={i}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page as number)}
                        className="w-10"
                      >
                        {page}
                      </Button>
                    )
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  下一页
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
            
            {/* Page Info */}
            {totalPages > 1 && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                第 {currentPage} 页，共 {totalPages} 页（每页 {NEWS_PER_PAGE} 条）
              </p>
            )}
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
          </div>
        </div>
      </div>
    </div>
  );
}

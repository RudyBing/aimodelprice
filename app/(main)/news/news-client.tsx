'use client';

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
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { NewsItem } from '@/lib/news-db';

// 分类配置（不含 count，count 动态计算）
const categoryDefs = [
  { id: 'all', name: '全部', icon: Newspaper },
  { id: '产品发布', name: '产品发布', icon: Package },
  { id: '价格调整', name: '价格调整', icon: DollarSign },
  { id: '技术突破', name: '技术突破', icon: Cpu },
  { id: '行业动态', name: '行业动态', icon: Briefcase },
  { id: '更新迭代', name: '更新迭代', icon: Zap },
];

const NEWS_PER_PAGE = 20;

type SortMode = 'latest' | 'hot';

interface NewsListPageProps {
  news: NewsItem[];
}

export default function NewsListPage({ news: allNews }: NewsListPageProps) {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortMode, setSortMode] = useState<SortMode>('latest');
  const [currentPage, setCurrentPage] = useState(1);

  // 计算各分类数量（基于原始数据）
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allNews.length };
    categoryDefs.forEach(cat => {
      if (cat.id !== 'all') {
        counts[cat.id] = allNews.filter(n => n.category === cat.id).length;
      }
    });
    return counts;
  }, [allNews]);

  // 过滤 + 排序
  const filteredNews = useMemo(() => {
    let list = [...allNews];

    // 搜索过滤
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(n =>
        n.title.toLowerCase().includes(q) ||
        (n.titleCn && n.titleCn.toLowerCase().includes(q)) ||
        n.content.toLowerCase().includes(q) ||
        n.source.toLowerCase().includes(q) ||
        n.tags.some(t => t.toLowerCase().includes(q)) ||
        n.category.toLowerCase().includes(q)
      );
    }

    // 分类过滤
    if (filterCategory !== 'all') {
      list = list.filter(n => n.category === filterCategory);
    }

    // 排序
    if (sortMode === 'latest') {
      list.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    } else {
      list.sort((a, b) => b.hotness - a.hotness);
    }

    return list;
  }, [allNews, search, filterCategory, sortMode]);

  // 分页
  const totalPages = Math.ceil(filteredNews.length / NEWS_PER_PAGE);
  const startIndex = (currentPage - 1) * NEWS_PER_PAGE;
  const currentNews = filteredNews.slice(startIndex, startIndex + NEWS_PER_PAGE);

  // 筛选条件变化时重置到第 1 页
  const handleSearchChange = (v: string) => {
    setSearch(v);
    setCurrentPage(1);
  };
  const handleCategoryChange = (cat: string) => {
    setFilterCategory(cat);
    setCurrentPage(1);
  };
  const handleSortChange = (mode: SortMode) => {
    setSortMode(mode);
    setCurrentPage(1);
  };

  // 页码按钮
  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
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

  const hasFilters = search || filterCategory !== 'all';
  const clearFilters = () => {
    setSearch('');
    setFilterCategory('all');
    setCurrentPage(1);
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
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索标题、内容、来源或标签..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9"
                  aria-label="搜索新闻"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={sortMode === 'latest' ? 'default' : 'outline'}
                  size="sm"
                  className="gap-1.5 h-10"
                  onClick={() => handleSortChange('latest')}
                >
                  <Clock className="h-4 w-4" />
                  最新发布
                </Button>
                <Button
                  variant={sortMode === 'hot' ? 'default' : 'outline'}
                  size="sm"
                  className="gap-1.5 h-10"
                  onClick={() => handleSortChange('hot')}
                >
                  <TrendingUp className="h-4 w-4" />
                  最热
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categoryDefs.map((cat) => {
            const Icon = cat.icon;
            const count = categoryCounts[cat.id] ?? 0;
            const isActive = filterCategory === cat.id;
            return (
              <Button
                key={cat.id}
                variant={isActive ? 'default' : 'secondary'}
                size="sm"
                className={cn('gap-2 h-9', isActive && 'bg-primary text-primary-foreground')}
                onClick={() => handleCategoryChange(cat.id)}
              >
                <Icon className="h-3.5 w-3.5" />
                {cat.name}
                <Badge variant={isActive ? 'secondary' : 'outline'} className="ml-1 h-5 px-1.5 text-[10px]">
                  {count}
                </Badge>
              </Button>
            );
          })}
        </div>

        {/* Active filters indicator */}
        {hasFilters && (
          <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            <span>
              共 {filteredNews.length} 条结果
              {search && <span className="ml-1">（关键词：<span className="font-medium text-foreground">{search}</span>）</span>}
              {filterCategory !== 'all' && <span className="ml-1">（分类：{categoryDefs.find(c => c.id === filterCategory)?.name}）</span>}
            </span>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1 ml-1" onClick={clearFilters}>
              <XIcon className="h-3 w-3" />清除筛选
            </Button>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* News List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                {sortMode === 'latest' ? <Clock className="h-5 w-5" /> : <TrendingUp className="h-5 w-5 text-orange-500" />}
                {sortMode === 'latest' ? '最新新闻' : '热门新闻'}
              </h2>
              <span className="text-sm text-muted-foreground">
                第 {startIndex + 1}–{Math.min(startIndex + NEWS_PER_PAGE, filteredNews.length)} 条，共 {filteredNews.length} 条
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
                    <p className="text-muted-foreground font-medium">未找到相关新闻</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {hasFilters ? '试试其他关键词或清除筛选条件' : '新闻数据将从数据库加载'}
                    </p>
                    {hasFilters && (
                      <Button variant="link" size="sm" className="mt-3" onClick={clearFilters}>
                        清除筛选条件
                      </Button>
                    )}
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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                    热门新闻
                  </h3>
                  <Button
                    variant={sortMode === 'hot' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleSortChange(sortMode === 'hot' ? 'latest' : 'hot')}
                  >
                    {sortMode === 'hot' ? '按时间' : '按热度'}
                  </Button>
                </div>

                <div className="space-y-1">
                  {(sortMode === 'hot'
                    ? [...allNews].sort((a, b) => b.hotness - a.hotness).slice(0, 8)
                    : [...allNews].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
                  ).map((item, index) => (
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
                          <h4 className="text-sm font-medium group-hover:text-primary transition-fast line-clamp-2">
                            {item.titleCn || item.title}
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

            {/* Category stats */}
            <Card className="border-border/40 bg-card/60">
              <CardContent className="p-5">
                <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" />
                  新闻分类
                </h3>
                <div className="space-y-2">
                  {categoryDefs.filter(c => c.id !== 'all').map((cat) => {
                    const Icon = cat.icon;
                    const count = categoryCounts[cat.id] ?? 0;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.id)}
                        className={cn(
                          'flex items-center justify-between w-full px-2 py-1.5 rounded-md text-sm transition-fast cursor-pointer',
                          filterCategory === cat.id
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'hover:bg-secondary/60 text-muted-foreground hover:text-foreground'
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5" />
                          {cat.name}
                        </span>
                        <Badge variant="outline" className="h-5 px-1.5 text-[10px]">{count}</Badge>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// 内联 X icon（避免额外依赖）
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

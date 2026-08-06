'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { models, modelCategories, type ModelCategory, type AIModel } from '@/data/models';
import { PriceComparisonCard } from '@/components/aceternity/price-comparison-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Search, Cpu, Zap, Palette, Video, Mic, Code2, Sparkles, Globe, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';

const categoryIcons: Record<ModelCategory, React.ReactNode> = {
  text: <Zap className="h-3.5 w-3.5" />,
  image: <Palette className="h-3.5 w-3.5" />,
  video: <Video className="h-3.5 w-3.5" />,
  audio: <Mic className="h-3.5 w-3.5" />,
  code: <Code2 className="h-3.5 w-3.5" />,
  multimodal: <Sparkles className="h-3.5 w-3.5" />,
  'open-source': <Globe className="h-3.5 w-3.5" />,
};

const categoryLabels: Record<ModelCategory, string> = {
  text: '文本模型',
  image: '图像生成',
  video: '视频生成',
  audio: '音频处理',
  code: '代码助手',
  multimodal: '多模态',
  'open-source': '开源模型',
};

const ITEMS_PER_PAGE_OPTIONS = [20, 50, 100];
const DEFAULT_ITEMS_PER_PAGE = 20;

export default function ModelsPage() {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<ModelCategory | 'all'>('all');
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
  const [hasLoadedMore, setHasLoadedMore] = useState(false);

  const providers = useMemo(() => [...new Set(models.map((m) => m.provider))].sort(), []);

  const filteredModels = useMemo(() => {
    return models.filter((m) => {
      const matchSearch = !search ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.provider.toLowerCase().includes(search.toLowerCase()) ||
        m.description.toLowerCase().includes(search.toLowerCase()) ||
        m.strengths.some((s) => s.toLowerCase().includes(search.toLowerCase()));
      const matchCategory = filterCategory === 'all' || m.category === filterCategory;
      const matchProvider = filterProvider === 'all' || m.provider === filterProvider;
      return matchSearch && matchCategory && matchProvider;
    });
  }, [search, filterCategory, filterProvider]);

  // 筛选条件变化时重置分页
  useEffect(() => {
    setCurrentPage(1);
    setHasLoadedMore(false);
  }, [search, filterCategory, filterProvider]);

  // 计算当前页应该显示的模型
  const totalPages = Math.ceil(filteredModels.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredModels.length);
  const currentModels = filteredModels.slice(startIndex, endIndex);

  // 加载更多
  const loadMore = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      setHasLoadedMore(true);
    }
  }, [currentPage, totalPages]);

  const hasFilters = search || filterCategory !== 'all' || filterProvider !== 'all';

  const clearFilters = () => {
    setSearch('');
    setFilterCategory('all');
    setFilterProvider('all');
  };

  const displayedCount = hasLoadedMore ? endIndex : Math.min(itemsPerPage, filteredModels.length);
  const showLoadMore = currentPage < totalPages;

  return (
    <div className="relative min-h-screen py-12 px-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            全部 AI 模型
          </h1>
          <p className="text-sm text-muted-foreground">
            共收录 {models.length} 个模型，来自 {providers.length} 家提供商
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Search + Provider */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索模型名称、提供商或描述..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 bg-secondary/50 border-border/40 rounded-lg text-sm"
                aria-label="搜索模型"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterProvider}
                onChange={(e) => setFilterProvider(e.target.value)}
                className="h-10 rounded-lg border border-border/40 bg-secondary/50 px-3 text-sm text-muted-foreground appearance-none cursor-pointer min-w-[140px]"
                aria-label="按提供商筛选"
                style={{ backgroundImage: 'none' }}
              >
                <option value="all">所有提供商</option>
                {providers.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 px-2.5 md:hidden"
                onClick={() => setShowFilters(!showFilters)}
                aria-label="切换筛选器"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Category tabs */}
          <div className={cn('flex gap-1.5 flex-wrap', showFilters ? 'block' : 'hidden md:block')}>
            <Button
              variant={filterCategory === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterCategory('all')}
              className={cn('h-8 px-3 text-xs gap-1', filterCategory === 'all' && 'bg-primary/20 text-primary')}
            >
              <Cpu className="h-3.5 w-3.5" />全部
            </Button>
            {modelCategories.map((cat) => (
              <Button
                key={cat.id}
                variant={filterCategory === cat.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilterCategory(cat.id)}
                className={cn('h-8 px-3 text-xs gap-1', filterCategory === cat.id && 'bg-primary/20 text-primary')}
              >
                {categoryIcons[cat.id]}
                {cat.label}
              </Button>
            ))}
          </div>

          {/* Active filters indicator + 每页数量选择 */}
          {(hasFilters || filteredModels.length > itemsPerPage) && (
            <div className="flex items-center justify-between text-xs flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-muted-foreground">
                  找到 <span className="text-foreground font-medium" aria-live="polite">{filteredModels.length}</span> 个模型
                  {filteredModels.length > itemsPerPage && (
                    <span className="ml-1">（显示 {displayedCount} 个）</span>
                  )}
                </span>
                {hasFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs gap-1">
                    <X className="h-3 w-3" />清除筛选
                  </Button>
                )}
              </div>
              
              {/* 每页数量选择器 */}
              {filteredModels.length > itemsPerPage && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">每页显示</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                      setHasLoadedMore(false);
                    }}
                    className="h-6 rounded border border-border/40 bg-secondary/50 px-2 text-xs text-muted-foreground appearance-none cursor-pointer"
                    aria-label="每页显示数量"
                    style={{ backgroundImage: 'none' }}
                  >
                    {ITEMS_PER_PAGE_OPTIONS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <span className="text-muted-foreground">个</span>
                </div>
              )}
            </div>
          )}

          <Separator className="border-border/30" />
        </div>

        {/* Results */}
        {filteredModels.length === 0 ? (
          <div className="text-center py-20">
            <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">没有找到匹配的模型</h3>
            <p className="text-muted-foreground mb-4 text-sm">试试其他关键词或清除筛选条件</p>
            <Button variant="link" onClick={clearFilters}>清除筛选条件</Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {currentModels.map((model, i) => (
                <PriceComparisonCard key={model.id} model={model} index={startIndex + i} />
              ))}
            </div>

            {/* 加载更多按钮 */}
            {showLoadMore && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={loadMore}
                  variant="outline"
                  size="lg"
                  className="gap-2 px-8 h-11"
                >
                  加载更多
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* 分页信息 */}
            {totalPages > 1 && (
              <div className="text-center mt-4 text-xs text-muted-foreground">
                第 {currentPage} 页 / 共 {totalPages} 页
                {hasLoadedMore && (
                  <span className="ml-2">
                    （已加载 {Math.round((endIndex / filteredModels.length) * 100)}%）
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

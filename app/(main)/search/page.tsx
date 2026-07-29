'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { models, type AIModel } from '@/data/models';
import { PriceComparisonCard } from '@/components/aceternity/price-comparison-card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Search, X, Zap, Palette, Video, Mic, Code2, Sparkles, Globe, Filter, TrendingUp, Clock } from 'lucide-react';

const categoryIcons: Record<string, React.ReactNode> = {
  text: <Zap className="h-5 w-5" />,
  image: <Palette className="h-5 w-5" />,
  video: <Video className="h-5 w-5" />,
  audio: <Mic className="h-5 w-5" />,
  code: <Code2 className="h-5 w-5" />,
  multimodal: <Sparkles className="h-5 w-5" />,
  'open-source': <Globe className="h-5 w-5" />,
};

const categoryLabels: Record<string, string> = {
  text: '文本模型',
  image: '图像生成',
  video: '视频生成',
  audio: '音频处理',
  code: '代码助手',
  multimodal: '多模态',
  'open-source': '开源模型',
};

function getPricingInput(pricing: any): string {
  if (Array.isArray(pricing)) return pricing[0]?.input || '';
  return pricing.input;
}

function searchModels(query: string): AIModel[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  return models.filter((m) => {
    if (m.name.toLowerCase().includes(q)) return true;
    if (m.provider.toLowerCase().includes(q)) return true;
    if (m.description.toLowerCase().includes(q)) return true;
    if (m.strengths.some((s) => s.toLowerCase().includes(q))) return true;
    if (categoryLabels[m.category]?.includes(q)) return true;
    if (getPricingInput(m.pricing).toLowerCase().includes(q)) return true;
    return false;
  });
}

function SearchPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeProvider, setActiveProvider] = useState('all');

  const providers = useMemo(() => [...new Set(models.map((m) => m.provider))].sort(), []);

  const results = useMemo(() => {
    let matched = searchModels(query);
    if (activeCategory !== 'all') matched = matched.filter((m) => m.category === activeCategory);
    if (activeProvider !== 'all') matched = matched.filter((m) => m.provider === activeProvider);
    return matched;
  }, [query, activeCategory, activeProvider]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const clearSearch = () => {
    setQuery('');
    setActiveCategory('all');
    setActiveProvider('all');
    router.push('/');
  };

  const hotSearches = ['GPT', 'Claude', 'Gemini', 'Midjourney', 'DeepSeek', 'Sora', 'Flux', 'Llama'];

  return (
    <div className="relative min-h-screen py-12 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Search form */}
        <div className="mb-8">
          <form onSubmit={handleSubmit} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="搜索 AI 模型、提供商、功能..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 pr-12 h-14 text-base bg-secondary/60 border-border/40 focus:border-primary/50 rounded-xl"
              aria-label="搜索模型"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted/50 transition-fast"
                aria-label="清空搜索"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </form>
        </div>

        {query.trim() && (
          <>
            {/* Results count */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                搜索 <span className="text-foreground font-medium">"{query}"</span> 的结果：<span className="text-foreground font-bold">{results.length}</span> 个模型
              </p>
              {(activeCategory !== 'all' || activeProvider !== 'all') && (
                <Button variant="ghost" size="sm" onClick={() => { setActiveCategory('all'); setActiveProvider('all'); }} className="text-xs h-7 gap-1">
                  <X className="h-3 w-3" />清除筛选
                </Button>
              )}
            </div>

            {/* Filters */}
            {results.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2 items-center">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <select
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                  className="h-7 rounded-md border border-border/40 bg-secondary/50 px-2.5 text-xs appearance-none cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  aria-label="按分类筛选"
                >
                  <option value="all">全部分类</option>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <select
                  value={activeProvider}
                  onChange={(e) => setActiveProvider(e.target.value)}
                  className="h-7 rounded-md border border-border/40 bg-secondary/50 px-2.5 text-xs appearance-none cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  aria-label="按提供商筛选"
                >
                  <option value="all">所有提供商</option>
                  {providers.map((p) => (<option key={p} value={p}>{p}</option>))}
                </select>
              </div>
            )}

            {/* Results grid */}
            {results.length === 0 ? (
              <div className="text-center py-20">
                <Search className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">未找到匹配结果</h3>
                <p className="text-muted-foreground mb-6 text-sm">试试其他关键词，比如 "GPT"、"Claude"、"图像生成"</p>
                <Button onClick={clearSearch} variant="outline" size="sm">清除搜索</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {results.map((model, i) => (
                  <PriceComparisonCard key={model.id} model={model} index={i} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!query.trim() && (
          <>
            {/* Hot searches */}
            <Card className="border-border/30 bg-card/40 mb-8">
              <CardContent className="p-5">
                <h3 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />热门搜索
                </h3>
                <div className="flex flex-wrap gap-2">
                  {hotSearches.map((term) => (
                    <Button
                      key={term}
                      variant="outline"
                      size="sm"
                      onClick={() => { setQuery(term); router.push(`/search?q=${encodeURIComponent(query)}`); }}
                      className="h-8 text-xs gap-1"
                    >
                      <Search className="h-3 w-3" />{term}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Browse by category */}
            <div>
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-blue-400" />按分类浏览
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {Object.entries(categoryIcons).map(([key, icon]) => {
                  const count = models.filter((m) => m.category === key).length;
                  return (
                    <Button
                      key={key}
                      variant="outline"
                      className="h-auto py-4 flex-col gap-2 justify-start hover:bg-primary/5 hover:border-primary/20 transition-normal"
                      onClick={() => router.push(`/models/${key}`)}
                      aria-label={`浏览 ${categoryLabels[key]}`}
                    >
                      <span className="text-blue-400">{icon}</span>
                      <span className="text-xs font-medium">{categoryLabels[key]}</span>
                      <span className="text-[10px] text-muted-foreground">{count} 个模型</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm">加载中...</p>
      </div>
    }>
      <SearchPageInner />
    </Suspense>
  );
}

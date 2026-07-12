'use client';

import { useState, useMemo } from 'react';
import { models, modelCategories, type ModelCategory, type AIModel } from '@/data/models';
import { PriceComparisonCard } from '@/components/aceternity/price-comparison-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Search, Cpu, Zap, Palette, Video, Mic, Code2, Sparkles, Globe, X } from 'lucide-react';

const categoryIcons: Record<ModelCategory, React.ReactNode> = {
  text: <Zap className="h-3.5 w-3.5" />,
  image: <Palette className="h-3.5 w-3.5" />,
  video: <Video className="h-3.5 w-3.5" />,
  audio: <Mic className="h-3.5 w-3.5" />,
  code: <Code2 className="h-3.5 w-3.5" />,
  multimodal: <Sparkles className="h-3.5 w-3.5" />,
  'open-source': <Globe className="h-3.5 w-3.5" />,
};

export default function ModelsPage() {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<ModelCategory | 'all'>('all');
  const [filterProvider, setFilterProvider] = useState<string>('all');

  const providers = useMemo(() => [...new Set(models.map((m) => m.provider))].sort(), []);

  const filteredModels = useMemo(() => {
    return models.filter((m) => {
      const matchSearch = !search ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.provider.toLowerCase().includes(search.toLowerCase()) ||
        m.description.toLowerCase().includes(search.toLowerCase());
      const matchCategory = filterCategory === 'all' || m.category === filterCategory;
      const matchProvider = filterProvider === 'all' || m.provider === filterProvider;
      return matchSearch && matchCategory && matchProvider;
    });
  }, [search, filterCategory, filterProvider]);

  const hasFilters = search || filterCategory !== 'all' || filterProvider !== 'all';

  const clearFilters = () => {
    setSearch('');
    setFilterCategory('all');
    setFilterProvider('all');
  };

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
              />
            </div>
            <select
              value={filterProvider}
              onChange={(e) => setFilterProvider(e.target.value)}
              className="h-10 rounded-lg border border-border/40 bg-secondary/50 px-3 text-sm text-muted-foreground appearance-none cursor-pointer"
              style={{ backgroundImage: 'none' }}
            >
              <option value="all">所有提供商</option>
              {providers.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Category tabs */}
          <div className="flex gap-1.5 flex-wrap">
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

          {/* Active filters indicator */}
          {hasFilters && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                找到 <span className="text-foreground font-medium">{filteredModels.length}</span> 个模型
              </span>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs gap-1">
                <X className="h-3 w-3" />清除筛选
              </Button>
            </div>
          )}

          <Separator className="border-border/30" />
        </div>

        {/* Results */}
        {filteredModels.length === 0 ? (
          <div className="text-center py-20">
            <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">没有找到匹配的模型</p>
            <Button variant="link" onClick={clearFilters}>清除筛选条件</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredModels.map((model, i) => (
              <PriceComparisonCard key={model.id} model={model} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { cn } from '@/lib/utils';

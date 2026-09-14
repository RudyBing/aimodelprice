'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { modelCategories, type AIModel } from '@/data/models-generated';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Search, TrendingDown, Sparkles, Zap, BarChart3, Trophy,
  X, CheckCircle2, Filter,
} from 'lucide-react';
import Link from 'next/link';
import { getPriceInputNum, getPricingInput, getPricingOutput, getFreeTierTag } from '@/lib/pricing';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

// localStorage key for selected compare models
const COMPARE_STORAGE_KEY = 'ai_model_compare_selected';
const MAX_COMPARE = 6;

interface CompareState {
  modelIds: string[];
  sortBy: 'price' | 'benchmark' | 'context';
  filterCategory: string;
  searchQuery: string;
}

function loadCompareState(): CompareState {
  try {
    const raw = localStorage.getItem(COMPARE_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { modelIds: [], sortBy: 'price', filterCategory: 'all', searchQuery: '' };
}

function saveCompareState(state: CompareState) {
  try {
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

// Map provider name to background color class for bar charts
const providerBgMap: Record<string, string> = {
  'OpenAI': 'bg-provider-openai',
  'Anthropic': 'bg-provider-anthropic',
  'Google': 'bg-provider-google',
  'Meta': 'bg-provider-meta',
  'Alibaba': 'bg-provider-alibaba',
  'DeepSeek': 'bg-provider-deepseek',
  'Black Forest Labs': 'bg-provider-blackforest',
  'Stability AI': 'bg-provider-stability',
  'Mistral': 'bg-provider-mistral',
  'Kuaishou': 'bg-provider-kuaishou',
  'Zhipu AI': 'bg-provider-zhipu',
};

function getProviderBgClass(provider: string): string {
  return providerBgMap[provider] || 'bg-provider-default';
}

interface ComparePageClientProps {
  models: AIModel[];
}

export default function ComparePageClient({ models }: ComparePageClientProps) {
  const [state, setState] = useState<CompareState>(loadCompareState);
  const [selectionMode, setSelectionMode] = useState(false);

  // Persist state to localStorage
  useEffect(() => {
    saveCompareState(state);
  }, [state]);

  const filteredModels = useMemo(() => {
    let list = models;
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase();
      list = list.filter((m) =>
        m.name.toLowerCase().includes(q) ||
        m.provider.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q)
      );
    }
    if (state.filterCategory !== 'all') {
      list = list.filter((m) => m.category === state.filterCategory);
    }
    return list;
  }, [models, state.searchQuery, state.filterCategory]);

  const sortedModels = useMemo(() => {
    let list = [...filteredModels];
    list.sort((a, b) => {
      if (state.sortBy === 'price') {
        return getPriceInputNum(a.pricing) - getPriceInputNum(b.pricing);
      }
      if (state.sortBy === 'benchmark') {
        return (b.benchmarkScore || 0) - (a.benchmarkScore || 0);
      }
      if (state.sortBy === 'context') {
        const parseCtx = (m: AIModel) => {
          const match = m.contextWindow.match(/(\d+)/);
          return match ? parseInt(match[0]) : 0;
        };
        return parseCtx(b) - parseCtx(a);
      }
      return 0;
    });
    return list;
  }, [filteredModels, state.sortBy]);

  const selectedModels = useMemo(
    () => sortedModels.filter((m) => state.modelIds.includes(m.id)),
    [sortedModels, state.modelIds]
  );

  const toggleModel = useCallback((id: string) => {
    setState(prev => {
      const ids = prev.modelIds.includes(id)
        ? prev.modelIds.filter(x => x !== id)
        : prev.modelIds.length < MAX_COMPARE
          ? [...prev.modelIds, id]
          : prev.modelIds;
      return { ...prev, modelIds: ids };
    });
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, modelIds: [] }));
  }, []);

  const categoryOptions = modelCategories.map(c => ({ id: c.id, label: c.label }));

  // Price range for visualization
  const prices = sortedModels.map(m => getPriceInputNum(m.pricing)).filter(p => p < Infinity);
  const maxPrice = Math.max(...prices, 1);

  // Highlights across all models
  const cheapest = sortedModels.length > 0 ? sortedModels.reduce((prev, curr) =>
    getPriceInputNum(curr.pricing) < getPriceInputNum(prev.pricing) ? curr : prev
  ) : null;
  const strongest = sortedModels.length > 0 ? sortedModels.reduce((prev, curr) =>
    (curr.benchmarkScore || 0) > (prev.benchmarkScore || 0) ? curr : prev
  ) : null;
  const longestContext = sortedModels.length > 0 ? sortedModels.reduce((prev, curr) => {
    const parseCtx = (m: AIModel) => {
      const match = m.contextWindow.match(/(\d+)/);
      return match ? parseInt(match[0]) : 0;
    };
    return parseCtx(curr) > parseCtx(prev) ? curr : prev;
  }) : null;

  // For selected comparison view
  const selPrices = selectedModels.map(m => getPriceInputNum(m.pricing)).filter(p => p < Infinity);
  const selMaxPrice = Math.max(...selPrices, 1);
  const selCheapest = selectedModels.length > 0 ? selectedModels.reduce((prev, curr) =>
    getPriceInputNum(curr.pricing) < getPriceInputNum(prev.pricing) ? curr : prev
  ) : null;

  return (
    <div className="relative min-h-screen py-12 px-4">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">模型价格对比</h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            直观对比各 AI 模型的价格、性能、上下文窗口等关键指标
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索模型..."
                value={state.searchQuery}
                onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="pl-9 h-10 bg-secondary/50 border-border/40 rounded-lg text-sm"
                aria-label="搜索模型"
              />
            </div>
            <select
              value={state.filterCategory}
              onChange={(e) => setState(prev => ({ ...prev, filterCategory: e.target.value }))}
              className="h-10 rounded-lg border border-border/40 bg-secondary/50 px-3 text-sm text-muted-foreground appearance-none cursor-pointer"
              aria-label="分类筛选"
            >
              <option value="all">全部分类</option>
              {categoryOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
            <Button
              variant={selectionMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectionMode(v => !v)}
              className={cn(
                'h-10 gap-1.5 shrink-0',
                selectionMode && 'bg-primary text-primary-foreground'
              )}
            >
              <Filter className="h-4 w-4" />
              {selectionMode ? '退出选择' : '选择模型对比'}
            </Button>
          </div>

          {/* Sort buttons */}
          <div className="flex flex-wrap gap-2">
            {([
              { key: 'price' as const, label: '按价格排序', icon: TrendingDown },
              { key: 'benchmark' as const, label: '按性能排序', icon: BarChart3 },
              { key: 'context' as const, label: '按上下文排序', icon: Sparkles },
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={state.sortBy === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setState(prev => ({ ...prev, sortBy: key }))}
                className="h-9 text-xs gap-1.5"
              >
                <Icon className="h-3.5 w-3.5" />{label}
              </Button>
            )))}
          </div>
        </div>

        {/* Selection mode floating bar */}
        {selectionMode && (
          <div className="sticky top-14 z-40 mb-4 rounded-lg border border-primary/30 bg-primary/5 backdrop-blur-md px-4 py-3 flex items-center gap-3">
            <span className="text-sm font-medium text-primary shrink-0">
              已选 {state.modelIds.length}/{MAX_COMPARE}
            </span>
            {state.modelIds.length > 0 && (
              <>
                <div className="flex-1 flex flex-wrap gap-1.5">
                  {selectedModels.map((m) => (
                    <Badge
                      key={m.id}
                      variant="secondary"
                      className="text-xs px-2 py-0.5 gap-1 cursor-pointer hover:bg-destructive/20 transition-fast"
                      onClick={() => toggleModel(m.id)}
                    >
                      {m.name}
                      <X className="h-3 w-3" />
                    </Badge>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground shrink-0"
                  onClick={clearSelection}
                >
                  清空
                </Button>
              </>
            )}
          </div>
        )}

        {/* Price visualization bar (all models) */}
        {sortedModels.length > 0 && !selectionMode && (
          <Card className="border-border/40 bg-card/60 mb-6">
            <CardContent className="p-5">
              <h3 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5" />
                输入价格分布
              </h3>
              <div className="space-y-1.5">
                {sortedModels.slice(0, 10).map((model, index) => {
                  const price = getPriceInputNum(model.pricing);
                  const percentage = (price / maxPrice) * 100;
                  const providerColor = getProviderBgClass(model.provider);
                  const isCheapestAll = cheapest?.id === model.id;
                  return (
                    <div key={`${model.id}-${index}`} className="flex items-center gap-2 group">
                      <span className={cn(
                        'text-xs font-medium w-24 truncate',
                        isCheapestAll ? 'text-green-400' : 'text-muted-foreground group-hover:text-foreground transition-fast'
                      )}>
                        {model.name}
                      </span>
                      <div className="flex-1 h-5 rounded-sm bg-secondary/50 overflow-hidden relative">
                        <div
                          className={cn('h-full rounded-sm transition-normal', providerColor)}
                          style={{ width: `${Math.max(percentage, 2)}%` }}
                        />
                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground">
                          {getPricingInput(model.pricing)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ===== SELECTED COMPARISON VIEW ===== */}
        {selectedModels.length >= 2 && (
          <div className="mb-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-400" />
                对比结果
                <span className="text-sm font-normal text-muted-foreground">
                  ({selectedModels.length} 个模型)
                </span>
              </h2>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={clearSelection}>
                <X className="h-3 w-3 mr-1" />清除
              </Button>
            </div>

            {/* Price bar comparison */}
            <Card className="border-border/40 bg-card/60">
              <CardContent className="p-5">
                <h3 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                  <TrendingDown className="h-3.5 w-3.5" />
                  输入价格对比
                </h3>
                <div className="space-y-2">
                  {selectedModels.map((model) => {
                    const price = getPriceInputNum(model.pricing);
                    const percentage = (price / selMaxPrice) * 100;
                    const isCheapest = selCheapest?.id === model.id;
                    return (
                      <div key={model.id} className="flex items-center gap-3">
                        <Link
                          href={`/models/${model.slug}`}
                          className={cn(
                            'text-xs font-medium w-28 truncate hover:text-primary transition-fast shrink-0',
                            isCheapest && 'text-green-400'
                          )}
                        >
                          {isCheapest && <span className="mr-1">🏆</span>}
                          {model.name}
                        </Link>
                        <div className="flex-1 h-6 rounded-md bg-secondary/50 overflow-hidden relative">
                          <div
                            className={cn(
                              'h-full rounded-md transition-normal',
                              isCheapest ? 'bg-green-500/60' : getProviderBgClass(model.provider)
                            )}
                            style={{ width: `${Math.max(percentage, 3)}%` }}
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground">
                            {getPricingInput(model.pricing)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Model cards comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedModels.map((model) => {
                const priceNum = getPriceInputNum(model.pricing);
                const isCheapest = selCheapest?.id === model.id;
                const { tag: freeTag } = getFreeTierTag(model.freeTier || '');
                return (
                  <Card
                    key={model.id}
                    className={cn(
                      'border-border/40 bg-card/60 relative overflow-hidden',
                      isCheapest && 'border-green-500/40 ring-1 ring-green-500/20'
                    )}
                  >
                    {isCheapest && (
                      <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-bl-md font-medium">
                        最便宜
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn('inline-block w-2 h-2 rounded-full', getProviderBgClass(model.provider))} />
                        <span className="text-xs text-muted-foreground">{model.provider}</span>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{model.category}</Badge>
                      </div>
                      <Link href={`/models/${model.slug}`} className="block mb-3">
                        <h3 className="font-semibold text-sm hover:text-primary transition-fast line-clamp-1">{model.name}</h3>
                      </Link>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">输入</span>
                          <span className={cn('font-mono font-medium', isCheapest ? 'text-green-400' : '')}>
                            {getPricingInput(model.pricing)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">输出</span>
                          <span className="font-mono">{getPricingOutput(model.pricing)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">上下文</span>
                          <span className="font-mono">{model.contextWindow}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">性能分</span>
                          <span className="font-mono">
                            {model.benchmarkScore != null ? model.benchmarkScore : '-'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">多模态</span>
                          <span>{model.multimodal ? <CheckCircle2 className="h-3 w-3 text-green-400" /> : <span className="text-muted-foreground">否</span>}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">免费额度</span>
                          <span className={freeTag !== '无' ? 'text-yellow-400' : 'text-muted-foreground'}>
                            {freeTag !== '无' ? freeTag : '-'}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button asChild variant="ghost" size="sm" className="h-7 text-xs flex-1">
                          <Link href={`/models/${model.slug}`}>详情</Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs px-2"
                          onClick={() => toggleModel(model.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== ALL MODELS TABLE ===== */}
        <Card className="border-border/40 bg-card/60">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className="min-w-[160px]">模型</TableHead>
                    <TableHead className="min-w-[140px]">输入价格</TableHead>
                    <TableHead className="min-w-[140px]">输出价格</TableHead>
                    <TableHead className="min-w-[100px]">上下文</TableHead>
                    <TableHead className="text-center min-w-[80px]">性能分</TableHead>
                    <TableHead className="text-center min-w-[80px]">多模态</TableHead>
                    <TableHead className="min-w-[100px]">免费额度</TableHead>
                    {selectionMode && (
                      <TableHead className="min-w-[60px] text-center">选择</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedModels.map((model, index) => {
                    const isSelected = state.modelIds.includes(model.id);
                    const { tag: freeTag } = getFreeTierTag(model.freeTier || '');
                    const priceNum = getPriceInputNum(model.pricing);
                    const isCheap = priceNum <= maxPrice * 0.3;
                    const isCheapest = cheapest?.id === model.id;
                    return (
                      <TableRow key={`${model.id}-${index}`} className="border-border/20 hover:bg-secondary/30">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {isCheapest && <span className="text-xs">🏆</span>}
                            <Link href={`/models/${model.slug}`}>
                              <span className="hover:text-blue-400 transition-fast cursor-pointer">{model.name}</span>
                            </Link>
                            <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{model.provider}</Badge>
                          </div>
                        </TableCell>
                        <TableCell className={cn('font-mono text-xs', isCheap || isCheapest ? 'text-green-400' : '')}>
                          {getPricingInput(model.pricing)}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {getPricingOutput(model.pricing)}
                        </TableCell>
                        <TableCell className="text-xs">
                          {model.contextWindow}
                        </TableCell>
                        <TableCell className="text-center">
                          {model.benchmarkScore != null ? (
                            <span className={cn(
                              'inline-flex items-center justify-center w-8 h-6 rounded text-xs font-bold',
                              model.benchmarkScore >= 90 ? 'bg-blue-500/20 text-blue-400' :
                              model.benchmarkScore >= 80 ? 'bg-purple-500/20 text-purple-400' :
                              'bg-muted text-muted-foreground'
                            )}>
                              {model.benchmarkScore}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {model.multimodal ? (
                            <CheckCircle2 className="h-4 w-4 text-green-400 mx-auto" />
                          ) : (
                            <span className="text-muted-foreground text-xs">否</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs">
                          {freeTag !== '无' ? (
                            <span className="text-yellow-400">{freeTag}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        {selectionMode && (
                          <TableCell className="text-center">
                            <button
                              onClick={() => toggleModel(model.id)}
                              className={cn(
                                'inline-flex items-center justify-center w-6 h-6 rounded border transition-fast',
                                isSelected
                                  ? 'bg-primary border-primary text-primary-foreground'
                                  : 'border-border/40 hover:border-primary/60'
                              )}
                              aria-label={isSelected ? `移除 ${model.name}` : `选择 ${model.name}`}
                            >
                              {isSelected ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="text-xs text-muted-foreground">+</span>}
                            </button>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Highlights */}
        {!selectionMode && cheapest && strongest && longestContext && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
            <Card className="border-border/40 bg-card/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-2.5 mb-2">
                  <Trophy className="h-4 w-4 text-yellow-400" />
                  <h3 className="text-xs font-semibold text-muted-foreground">最便宜输入价格</h3>
                </div>
                <p className="text-xl font-bold">{cheapest.name}</p>
                <p className="text-sm text-green-400 font-mono mt-1">{getPricingInput(cheapest.pricing)}</p>
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-card/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-2.5 mb-2">
                  <BarChart3 className="h-4 w-4 text-blue-400" />
                  <h3 className="text-xs font-semibold text-muted-foreground">最高性能评分</h3>
                </div>
                <p className="text-xl font-bold">{strongest.name}</p>
                <p className="text-sm text-blue-400 font-mono mt-1">评分：{strongest.benchmarkScore}</p>
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-card/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-2.5 mb-2">
                  <Zap className="h-4 w-4 text-purple-400" />
                  <h3 className="text-xs font-semibold text-muted-foreground">最长上下文</h3>
                </div>
                <p className="text-xl font-bold">{longestContext.name}</p>
                <p className="text-sm text-purple-400 font-mono mt-1">{longestContext.contextWindow}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Selection hint */}
        {selectionMode && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              已选 {state.modelIds.length} 个模型
              {state.modelIds.length >= 2 && (
                <span className="ml-2 text-primary font-medium">
                  — 点击表格中的模型名称可跳转查看详情，再次点击「+」按钮可移除
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

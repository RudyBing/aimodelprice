'use client';

import { useState, useMemo, useCallback } from 'react';
import { models, modelCategories, type AIModel } from '@/data/models';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Search, TrendingDown, Sparkles, Zap, BarChart3, Trophy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

function getPriceInputNum(pricing: AIModel['pricing']): number {
  const raw = typeof pricing === 'string' ? pricing : Array.isArray(pricing) ? pricing[0]?.input || '' : pricing.input;
  const match = String(raw).match(/[\d.]+/);
  return match ? parseFloat(match[0]) : Infinity;
}

function getPriceInput(pricing: AIModel['pricing']): string {
  if (Array.isArray(pricing)) return pricing[0]?.input || '';
  return pricing.input;
}

function getPriceOutput(pricing: AIModel['pricing']): string {
  if (Array.isArray(pricing)) return pricing[0]?.output || '';
  return pricing.output;
}

function getFreeTierTag(text: string): { tag: string; full: string } {
  if (!text || text === '无') return { tag: '无', full: '无' };
  const parts = text.split(/[；;]/);
  const short = parts[0].trim();
  return { tag: short, full: text };
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

export default function ComparePage() {
  const [sortBy, setSortBy] = useState<'price' | 'benchmark' | 'context'>('price');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isComposing, setIsComposing] = useState(false);

  const filteredModels = useMemo(() => {
    if (!searchQuery.trim() || isComposing) return models;
    return models.filter((m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, isComposing]);

  const sortedModels = useMemo(() => {
    let list = [...filteredModels];
    if (filterCategory !== 'all') {
      list = list.filter((m) => m.category === filterCategory);
    }

    list.sort((a, b) => {
      if (sortBy === 'price') {
        return getPriceInputNum(a.pricing) - getPriceInputNum(b.pricing);
      }
      if (sortBy === 'benchmark') {
        return (b.benchmarkScore || 0) - (a.benchmarkScore || 0);
      }
      if (sortBy === 'context') {
        const parseContext = (m: AIModel) => {
          const match = m.contextWindow.match(/(\d+)/);
          return match ? parseInt(match[0]) : 0;
        };
        return parseContext(b) - parseContext(a);
      }
      return 0;
    });
    return list;
  }, [filteredModels, sortBy, filterCategory]);

  const categories = [...new Set(models.map((m) => m.category))];
  const categoryOptions = modelCategories.map(c => ({ id: c.id, label: c.label }));

  // Price range for bar chart
  const prices = sortedModels.map(m => getPriceInputNum(m.pricing)).filter(p => p < Infinity);
  const maxPrice = Math.max(...prices, 1);

  // Find highlights
  const cheapest = sortedModels.reduce((prev, curr) =>
    getPriceInputNum(curr.pricing) < getPriceInputNum(prev.pricing) ? curr : prev
  );
  const strongest = sortedModels.reduce((prev, curr) =>
    (curr.benchmarkScore || 0) > (prev.benchmarkScore || 0) ? curr : prev
  );
  const longestContext = sortedModels.length > 0
    ? sortedModels.reduce((prev, curr) => {
        const parseContext = (m: AIModel) => { const match = m.contextWindow.match(/(\d+)/); return match ? parseInt(match[0]) : 0; };
        return parseContext(curr) > parseContext(prev) ? curr : prev;
      })
    : models[0];

  return (
    <div className="relative min-h-screen py-12 px-4">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            模型价格对比
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            直观对比各 AI 模型的价格、性能、上下文窗口等关键指标
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索模型..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
                className="pl-9 h-10 bg-secondary/50 border-border/40 rounded-lg text-sm"
                aria-label="搜索模型"
              />
            </div>


            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="h-10 rounded-lg border border-border/40 bg-secondary/50 px-3 text-sm text-muted-foreground appearance-none cursor-pointer"
              aria-label="分类筛选"
            >
              <option value="all">全部分类</option>
              {categoryOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={sortBy === 'price' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('price')}
              className={`h-9 text-xs gap-1.5 ${sortBy === 'price' ? 'bg-primary text-primary-foreground shadow-sm' : 'border-border/40 hover:bg-secondary/60'}`}
            >
              <TrendingDown className="h-3.5 w-3.5" />
              按价格排序
            </Button>
            <Button
              variant={sortBy === 'benchmark' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('benchmark')}
              className={`h-9 text-xs gap-1.5 ${sortBy === 'benchmark' ? 'bg-primary text-primary-foreground shadow-sm' : 'border-border/40 hover:bg-secondary/60'}`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              按性能排序
            </Button>
            <Button
              variant={sortBy === 'context' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('context')}
              className={`h-9 text-xs gap-1.5 ${sortBy === 'context' ? 'bg-primary text-primary-foreground shadow-sm' : 'border-border/40 hover:bg-secondary/60'}`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              按上下文排序
            </Button>
          </div>
        </div>

        {/* Price visualization bar */}
        {sortedModels.length > 0 && (
          <Card className="border-border/40 bg-card/60 mb-6">
            <CardContent className="p-5">
              <h3 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5" />
                输入价格分布
              </h3>
              <div className="space-y-1.5">
                {sortedModels.slice(0, 10).map((model) => {
                  const price = getPriceInputNum(model.pricing);
                  const percentage = (price / maxPrice) * 100;
                  const providerColor = getProviderBgClass(model.provider);
                  return (
                    <div key={model.id} className="flex items-center gap-2 group">
                      <span className="text-xs font-medium w-24 truncate text-muted-foreground group-hover:text-foreground transition-fast">
                        {model.name}
                      </span>
                      <div className="flex-1 h-5 rounded-sm bg-secondary/50 overflow-hidden relative">
                        <div
                          className={cn(
                            'h-full rounded-sm transition-normal',
                            providerColor
                          )}
                          style={{ width: `${Math.max(percentage, 2)}%` }}
                        />
                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground">
                          {typeof model.pricing === 'string' ? model.pricing : Array.isArray(model.pricing) ? model.pricing[0]?.input : model.pricing.input}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Table */}
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedModels.map((model) => {
                    const { tag: freeTag } = getFreeTierTag(model.freeTier || '');
                    const priceNum = getPriceInputNum(model.pricing);
                    const isCheap = priceNum <= maxPrice * 0.3;
                    return (
                      <TableRow key={model.id} className="border-border/20 hover:bg-secondary/30">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Link href={`/models/${model.slug}`}>
                              <span className="hover:text-blue-400 transition-fast cursor-pointer">{model.name}</span>
                            </Link>
                            <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{model.provider}</Badge>
                          </div>
                        </TableCell>
                        <TableCell className={cn('font-mono text-xs', isCheap ? 'price-low' : '')}>
                          {getPriceInput(model.pricing)}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {getPriceOutput(model.pricing)}
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
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
          <Card className="border-border/40 bg-card/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-2.5 mb-2">
                <Trophy className="h-4 w-4 text-yellow-400" />
                <h3 className="text-xs font-semibold text-muted-foreground">最便宜输入价格</h3>
              </div>
              <p className="text-xl font-bold">{cheapest.name}</p>
              <p className="text-sm text-green-400 font-mono mt-1">{getPriceInput(cheapest.pricing)}</p>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-2.5 mb-2">
                <BarChart3 className="h-4 w-4 text-blue-400" />
                <h3 className="text-xs font-semibold text-muted-foreground">最高性能评分</h3>
              </div>
              <p className="text-xl font-bold">{strongest.name}</p>
              <p className="text-sm text-blue-400 font-mono mt-1">评分: {strongest.benchmarkScore}</p>
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
      </div>
    </div>
  );
}
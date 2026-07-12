'use client';

import { useState, useMemo, useCallback } from 'react';
import { models, modelCategories, type AIModel } from '@/data/models';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Search, Sparkles, Zap, BarChart3, Trophy } from 'lucide-react';
import { Input } from '@/components/ui/input';

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
        : models[0]

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
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="h-10 rounded-lg border border-border/40 bg-secondary/50 px-3 text-sm appearance-none cursor-pointer"
            >
              <option value="all">所有分类</option>
              {categoryOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Sort buttons */}
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'price' as const, label: '按价格排序', icon: Trophy },
              { key: 'benchmark' as const, label: '按性能排序', icon: BarChart3 },
              { key: 'context' as const, label: '按上下文排序', icon: Sparkles },
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={sortBy === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy(key)}
                className={cn('gap-1.5 h-8 text-xs', sortBy === key && 'bg-primary/20 text-primary')}
              >
                <Icon className="h-3.5 w-3.5" />{label}
              </Button>
            ))}
          </div>
        </div>

        {/* Price bar chart */}
        <Card className="border-border/40 bg-card/50 mb-6">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-400" />
              输入价格排行
            </h3>
            <div className="space-y-2">
              {sortedModels.slice(0, 12).map((model) => {
                const priceNum = getPriceInputNum(model.pricing);
                const barWidth = priceNum === Infinity ? 0 : Math.max((priceNum / maxPrice) * 100, 2);
                const isCheap = priceNum <= 1;
                const isMid = priceNum > 1 && priceNum <= 5;

                return (
                  <div key={model.id} className="flex items-center gap-3">
                    <div className="w-28 sm:w-32 shrink-0 text-xs font-medium truncate" title={model.name}>
                      {model.name}
                    </div>
                    <div className="flex-1 h-5 bg-secondary/50 rounded-sm overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-sm transition-normal',
                          isCheap ? 'bg-green-500/60' : isMid ? 'bg-yellow-500/50' : 'bg-red-500/50'
                        )}
                        style={{ width: barWidth + "%" }}
                      />
                    </div>
                    <div className="w-24 text-right text-xs font-mono shrink-0">
                      {getPriceInput(model.pricing)}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Comparison table */}
        <Card className="border-border/40 bg-card/50 mb-8 overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40">
                    <TableHead className="w-36">模型</TableHead>
                    <TableHead>输入价格</TableHead>
                    <TableHead>输出价格</TableHead>
                    <TableHead>上下文</TableHead>
                    <TableHead className="text-center">性能</TableHead>
                    <TableHead className="text-center">多模态</TableHead>
                    <TableHead>免费额度</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedModels.map((model) => {
                    const priceNum = getPriceInputNum(model.pricing);
                    const isCheap = priceNum <= 1;
                    const { tag: freeTag } = getFreeTierTag(model.freeTier || '');
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

"use client";

import { useState } from "react";
import { models, modelCategories, type AIModel } from "@/data/models";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Search, Sparkles, Zap, BarChart3, Trophy } from "lucide-react";
import { Input } from "@/components/ui/input";

function getPriceInput(pricing: AIModel["pricing"]): string {
  if (Array.isArray(pricing)) return pricing[0]?.input || "";
  return pricing.input;
}

function getPriceOutput(pricing: AIModel["pricing"]): string {
  if (Array.isArray(pricing)) return pricing[0]?.output || "";
  return pricing.output;
}

function getFreeTierTag(text: string): { tag: string; full: string } {
  if (!text || text === "无") return { tag: "无", full: "无" };
  const parts = text.split(/[（(]/);
  const short = parts[0].trim();
  return { tag: short, full: text };
}

function formatFreeTier(text: string): string {
  if (!text || text === "无") return text;
  if (text.length <= 30) return text;
  return text.slice(0, 28) + "...";
}

export default function ComparePage() {
  const [sortBy, setSortBy] = useState<"price" | "benchmark" | "context">("price");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const filteredModels = searchQuery.trim()
    ? models.filter((m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : models;

  const sortedModels = [...filteredModels].sort((a, b) => {
    if (filterCategory !== "all" && a.category !== filterCategory) return 1;
    if (filterCategory !== "all" && b.category !== filterCategory) return -1;

    if (sortBy === "price") {
      const parsePrice = (m: AIModel) => {
        const match = getPriceInput(m.pricing).match(/[\d.]+/);
        return match ? parseFloat(match[0]) : Infinity;
      };
      return parsePrice(a) - parsePrice(b);
    }
    if (sortBy === "benchmark") {
      return (b.benchmarkScore || 0) - (a.benchmarkScore || 0);
    }
    if (sortBy === "context") {
      const parseContext = (m: AIModel) => {
        const match = m.contextWindow.match(/(\d+)/);
        return match ? parseInt(match[0]) : 0;
      };
      return parseContext(b) - parseContext(a);
    }
    return 0;
  });

  const categories = [...new Set(models.map((m) => m.category))];
  const categoryOptions = modelCategories.map(c => ({ id: c.id, label: c.label }));

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 py-12 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3">
            <span className="gradient-text">模型价格</span>对比
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            直观对比各 AI 模型的价格、性能、上下文窗口等关键指标
          </p>
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="搜索模型..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-background/50 border-border/30" />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="h-10 rounded-lg border border-border/30 bg-background/50 px-3 text-sm"
            >
              <option value="all">所有分类</option>
              {categoryOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button variant={sortBy === "price" ? "default" : "outline"} size="sm" onClick={() => setSortBy("price")} className="gap-1.5">
              <Trophy className="h-3.5 w-3.5" />按价格排序
            </Button>
            <Button variant={sortBy === "benchmark" ? "default" : "outline"} size="sm" onClick={() => setSortBy("benchmark")} className="gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />按性能排序
            </Button>
            <Button variant={sortBy === "context" ? "default" : "outline"} size="sm" onClick={() => setSortBy("context")} className="gap-1.5">
              <Zap className="h-3.5 w-3.5" />按上下文排序
            </Button>
          </div>
        </div>

        <Card className="border-border/30 bg-card/20 backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/30 hover:bg-transparent">
                  <TableHead className="w-[200px]">模型</TableHead>
                  <TableHead>提供商</TableHead>
                  <TableHead>输入价格</TableHead>
                  <TableHead>输出价格</TableHead>
                  <TableHead>上下文</TableHead>
                  <TableHead>多模态</TableHead>
                  <TableHead className="min-w-[160px]">免费额度</TableHead>
                  <TableHead className="text-right">评分</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedModels.map((model) => {
                  const priceNum = (() => {
                    const match = getPriceInput(model.pricing).match(/[\d.]+/);
                    return match ? parseFloat(match[0]) : 0;
                  })();
                  const isCheap = priceNum < 1;
                  const isExpensive = priceNum > 10;
                  const ft = getFreeTierTag(model.freeTier || "无");

                  return (
                    <TableRow key={model.id} className="border-border/20">
                      <TableCell className="font-medium">
                        <a href={`/models/${model.slug}`} className="hover:text-blue-400 transition-colors">{model.name}</a>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-background/20 text-xs">{model.provider}</Badge>
                      </TableCell>
                      <TableCell className={isCheap ? "text-green-400" : isExpensive ? "text-red-400" : ""}>
                        <span className="font-mono text-sm">{getPriceInput(model.pricing)}</span>
                      </TableCell>
                      <TableCell className={isCheap ? "text-green-400" : isExpensive ? "text-red-400" : ""}>
                        <span className="font-mono text-sm">{getPriceOutput(model.pricing) || "-"}</span>
                      </TableCell>
                      <TableCell className="text-sm">{model.contextWindow}</TableCell>
                      <TableCell>
                        {model.multimodal ? (
                          <Badge variant="success" className="text-xs">支持</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {model.freeTier && model.freeTier !== "无" ? (
                          <div className="group relative">
                            <Badge variant="info" className="text-xs cursor-help">
                              <Sparkles className="h-3 w-3 mr-1" />
                              {formatFreeTier(ft.tag)}
                            </Badge>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                              <div className="bg-foreground text-background text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl max-w-[280px] break-words">
                                {ft.full}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-foreground rotate-45" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">无</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {model.benchmarkScore ? (
                          <span className={`font-bold ${model.benchmarkScore >= 90 ? "text-yellow-400" : model.benchmarkScore >= 80 ? "text-blue-400" : "text-muted-foreground"}`}>
                            {model.benchmarkScore}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card className="border-border/30 bg-card/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                <h3 className="font-semibold">最便宜输入价格</h3>
              </div>
              <p className="text-2xl font-bold text-green-400">
                {(() => {
                  let min = models[0];
                  models.forEach(m => {
                    const match = getPriceInput(m.pricing).match(/[\d.]+/);
                    const val = match ? parseFloat(match[0]) : Infinity;
                    const minMatch = getPriceInput(min.pricing).match(/[\d.]+/);
                    const minVal = minMatch ? parseFloat(minMatch[0]) : Infinity;
                    if (val < minVal) min = m;
                  });
                  return min.name;
                })()}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {(() => {
                  let min = models[0];
                  models.forEach(m => {
                    const match = getPriceInput(m.pricing).match(/[\d.]+/);
                    const val = match ? parseFloat(match[0]) : Infinity;
                    const minMatch = getPriceInput(min.pricing).match(/[\d.]+/);
                    const minVal = minMatch ? parseFloat(minMatch[0]) : Infinity;
                    if (val < minVal) min = m;
                  });
                  return getPriceInput(min.pricing);
                })()}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/30 bg-card/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="h-5 w-5 text-blue-400" />
                <h3 className="font-semibold">最高评分</h3>
              </div>
              <p className="text-2xl font-bold text-blue-400">
                {(() => {
                  let max = models[0];
                  models.forEach(m => {
                    if ((m.benchmarkScore || 0) > (max.benchmarkScore || 0)) max = m;
                  });
                  return max.name;
                })()}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                评分: {(() => {
                  let max = models[0];
                  models.forEach(m => {
                    if ((m.benchmarkScore || 0) > (max.benchmarkScore || 0)) max = m;
                  });
                  return max.benchmarkScore;
                })()}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/30 bg-card/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="h-5 w-5 text-purple-400" />
                <h3 className="font-semibold">最大上下文</h3>
              </div>
              <p className="text-2xl font-bold text-purple-400">
                {(() => {
                  let max = models[0];
                  models.forEach(m => {
                    const parseContext = (c: string) => {
                      const match = c.match(/(\d+)/);
                      return match ? parseInt(match[0]) : 0;
                    };
                    if (parseContext(m.contextWindow) > parseContext(max.contextWindow)) max = m;
                  });
                  return max.name;
                })()}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {(() => {
                  let max = models[0];
                  models.forEach(m => {
                    const parseContext = (c: string) => {
                      const match = c.match(/(\d+)/);
                      return match ? parseInt(match[0]) : 0;
                    };
                    if (parseContext(m.contextWindow) > parseContext(max.contextWindow)) max = m;
                  });
                  return max.contextWindow;
                })()}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

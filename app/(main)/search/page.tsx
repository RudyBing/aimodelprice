"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { models, type AIModel } from "@/data/models";
import { PriceComparisonCard } from "@/components/aceternity/price-comparison-card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Search, X, Zap, Palette, Video, Mic, Code2, Sparkles, Globe, Filter, TrendingUp, Clock } from "lucide-react";

const categoryIcons: Record<string, React.ReactNode> = {
  text: <Zap className="h-4 w-4" />,
  image: <Palette className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  audio: <Mic className="h-4 w-4" />,
  code: <Code2 className="h-4 w-4" />,
  multimodal: <Sparkles className="h-4 w-4" />,
  "open-source": <Globe className="h-4 w-4" />,
};

function getPricingInput(pricing: any): string {
  if (Array.isArray(pricing)) return pricing[0]?.input || "";
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
    const catMap: Record<string, string> = {
      text: "文本", image: "图像", video: "视频",
      audio: "音频", code: "代码", multimodal: "多模态", "open-source": "开源",
    };
    if (catMap[m.category]?.includes(q)) return true;
    if (getPricingInput(m.pricing).toLowerCase().includes(q)) return true;
    return false;
  });
}

function SearchPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeProvider, setActiveProvider] = useState("all");

  const providers = [...new Set(models.map((m) => m.provider))].sort();

  const results = useMemo(() => {
    let matched = searchModels(query);
    if (activeCategory !== "all") matched = matched.filter((m) => m.category === activeCategory);
    if (activeProvider !== "all") matched = matched.filter((m) => m.provider === activeProvider);
    return matched;
  }, [query, activeCategory, activeProvider]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const clearSearch = () => { setQuery(""); setActiveCategory("all"); setActiveProvider("all"); router.push("/"); };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 py-12 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <form onSubmit={handleSubmit} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="搜索 AI 模型、提供商、功能..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 pr-12 h-14 text-lg bg-background/50 border-border/30 focus:border-primary/50 rounded-xl"
              autoFocus
            />
            {query && (
              <button type="button" onClick={clearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted/50">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            )}
          </form>
        </div>

        {query.trim() && (
          <div className="mb-6">
            <p className="text-muted-foreground">
              搜索 <span className="text-foreground font-medium">&quot;{query}&quot;</span> 的结果：<span className="text-foreground font-bold ml-1">{results.length}</span> 个模型
            </p>
          </div>
        )}

        {query.trim() && results.length > 0 && (
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />筛选：
            </div>
            <div className="flex flex-wrap gap-2">
              <select value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)} className="h-8 rounded-lg border border-border/30 bg-background/50 px-3 text-sm">
                <option value="all">所有分类</option>
                {Object.keys(categoryIcons).map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
              </select>
              <select value={activeProvider} onChange={(e) => setActiveProvider(e.target.value)} className="h-8 rounded-lg border border-border/30 bg-background/50 px-3 text-sm">
                <option value="all">所有提供商</option>
                {providers.map((p) => (<option key={p} value={p}>{p}</option>))}
              </select>
              {(activeCategory !== "all" || activeProvider !== "all") && (
                <Button variant="ghost" size="sm" onClick={() => { setActiveCategory("all"); setActiveProvider("all"); }} className="text-xs">清除筛选</Button>
              )}
            </div>
          </div>
        )}

        {!query.trim() && (
          <Card className="border-border/30 bg-card/20 backdrop-blur-sm mb-8">
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4" />热门搜索
              </h3>
              <div className="flex flex-wrap gap-2">
                {["GPT", "Claude", "Gemini", "Midjourney", "DeepSeek", "Sora", "Flux", "Llama"].map((term) => (
                  <Button key={term} variant="outline" size="sm" onClick={() => { setQuery(term); router.push(`/search?q=${encodeURIComponent(term)}`); }}>
                    <Search className="h-3.5 w-3.5 mr-1" />{term}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {query.trim() && results.length === 0 && (
          <div className="text-center py-20">
            <Search className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">未找到匹配结果</h3>
            <p className="text-muted-foreground mb-6">试试其他关键词，比如 "GPT"、"Claude"、"图像生成"</p>
            <Button onClick={clearSearch} variant="outline">清除搜索</Button>
          </div>
        )}

        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((model, i) => (
              <PriceComparisonCard key={model.id} model={model} index={i} />
            ))}
          </div>
        )}

        {!query.trim() && (
          <>
            <Separator className="my-8 border-border/30" />
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-400" />按分类浏览
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(categoryIcons).map(([key, icon]) => {
                  const count = models.filter((m) => m.category === key).length;
                  return (
                    <Button key={key} variant="outline" className="h-auto py-4 flex-col gap-2 justify-start hover:bg-primary/10 hover:border-primary/30" onClick={() => router.push("/models")}>
                      <span className="text-blue-400">{icon}</span>
                      <span className="text-sm font-medium">{key}</span>
                      <span className="text-xs text-muted-foreground">{count} 个模型</span>
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
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center"><p className="text-muted-foreground">加载中...</p></div>}>
      <SearchPageInner />
    </Suspense>
  );
}

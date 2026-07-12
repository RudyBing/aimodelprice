"use client";

import { useState } from "react";
import { models, modelCategories, type ModelCategory } from "@/data/models";
import { PriceComparisonCard } from "@/components/aceternity/price-comparison-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Search, Cpu, Zap, Palette, Video, Mic, Code2, Sparkles, Globe } from "lucide-react";

const categoryIcons: Record<ModelCategory, React.ReactNode> = {
  text: <Zap className="h-4 w-4" />,
  image: <Palette className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  audio: <Mic className="h-4 w-4" />,
  code: <Code2 className="h-4 w-4" />,
  multimodal: <Sparkles className="h-4 w-4" />,
  "open-source": <Globe className="h-4 w-4" />,
};

export default function ModelsPage() {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<ModelCategory | "all">("all");
  const [filterProvider, setFilterProvider] = useState<string>("all");

  const providers = [...new Set(models.map((m) => m.provider))];

  const filteredModels = models.filter((m) => {
    const matchSearch =
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.provider.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === "all" || m.category === filterCategory;
    const matchProvider = filterProvider === "all" || m.provider === filterProvider;
    return matchSearch && matchCategory && matchProvider;
  });

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 py-12 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3">
            全部<span className="gradient-text">AI 模型</span>
          </h1>
          <p className="text-muted-foreground">
            共收录 {models.length} 个模型，来自 {providers.length} 家提供商
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索模型名称、提供商或描述..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background/50 border-border/30"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterProvider}
                onChange={(e) => setFilterProvider(e.target.value)}
                className="h-10 rounded-lg border border-border/30 bg-background/50 px-3 text-sm text-muted-foreground"
              >
                <option value="all">所有提供商</option>
                {providers.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <Separator className="border-border/30" />

          <Tabs value={filterCategory} onValueChange={(v) => setFilterCategory(v as ModelCategory | "all")} className="w-full">
            <TabsList className="bg-background/20 border border-border/30 flex flex-wrap justify-start">
              <TabsTrigger value="all" className="gap-1.5">
                <Cpu className="h-3.5 w-3.5" />全部
              </TabsTrigger>
              {modelCategories.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.id} className="gap-1.5">
                  {categoryIcons[cat.id]}{cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            找到 <span className="text-foreground font-medium">{filteredModels.length}</span> 个模型
          </p>
        </div>

        {filteredModels.length === 0 ? (
          <div className="text-center py-20">
            <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">没有找到匹配的模型</p>
            <Button variant="link" onClick={() => { setSearch(""); setFilterCategory("all"); setFilterProvider("all"); }}>
              清除筛选
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModels.map((model, i) => (
              <PriceComparisonCard key={model.id} model={model} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

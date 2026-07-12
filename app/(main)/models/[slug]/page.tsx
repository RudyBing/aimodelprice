"use client";

import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { models, getModelBySlug } from "@/data/models";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, ExternalLink, Sparkles, Zap, Clock,
  Layers, CheckCircle2, AlertCircle, BarChart3, Globe,
} from "lucide-react";

function getPricingInput(pricing: any): string {
  if (Array.isArray(pricing)) return pricing[0]?.input || "";
  return pricing.input;
}

function getPricingOutput(pricing: any): string {
  if (Array.isArray(pricing)) return pricing[0]?.output || "";
  return pricing.output;
}

function getPricingUnit(pricing: any): string {
  if (Array.isArray(pricing)) return pricing[0]?.unit || "";
  return pricing.unit || "";
}

export default function ModelDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const model = getModelBySlug(slug);

  if (!model) {
    notFound();
  }

  const relatedModels = models
    .filter((m) => m.category === model.category && m.id !== model.id)
    .slice(0, 4);

  const providerColors: Record<string, string> = {
    OpenAI: "from-orange-500 to-red-500",
    Anthropic: "from-orange-400 to-amber-500",
    Google: "from-blue-500 to-green-500",
    Meta: "from-blue-600 to-blue-800",
    Alibaba: "from-orange-600 to-red-600",
    DeepSeek: "from-indigo-500 to-purple-600",
    "Black Forest Labs": "from-purple-500 to-pink-500",
    Stability: "from-green-500 to-teal-500",
    Mistral: "from-blue-400 to-cyan-500",
    Kuaishou: "from-orange-500 to-yellow-500",
    Zhipu: "from-violet-500 to-purple-600",
  };

  const color = providerColors[model.provider] || "from-gray-500 to-gray-600";

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 py-12 px-4">
      <div className="mx-auto max-w-5xl">
        <Link href="/models">
          <Button variant="ghost" size="sm" className="gap-2 mb-8 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            返回模型列表
          </Button>
        </Link>

        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <Badge variant="outline" className="bg-background/30 backdrop-blur-sm">
              <span className={cn("inline-block w-2 h-2 rounded-full mr-1 bg-gradient-to-r", color)} />
              {model.provider}
            </Badge>
            <Badge variant="secondary" className="bg-background/30 backdrop-blur-sm">
              {model.released && `发布于 ${model.released}`}
            </Badge>
            {model.updatedAt && (
              <Badge variant="outline" className="text-xs bg-background/20">
                更新于 {model.updatedAt}
              </Badge>
            )}
          </div>

          <h1 className="text-4xl font-bold mb-3">{model.name}</h1>
          <p className="text-lg text-muted-foreground">{model.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/30 bg-card/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  价格信息
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-background/30">
                    <span className="text-muted-foreground">输入价格</span>
                    <span className="font-mono font-bold text-foreground">{getPricingInput(model.pricing)}</span>
                  </div>
                  {getPricingOutput(model.pricing) && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-background/30">
                      <span className="text-muted-foreground">输出价格</span>
                      <span className="font-mono font-bold text-foreground">{getPricingOutput(model.pricing)}</span>
                    </div>
                  )}
                  {getPricingUnit(model.pricing) && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-background/30">
                      <span className="text-muted-foreground">计费单位</span>
                      <span className="text-foreground">{getPricingUnit(model.pricing)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/30 bg-card/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Layers className="h-5 w-5 text-blue-400" />
                  核心优势
                </h2>
                <div className="flex flex-wrap gap-2">
                  {model.strengths.map((s) => (
                    <Badge key={s} variant="outline" className="bg-background/20">
                      <CheckCircle2 className="h-3 w-3 mr-1 text-green-400" />
                      {s}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/30 bg-card/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-400" />
                  模型规格
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-background/30">
                    <div className="text-sm text-muted-foreground mb-1">上下文窗口</div>
                    <div className="font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-400" />
                      {model.contextWindow}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-background/30">
                    <div className="text-sm text-muted-foreground mb-1">多模态</div>
                    <div className="font-semibold flex items-center gap-2">
                      {model.multimodal ? (
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      {model.multimodal ? "支持" : "不支持"}
                    </div>
                  </div>
                  {model.benchmarkScore && (
                    <div className="p-3 rounded-lg bg-background/30">
                      <div className="text-sm text-muted-foreground mb-1">基准评分</div>
                      <div className="font-semibold flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-purple-400" />
                        {model.benchmarkScore}/100
                      </div>
                    </div>
                  )}
                  {model.freeTier && model.freeTier !== "无" && (
                    <div className="p-3 rounded-lg bg-background/30">
                      <div className="text-sm text-muted-foreground mb-1">免费额度</div>
                      <div className="font-semibold flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-yellow-400" />
                        {model.freeTier}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border/30 bg-card/30 backdrop-blur-sm sticky top-24">
              <CardContent className="p-6 space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">提供商</div>
                  <div className="font-semibold">{model.provider}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">类别</div>
                  <Badge variant="outline" className="bg-background/20">{model.category}</Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">官网</div>
                  <Button className="w-full gap-2" asChild>
                    <a href={model.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />访问官网
                    </a>
                  </Button>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">API 文档</div>
                  <Button variant="outline" className="w-full gap-2" asChild>
                    <a href={model.url} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4" />查看文档
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {relatedModels.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">相关模型</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedModels.map((m) => (
                <Link key={m.id} href={`/models/${m.slug}`}>
                  <Card className="border-border/30 bg-card/30 backdrop-blur-sm hover:border-primary/30 transition-all h-full">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm">{m.name}</span>
                        <Badge variant="secondary" className="text-xs">{m.provider}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{m.description}</p>
                      <div className="mt-2 text-xs font-mono text-blue-400">{getPricingInput(m.pricing)}</div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

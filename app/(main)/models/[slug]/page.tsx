'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { models, getModelBySlug } from '@/data/models';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, ExternalLink, Sparkles, Zap, Clock,
  Layers, CheckCircle2, AlertCircle, BarChart3, Globe,
} from 'lucide-react';

function getPricingInput(pricing: any): string {
  if (Array.isArray(pricing)) return pricing[0]?.input || '';
  return pricing.input;
}

function getPricingOutput(pricing: any): string {
  if (Array.isArray(pricing)) return pricing[0]?.output || '';
  return pricing.output;
}

const providerAccentClass: Record<string, string> = {
  'OpenAI': 'provider-accent-openai',
  'Anthropic': 'provider-accent-anthropic',
  'Google': 'provider-accent-google',
  'Meta': 'provider-accent-meta',
  'Alibaba': 'provider-accent-alibaba',
  'DeepSeek': 'provider-accent-deepseek',
  'Black Forest Labs': 'provider-accent-blackforest',
  'Stability': 'provider-accent-stability',
  'Mistral': 'provider-accent-mistral',
  'Kuaishou': 'provider-accent-kuaishou',
  'Zhipu': 'provider-accent-zhipu',
};

const providerDotClass: Record<string, string> = {
  'OpenAI': 'bg-[hsl(var(--provider-openai))]',
  'Anthropic': 'bg-[hsl(var(--provider-anthropic))]',
  'Google': 'bg-[hsl(var(--provider-google))]',
  'Meta': 'bg-[hsl(var(--provider-meta))]',
  'Alibaba': 'bg-[hsl(var(--provider-alibaba))]',
  'DeepSeek': 'bg-[hsl(var(--provider-deepseek))]',
  'Black Forest Labs': 'bg-[hsl(var(--provider-blackforest))]',
  'Stability': 'bg-[hsl(var(--provider-stability))]',
  'Mistral': 'bg-[hsl(var(--provider-mistral))]',
  'Kuaishou': 'bg-[hsl(var(--provider-kuaishou))]',
  'Zhipu': 'bg-[hsl(var(--provider-zhipu))]',
};

export default function ModelDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const model = getModelBySlug(slug);

  if (!model) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">模型未找到</h1>
          <p className="text-muted-foreground mb-6">该模型不存在或已被移除</p>
          <Button asChild>
            <Link href="/models">返回模型列表</Link>
          </Button>
        </div>
      </div>
    );
  }

  const relatedModels = models
    .filter((m) => m.category === model.category && m.id !== model.id)
    .slice(0, 4);

  const accentClass = providerAccentClass[model.provider] || '';
  const dotClass = providerDotClass[model.provider] || 'bg-gray-500';

  return (
    <div className="relative min-h-screen py-12 px-4">
      <div className="mx-auto max-w-5xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-fast">首页</Link>
          <span>/</span>
          <Link href="/models" className="hover:text-foreground transition-fast">模型列表</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{model.name}</span>
        </div>

        {/* Back button */}
        <Link href="/models" className="inline-block mb-8">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground h-8">
            <ArrowLeft className="h-3.5 w-3.5" />
            返回模型列表
          </Button>
        </Link>

        {/* Model header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/60 border border-border/30 text-xs')}>
              <span className={cn('inline-block w-2 h-2 rounded-full', dotClass)} />
              <span className="font-medium">{model.provider}</span>
            </div>
            {model.released && (
              <Badge variant="secondary" className="text-xs h-5">
                发布于 {model.released}
              </Badge>
            )}
            {model.updatedAt && (
              <Badge variant="outline" className="text-xs h-5 bg-secondary/30">
                更新于 {model.updatedAt}
              </Badge>
            )}
          </div>

          <h1 className="text-3xl font-bold tracking-tight mb-2">{model.name}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">{model.description}</p>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Pricing */}
            <Card className={cn('border-border/40 bg-card/60', accentClass, '[border-inline-start-width:3px]')}>
              <CardContent className="p-5">
                <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  价格信息
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-md bg-secondary/50 border border-border/30">
                    <div className="text-xs text-muted-foreground mb-1">输入价格</div>
                    <div className="font-mono text-sm font-semibold">{getPricingInput(model.pricing)}</div>
                  </div>
                  <div className="p-3 rounded-md bg-secondary/50 border border-border/30">
                    <div className="text-xs text-muted-foreground mb-1">输出价格</div>
                    <div className="font-mono text-sm font-semibold">{getPricingOutput(model.pricing)}</div>
                  </div>
                  <div className="p-3 rounded-md bg-secondary/50 border border-border/30">
                    <div className="text-xs text-muted-foreground mb-1">上下文窗口</div>
                    <div className="font-mono text-sm font-semibold">{model.contextWindow}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Capabilities */}
            <Card className="border-border/40 bg-card/60">
              <CardContent className="p-5">
                <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-blue-400" />
                  能力概览
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-md bg-secondary/50 border border-border/30">
                    <div className="text-xs text-muted-foreground mb-1">多模态</div>
                    <div className="font-semibold text-sm flex items-center gap-1.5">
                      {model.multimodal ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      {model.multimodal ? '支持' : '不支持'}
                    </div>
                  </div>
                  {model.benchmarkScore && (
                    <div className="p-3 rounded-md bg-secondary/50 border border-border/30">
                      <div className="text-xs text-muted-foreground mb-1">基准评分</div>
                      <div className="font-semibold text-sm flex items-center gap-1.5">
                        <BarChart3 className="h-3.5 w-3.5 text-purple-400" />
                        {model.benchmarkScore}/100
                      </div>
                    </div>
                  )}
                  {model.freeTier && model.freeTier !== '无' && (
                    <div className="p-3 rounded-md bg-secondary/50 border border-border/30">
                      <div className="text-xs text-muted-foreground mb-1">免费额度</div>
                      <div className="font-semibold text-sm flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
                        {model.freeTier}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Strengths */}
            <Card className="border-border/40 bg-card/60">
              <CardContent className="p-5">
                <h2 className="text-base font-semibold mb-3">擅长领域</h2>
                <div className="flex flex-wrap gap-2">
                  {model.strengths.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs px-2.5 py-1">
                      {s}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">
            <Card className={cn('border-border/40 bg-card/60 sticky top-20', accentClass, '[border-inline-start-width:3px]')}>
              <CardContent className="p-5 space-y-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">提供商</div>
                  <div className="font-semibold text-sm flex items-center gap-1.5">
                    <span className={cn('inline-block w-2 h-2 rounded-full', dotClass)} />
                    {model.provider}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">类别</div>
                  <Badge variant="outline" className="bg-secondary/40 text-xs">
                    {model.category}
                  </Badge>
                </div>
                <div className="pt-2 space-y-2">
                  <Button className="w-full gap-2 h-9" asChild>
                    <a href={model.url} target="_blank" rel="noopener noreferrer" aria-label={'访问 ' + model.name + ' 官网'}>
                      <ExternalLink className="h-3.5 w-3.5" />访问官网
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full gap-2 h-9" asChild>
                    <a href={model.url} target="_blank" rel="noopener noreferrer" aria-label={'查看 ' + model.name + ' 文档'}>
                      <Globe className="h-3.5 w-3.5" />查看文档
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related models */}
        {relatedModels.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">相关模型</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {relatedModels.map((m) => (
                <Link key={m.id} href={`/models/${m.slug}`}>
                  <Card className="border-border/30 bg-card/40 hover:bg-secondary/40 hover:border-border/50 transition-normal h-full focus-within:ring-2 focus-within:ring-primary rounded-lg">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm">{m.name}</span>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{m.provider}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{m.description}</p>
                      <div className="text-xs font-mono text-blue-400">{getPricingInput(m.pricing)}</div>
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

function getPricingUnit(pricing: any): string {
  if (Array.isArray(pricing)) return pricing[0]?.unit || '';
  return pricing.unit || '';
}
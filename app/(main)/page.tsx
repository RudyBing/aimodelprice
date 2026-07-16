import Link from 'next/link';
import { models, modelCategories, type AIModel } from '@/data/models';
import { categoryIcons, categoryLabels } from '@/lib/categories';
import { getPricingInput, getPriceInputNum } from '@/lib/pricing';
import { PriceComparisonCard } from '@/components/aceternity/price-comparison-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  TrendingDown, BarChart3, Shield, ArrowRight, Cpu, Search, Sparkles, Globe,
} from 'lucide-react';



export default function Home() {
  const featuredModels = models.slice(0, 6);


  const cheapestModel = models.reduce((prev, curr) =>
    getPriceInputNum(curr.pricing) < getPriceInputNum(prev.pricing) ? curr : prev
  );

  const strongestModel = models.reduce((prev, curr) =>
    (curr.benchmarkScore || 0) > (prev.benchmarkScore || 0) ? curr : prev
  );

  const longestContext = models.reduce((prev, curr) => {
    const parseCtx = (m: AIModel) => {
      const match = m.contextWindow.match(/(\d+)/);
      return match ? parseInt(match[0]) : 0;
    };
    return parseCtx(curr) > parseCtx(prev) ? curr : prev;
  });

  const providerCount = new Set(models.map((m) => m.provider)).size;

  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-28 pb-16 px-4 overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent pointer-events-none" />

        <div className="mx-auto max-w-7xl text-center relative">
          <Badge variant="premium" className="mb-6 px-3 py-1 text-xs animate-fade-in-up">
            <Sparkles className="w-3 h-3 mr-1" />
            2026 年 AI 模型价格数据库
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }} id="hero-heading">
            <span className="text-foreground">AI 模型价格</span>{' '}
            <span className="gradient-text-hero">对比平台</span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            一站式对比主流 AI 模型的价格、性能、上下文窗口
          </p>

          <div className="max-w-md mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <form action="/search" method="GET" className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="q"
                placeholder="搜索模型、厂商..."
                className="pl-10 h-11 bg-secondary border-border/50 rounded-lg text-sm"
                aria-label="搜索模型"
              />
            </form>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-16 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Button asChild size="lg" className="gap-2 h-11 px-6 glow-primary">
              <Link href="/models">
                浏览所有模型
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2 h-11 px-6">
              <Link href="/compare">
                <BarChart3 className="h-4 w-4" />
                价格对比
              </Link>
            </Button>
          </div>

          {/* Stats bar */}
          <div className="max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="inline-flex items-center gap-6 px-6 py-3 rounded-full bg-secondary/60 border border-border/40 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-blue-400" />
                {models.length} 个模型
              </span>
              <span className="w-px h-3 bg-border" />
              <span className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-blue-400" />
                {providerCount} 家厂商
              </span>
              <span className="w-px h-3 bg-border" />
              <span className="flex items-center gap-1.5">
                <TrendingDown className="h-3.5 w-3.5 text-blue-400" />
                每日更新
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 px-4" aria-labelledby="categories-heading">
        <div className="mx-auto max-w-7xl">
          <h2 id="categories-heading" className="text-lg font-semibold mb-5 text-center">
            按分类浏览
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
            {modelCategories.map((cat) => {
              const count = models.filter((m) => m.category === cat.id).length;
              return (
                <Link
                  key={cat.id}
                  href="/models"
                  className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border/30 bg-card/40 hover:bg-secondary/60 hover:border-border/60 transition-normal cursor-pointer group focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label={`浏览  -  个模型`}
                >
                  <div className="text-muted-foreground group-hover:text-foreground transition-fast">
                    {categoryIcons[cat.id]}
                  </div>
                  <span className="text-xs font-medium">{cat.label}</span>
                  <span className="text-[10px] text-muted-foreground">{count} 个</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Models */}
      <section className="py-12 px-4" aria-labelledby="featured-heading">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <h2 id="featured-heading" className="text-lg font-semibold">热门模型</h2>
            <Button variant="ghost" size="sm" className="gap-1 text-sm h-8" asChild>
              <Link href="/models">
                查看全部
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {featuredModels.map((model, i) => (
              <PriceComparisonCard key={model.id} model={model} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Insights */}
      <section className="py-12 px-4" aria-labelledby="insights-heading">
        <div className="mx-auto max-w-7xl">
          <h2 id="insights-heading" className="text-lg font-semibold mb-6 text-center">价格洞察</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-3xl mx-auto">
            <div className="rounded-lg border border-border/40 bg-card/50 p-5 text-center">
              <TrendingDown className="h-5 w-5 text-green-400 mx-auto mb-2" />
              <div className="text-xs text-muted-foreground mb-1">最便宜输入价格</div>
              <div className="text-lg font-bold">{cheapestModel.name}</div>
              <div className="text-xs font-mono text-green-400 mt-1">
                {getPricingInput(cheapestModel.pricing)}
              </div>
            </div>
            <div className="rounded-lg border border-border/40 bg-card/50 p-5 text-center">
              <Shield className="h-5 w-5 text-blue-400 mx-auto mb-2" />
              <div className="text-xs text-muted-foreground mb-1">最高性能评分</div>
              <div className="text-lg font-bold">{strongestModel.name}</div>
              <div className="text-xs font-mono text-blue-400 mt-1">
                评分 {strongestModel.benchmarkScore}/100
              </div>
            </div>
            <div className="rounded-lg border border-border/40 bg-card/50 p-5 text-center">
              <Sparkles className="h-5 w-5 text-purple-400 mx-auto mb-2" />
              <div className="text-xs text-muted-foreground mb-1">最长上下文</div>
              <div className="text-lg font-bold">{longestContext.name}</div>
              <div className="text-xs font-mono text-purple-400 mt-1">
                {longestContext.contextWindow}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="py-16 px-4" aria-labelledby="why-heading">
        <div className="mx-auto max-w-7xl">
          <h2 id="why-heading" className="text-lg font-semibold mb-8 text-center">为什么选择我们</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Shield, title: '数据准确', desc: '每日更新价格数据，确保信息准确可靠' },
              { icon: TrendingDown, title: '全面对比', desc: '多维度对比价格、性能、上下文窗口' },
              { icon: Sparkles, title: '发现好模型', desc: '帮助你找到最合适且最具性价比的模型' },
            ].map((feature) => (
              <div key={feature.title} className="rounded-lg border border-border/30 bg-card/30 p-6 text-center">
                <feature.icon className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                <h3 className="text-sm font-semibold mb-1.5">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
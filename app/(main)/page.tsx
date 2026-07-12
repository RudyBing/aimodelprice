import { ParticleBackground, FloatingOrbs, GradientBackground, Spotlight } from "@/components/aceternity/particle-background";
import { GlowText } from "@/components/aceternity/glow-text";
import { TypingEffect } from "@/components/aceternity/typing-effect";
import { PriceComparisonCard } from "@/components/aceternity/price-comparison-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { modelCategories, models } from "@/data/models";
import {
  Zap, TrendingDown, Sparkles, Globe, BarChart3, Shield,
  ArrowRight, Cpu, Palette, Video, Mic, Code2,
} from "lucide-react";

export default function Home() {
  const stats = [
    { label: "收录模型", value: models.length.toString(), icon: Cpu },
    { label: "模型提供商", value: new Set(models.map((m) => m.provider)).size.toString(), icon: Globe },
    { label: "分类覆盖", value: modelCategories.length.toString(), icon: BarChart3 },
    { label: "价格更新", value: "每日", icon: TrendingDown },
  ];

  const featuredModels = models.slice(0, 6);

  const categoryIcons: Record<string, React.ReactNode> = {
    text: <Zap className="h-5 w-5" />,
    image: <Palette className="h-5 w-5" />,
    video: <Video className="h-5 w-5" />,
    audio: <Mic className="h-5 w-5" />,
    code: <Code2 className="h-5 w-5" />,
    multimodal: <Sparkles className="h-5 w-5" />,
    "open-source": <Globe className="h-5 w-5" />,
  };

  return (
    <GradientBackground>
      <Spotlight />
      <ParticleBackground particleCount={60} speed={0.3} />
      <FloatingOrbs />

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-4">
        <div className="mx-auto max-w-7xl text-center">
          <Badge variant="premium" className="mb-6 px-4 py-1.5 text-sm">
            <Sparkles className="w-4 h-4 mr-1" />
            2025 年 AI 模型价格数据库
          </Badge>

          <GlowText
            text="AI 模型价格"
            variant="rainbow"
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-4"
          />
          <GlowText
            text="对比站"
            variant="gold"
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8"
          />

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
            一站式对比主流 AI 模型的价格、性能、上下文窗口
          </p>

          <TypingEffect
            phrases={[
              "OpenAI o3 Pro — $25/1M tokens",
              "Claude Sonnet 4 — $3/1M tokens",
              "Gemini 2.5 Flash — $0.15/1M tokens",
              "DeepSeek Coder V3 — $0.10/1M tokens",
            ]}
            typingSpeed={60}
            deletingSpeed={30}
            pauseDuration={1500}
            className="text-sm md:text-base text-blue-300 mb-10 font-mono"
          />

          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Button size="lg" className="gap-2 glow-blue">
              浏览所有模型
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              价格对比
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="border-border/30 bg-card/30 backdrop-blur-sm">
                  <CardContent className="p-4 text-center">
                    <Icon className="h-5 w-5 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="relative z-10 py-16 px-4">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-center mb-8">
            按<span className="gradient-text">分类</span>浏览
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {modelCategories.map((cat) => (
              <Card
                key={cat.id}
                className="border-border/30 bg-card/30 backdrop-blur-sm hover:border-primary/30 hover:bg-card/50 transition-all cursor-pointer group"
              >
                <CardContent className="p-4 text-center">
                  <div className="text-blue-400 mb-2 group-hover:scale-110 transition-transform">
                    {categoryIcons[cat.id]}
                  </div>
                  <div className="text-sm font-medium">{cat.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {models.filter((m) => m.category === cat.id).length} 个模型
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Models */}
      <section className="relative z-10 py-16 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">
              热门<span className="gradient-text">模型</span>
            </h2>
            <Button variant="ghost" className="gap-1 text-sm">
              查看全部 <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredModels.map((model, i) => (
              <PriceComparisonCard key={model.id} model={model} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="relative z-10 py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-center mb-12">
            为什么选择<span className="gradient-text">我们</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "数据准确", desc: "每日更新价格数据，确保信息准确可靠" },
              { icon: TrendingDown, title: "全面对比", desc: "多维度对比价格、性能、上下文窗口" },
              { icon: Sparkles, title: "发现好模型", desc: "帮助你找到最适合且最具性价比的模型" },
            ].map((feature) => (
              <Card key={feature.title} className="border-border/30 bg-card/30 backdrop-blur-sm text-center">
                <CardContent className="pt-8">
                  <feature.icon className="h-10 w-10 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </GradientBackground>
  );
}

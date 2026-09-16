import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Zap, Globe, Clock, TrendingDown } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '关于我们 - AI Model Prices',
  description: '了解 AI Model Prices 平台的背景、使命和数据更新机制',
};

export default function AboutPage() {
  return (
    <div className="relative min-h-screen py-12 px-4">
      <div className="mx-auto max-w-3xl">
        {/* Back button */}
        <Link href="/" className="inline-block mb-8">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground h-8">
            <ArrowLeft className="h-3.5 w-3.5" />
            返回首页
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-10">
          <Badge variant="premium" className="mb-4 px-3 py-1 text-xs">
            <Zap className="w-3 h-3 mr-1" />
            关于我们
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight mb-4">关于 AI Model Prices</h1>
          <p className="text-muted-foreground leading-relaxed">
            AI Model Prices 是一站式 AI 模型价格对比平台，致力于帮助用户快速了解主流大模型的定价策略，找到最具性价比的 AI 解决方案。
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="rounded-lg border border-border/40 bg-card/50 p-5 text-center">
            <Globe className="h-5 w-5 text-blue-400 mx-auto mb-2" />
            <div className="text-xs text-muted-foreground mb-1">数据覆盖</div>
            <div className="text-lg font-bold">50+ 厂商</div>
            <div className="text-xs text-muted-foreground">全球主流 AI 模型提供商</div>
          </div>
          <div className="rounded-lg border border-border/40 bg-card/50 p-5 text-center">
            <Clock className="h-5 w-5 text-purple-400 mx-auto mb-2" />
            <div className="text-xs text-muted-foreground mb-1">更新频率</div>
            <div className="text-lg font-bold">每日更新</div>
            <div className="text-xs text-muted-foreground">保持数据时效性</div>
          </div>
          <div className="rounded-lg border border-border/40 bg-card/50 p-5 text-center">
            <TrendingDown className="h-5 w-5 text-green-400 mx-auto mb-2" />
            <div className="text-xs text-muted-foreground mb-1">价格追踪</div>
            <div className="text-lg font-bold">全面透明</div>
            <div className="text-xs text-muted-foreground">输入/输出价格一目了然</div>
          </div>
        </div>

        {/* Content sections */}
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold mb-3">我们的使命</h2>
            <p className="text-muted-foreground leading-relaxed">
              随着 AI 技术的快速发展，越来越多的模型选择涌现，价格和性能差异巨大。
              我们希望通过构建一个开放、透明的价格对比平台，帮助开发者、研究人员和企业在
              选择 AI 模型时做出更明智的决策。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">数据来源与更新</h2>
            <p className="text-muted-foreground leading-relaxed">
              我们的数据主要来自以下渠道：
            </p>
            <ul className="mt-3 space-y-2 text-muted-foreground text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                各厂商官方 API 文档和定价页面
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                公开的技术博客和产品公告
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                社区贡献和第三方评测数据
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              平台数据每日自动更新，并保留历史价格记录以便追踪降价趋势。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">覆盖范围</h2>
            <p className="text-muted-foreground leading-relaxed">
              我们收录了来自 OpenAI、Anthropic、Google、Meta、DeepSeek、阿里云、腾讯等
              全球主流厂商的 AI 模型数据，涵盖文本生成、多模态、代码辅助、图像生成等多种应用场景。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">联系我们</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              如果您发现数据有误、需要补充信息或有合作意向，欢迎通过以下方式联系我们：
            </p>
            <a
              href="mailto:binhu2023@gmail.com"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              binhu2023@gmail.com
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { Zap } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/30 bg-background/40 backdrop-blur-sm" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3" aria-label="AIModelPrices 首页">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-purple-600">
                <Zap className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-bold">
                AI<span className="text-blue-400">Model</span>Prices
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              一站式 AI 模型价格对比平台，帮你找到最具性价比的 AI 模型。
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">浏览</h4>
            <ul className="space-y-2 text-sm" role="list">
              <li><Link href="/models" className="text-muted-foreground hover:text-foreground transition-fast">模型列表</Link></li>
              <li><Link href="/compare" className="text-muted-foreground hover:text-foreground transition-fast">价格对比</Link></li>
              <li><Link href="/search" className="text-muted-foreground hover:text-foreground transition-fast">搜索</Link></li>
            </ul>
          </div>

          {/* Providers */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">热门提供商</h4>
            <ul className="space-y-2 text-sm" role="list">
              <li><Link href="/models" className="text-muted-foreground hover:text-foreground transition-fast">OpenAI</Link></li>
              <li><Link href="/models" className="text-muted-foreground hover:text-foreground transition-fast">Anthropic</Link></li>
              <li><Link href="/models" className="text-muted-foreground hover:text-foreground transition-fast">Google</Link></li>
              <li><Link href="/models" className="text-muted-foreground hover:text-foreground transition-fast">Meta</Link></li>
              <li><Link href="/models" className="text-muted-foreground hover:text-foreground transition-fast">DeepSeek</Link></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">关于</h4>
            <ul className="space-y-2 text-sm text-muted-foreground" role="list">
              <li>数据每日更新</li>
              <li>覆盖 30+ AI 模型</li>
              <li>11 家主要厂商</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/20 text-center text-xs text-muted-foreground">
          <p>© {currentYear} AIModelPrices. 数据仅供参考，实际价格以官方为准。</p>
        </div>
      </div>
    </footer>
  );
}
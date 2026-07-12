import Link from "next/link";
import { Zap, Github, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/30 bg-background/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-bold">
                AI<span className="text-blue-400">Model</span>Prices
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              一站式 AI 模型价格对比平台，帮你找到最具性价比的 AI 模型。
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">浏览</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/models" className="hover:text-foreground transition-colors">模型列表</Link></li>
              <li><Link href="/compare" className="hover:text-foreground transition-colors">价格对比</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">按分类</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">最近更新</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">提供商</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">OpenAI</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Anthropic</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Google</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Meta</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">DeepSeek</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">关于</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">关于我们</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">数据更新</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">提交模型</Link></li>
              <li>
                <div className="flex gap-3 mt-3">
                  <Github className="h-5 w-5 cursor-pointer hover:text-foreground transition-colors" />
                  <Twitter className="h-5 w-5 cursor-pointer hover:text-foreground transition-colors" />
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/30 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} AIModelPrices. 数据仅供参考，实际价格以官方为准。</p>
        </div>
      </div>
    </footer>
  );
}

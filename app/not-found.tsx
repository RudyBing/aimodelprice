import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Zap } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-20">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/60 border border-border/40 mb-6">
          <Zap className="h-7 w-7 text-muted-foreground" />
        </div>
        <h1 className="text-5xl font-bold mb-3">404</h1>
        <p className="text-lg text-muted-foreground mb-8">页面未找到</p>
        <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
          您访问的页面可能已被移除、更名或暂时不可用。
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild size="lg">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              返回首页
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/models">浏览模型</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, MessageSquare } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '联系我们 - AI Model Prices',
  description: '联系 AI Model Prices 团队，反馈数据问题或商务合作',
};

export default function ContactPage() {
  return (
    <div className="relative min-h-screen py-12 px-4">
      <div className="mx-auto max-w-2xl">
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
            <MessageSquare className="w-3 h-3 mr-1" />
            联系我们
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight mb-4">联系我们</h1>
          <p className="text-muted-foreground leading-relaxed">
            无论是数据纠错、功能建议还是商务合作，我们都非常乐意听到您的声音。
          </p>
        </div>

        {/* Contact methods */}
        <div className="space-y-4">
          {/* Email */}
          <div className="rounded-lg border border-border/40 bg-card/50 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">电子邮件</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  最快的联系方式，适用于数据反馈、功能建议和一般咨询。
                </p>
                <a
                  href="mailto:binhu2023@gmail.com"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  binhu2023@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* What we handle */}
        <div className="mt-8 rounded-lg border border-border/40 bg-card/50 p-6">
          <h3 className="font-semibold mb-4">我们能帮助您解决：</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>AI 模型价格数据有误或不完整，需要更正或补充</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>希望添加某个厂商或模型的价格信息</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>功能建议或产品体验反馈</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>商务合作、广告投放或数据授权</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>网站技术问题或报告 Bug</span>
            </li>
          </ul>
        </div>

        {/* Response time */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          我们通常会在 1-2 个工作日内回复您的邮件。
        </div>
      </div>
    </div>
  );
}

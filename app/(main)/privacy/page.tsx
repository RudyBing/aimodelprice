import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Shield } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '隐私政策 - AI Model Prices',
  description: 'AI Model Prices 隐私政策，了解我们如何收集和使用您的个人信息',
};

export default function PrivacyPage() {
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
          <Badge variant="secondary" className="mb-4 px-3 py-1 text-xs">
            <Shield className="w-3 h-3 mr-1" />
            法律声明
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight mb-4">隐私政策</h1>
          <p className="text-sm text-muted-foreground">
            最后更新日期：2026 年 9 月
          </p>
        </div>

        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed space-y-6">
          <section>
            <h2 className="text-foreground font-semibold text-base mb-2">1. 信息收集</h2>
            <p>
              本平台主要提供公开数据的展示服务。我们不会主动收集您的个人身份信息（如姓名、邮箱、
              电话号码等），除非您通过「联系我们」页面主动发送电子邮件给我们。
            </p>
            <p className="mt-2">
              当您发送邮件时，您的邮箱地址将根据电子邮件标准协议暴露给接收方（即本平台运营者），
              该信息仅用于回复您的咨询，不会被用于其他目的。
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold text-base mb-2">2. 日志数据</h2>
            <p>
              与大多数网站一样，本平台会收集浏览器自动发送的日志信息，包括：
            </p>
            <ul className="mt-2 space-y-1">
              <li>• 您的 IP 地址</li>
              <li>• 浏览器类型和版本</li>
              <li>• 访问日期和时间</li>
              <li>• 您浏览的页面</li>
              <li>• referrer URL</li>
            </ul>
            <p className="mt-2">
              上述信息仅用于分析网站使用趋势和优化用户体验，不会与个人身份关联。
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold text-base mb-2">3. Cookies</h2>
            <p>
              本平台不主动使用追踪 Cookie 或用户画像技术。您访问网站时使用的会话 Cookie
              （如导航状态）是网站正常运行所必需的，不会被用于跨站点追踪。
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold text-base mb-2">4. 第三方服务</h2>
            <p>
              本平台可能使用第三方分析或服务（如 Google Analytics、广告服务等），
              这些服务可能设有自己的 Cookie 和隐私政策。建议您查阅相关第三方服务的隐私声明。
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold text-base mb-2">5. 外部链接</h2>
            <p>
              本平台包含指向第三方网站的链接（如各厂商官网）。我们不对第三方网站的隐私 Practices
              负责，访问这些网站的风险由您自行承担。
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold text-base mb-2">6. 数据安全</h2>
            <p>
              我们采取合理的技术和管理措施来保护您的信息。但由于互联网的本质特性，
              我们无法保证数据传输和存储的绝对安全。
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold text-base mb-2">7. 未成年人保护</h2>
            <p>
              本平台面向公众开放，不对用户年龄作限制。如果您是未成年人，请在监护人指导下使用本服务。
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold text-base mb-2">8. 政策更新</h2>
            <p>
              我们可能会不时更新本隐私政策。重大变更将在本页面发布更新通知。
              如您继续使用本平台，即表示您接受更新后的隐私政策。
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold text-base mb-2">9. 联系我们</h2>
            <p>
              如果您对本隐私政策有任何疑问，请通过{' '}
              <Link href="mailto:binhu2023@gmail.com" className="text-primary hover:underline">
                binhu2023@gmail.com
              </Link>{' '}
              联系我们。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

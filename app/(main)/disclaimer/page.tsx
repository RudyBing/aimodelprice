import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '免责声明 - AI Model Prices',
  description: 'AI Model Prices 网站免责声明，阅读前请务必了解相关条款',
};

export default function DisclaimerPage() {
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
            <ShieldAlert className="w-3 h-3 mr-1" />
            法律声明
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight mb-4">免责声明</h1>
          <p className="text-sm text-muted-foreground">
            最后更新日期：2026 年 9 月
          </p>
        </div>

        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed space-y-6">
          <section>
            <h2 className="text-foreground font-semibold text-base mb-2">1. 数据性质说明</h2>
            <p>
              AI Model Prices（以下简称"本平台"）提供的所有 AI 模型价格、性能评分及相关数据
              仅供信息参考用途，不构成任何投资建议、采购建议或其他专业意见。
              本平台不对数据的准确性、完整性或时效性作出任何明示或暗示的保证。
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold text-base mb-2">2. 数据来源</h2>
            <p>
              本平台数据来源于各厂商官方公开的 API 文档、定价页面及公告，以及第三方技术博客
              和社区报道。虽然平台会尽力确保数据的准确性，但由于厂商定价调整频繁，
              部分数据可能存在滞后或与实际情况存在偏差。
            </p>
            <p className="mt-2">
              如您发现价格信息与官方渠道不一致，请以<strong className="text-foreground">厂商官方公布的信息为准</strong>。
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold text-base mb-2">3. 责任限制</h2>
            <p>
              在任何情况下，本平台及其运营方不对因使用或依赖本平台数据而导致的任何直接、间接、
              附带、特殊或后果性损害承担责任，包括但不限于利润损失、业务中断或数据丢失。
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold text-base mb-2">4. 第三方链接</h2>
            <p>
              本平台可能包含指向第三方网站的链接（如厂商官网、文档页面等）。这些链接仅为了方便用户，
              本平台不对第三方网站的内容、隐私政策或 Practices 负责。
              访问第三方链接的风险由用户自行承担。
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold text-base mb-2">5. 服务变更</h2>
            <p>
              本平台保留随时修改、暂停或终止部分或全部服务的权利，无需提前通知用户。
              已发布的内容可能因各种原因被删除或修改，本平台不对此承担责任。
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold text-base mb-2">6. 数据反馈</h2>
            <p>
              如果您发现本平台存在数据错误或不准确之处，欢迎通过{' '}
              <Link href="/contact" className="text-primary hover:underline">
                联系我们
              </Link>{' '}
              页面反馈，我们将在核实后尽快更新。
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold text-base mb-2">7. 适用法域</h2>
            <p>
              本免责声明的解释及执行均适用中华人民共和国法律。如发生争议，双方应友好协商解决；
              协商不成的，任何一方可向本平台运营方所在地有管辖权的人民法院提起诉讼。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

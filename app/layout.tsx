import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AI Model Prices - AI 模型价格对比平台 | 2026 年最新定价",
    template: "%s | AI Model Prices",
  },
  description: "一站式 AI 模型价格对比平台，收录 OpenAI GPT-4/5、Claude 4、Gemini 2.5、Llama 等主流 AI 模型的 API 定价、性能评分、上下文窗口等数据，帮助你找到最具性价比的 AI 模型",
  keywords: [
    "AI 模型价格",
    "AI 模型对比",
    "GPT-4 价格",
    "GPT-5 价格",
    "Claude 4 价格",
    "Gemini 2.5 价格",
    "Llama 4 价格",
    "OpenAI API 定价",
    "Anthropic API 价格",
    "Google AI 定价",
    "Token 价格对比",
    "AI API 成本",
    "大模型价格",
    "AI 模型性能对比",
  ],
  authors: [{ name: "AI Model Prices Team" }],
  creator: "AI Model Prices",
  publisher: "AI Model Prices",
  metadataBase: new URL("https://aimodelprice.com"),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://aimodelprice.com",
    title: "AI Model Prices - AI 模型价格对比平台",
    description: "一站式 AI 模型价格对比平台，收录 OpenAI GPT-4/5、Claude 4、Gemini 2.5、Llama 等主流 AI 模型的 API 定价、性能评分、上下文窗口等数据",
    siteName: "AI Model Prices",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Model Prices - AI 模型价格对比平台",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Model Prices - AI 模型价格对比平台",
    description: "一站式 AI 模型价格对比平台，帮助你找到最具性价比的 AI 模型",
    images: ["/og-image.png"],
    creator: "@aimodelprices",
  },
  verification: {
    google: "your-google-verification-code", // 在 Google Search Console 验证后替换
    // yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-background antialiased">
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
        >
          跳转到主要内容
        </a>
        <main id="main-content" role="main">
          {children}
        </main>
      </body>
    </html>
  );
}
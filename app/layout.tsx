import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIModelPrices - AI模型价格对比站",
  description: "一站式对比主流 AI 模型的价格、性能、上下文窗口。涵盖 OpenAI、Anthropic、Google、Meta、DeepSeek 等厂商。",
  keywords: ["AI模型", "价格对比", "OpenAI", "Claude", "Gemini", "API价格"],
  authors: [{ name: "AIModelPrices" }],
  openGraph: {
    title: "AIModelPrices - AI模型价格对比站",
    description: "一站式对比主流 AI 模型的价格、性能、上下文窗口",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-background antialiased">
        {children}
      </body>
    </html>
  );
}

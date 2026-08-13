import { MainLayout } from "@/components/layout/MainLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "AI 模型价格对比平台 - GPT-5/Claude 4/Gemini 2.5 最新定价",
    template: "%s | AI Model Prices",
  },
  description: "2026 年最新 AI 模型价格对比：GPT-5、Claude 4、Gemini 2.5、Llama 4 等主流模型的 API 定价、性能评分、上下文窗口一站式对比",
  keywords: [
    "AI 模型价格",
    "GPT-5 价格",
    "Claude 4 价格",
    "Gemini 2.5 价格",
    "Llama 4 价格",
    "AI 模型对比",
    "Token 价格",
    "API 定价",
    "大模型价格",
  ],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "AI Model Prices",
  },
};

export default function MainLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}

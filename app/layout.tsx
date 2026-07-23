import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIModelPrices - AI Model Price Comparison",
  description: "One-stop AI model price comparison platform",
  keywords: ["AI models", "price comparison", "OpenAI", "Claude", "Gemini", "GPT", "Llama"],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  authors: [{ name: "AIModelPrices" }],
  openGraph: {
    title: "AIModelPrices",
    description: "One-stop AI model price comparison platform",
    type: "website",
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
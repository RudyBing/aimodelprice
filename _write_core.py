import os, sys
sys.stdout.reconfigure(encoding='utf-8')

BASE = r"C:\Users\蔡静兰\Documents\website\aimodelprice_2"

def write_file(rel_path, content):
    full_path = os.path.join(BASE, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"OK: {rel_path} ({len(content)} bytes)")

# ===== globals.css =====
write_file("app/globals.css", """@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 222 47% 6%;
    --foreground: 210 40% 98%;
    --card: 222 47% 8%;
    --card-foreground: 210 40% 98%;
    --popover: 222 47% 6%;
    --popover-foreground: 210 40% 98%;
    --primary: 262 83% 58%;
    --primary-foreground: 210 40% 98%;
    --secondary: 222 40% 11%;
    --secondary-foreground: 210 40% 90%;
    --muted: 222 30% 13%;
    --muted-foreground: 215 16% 62%;
    --accent: 187 70% 40%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 72% 51%;
    --destructive-foreground: 210 40% 98%;
    --border: 222 30% 15%;
    --input: 222 30% 15%;
    --ring: 262 83% 58%;
    --radius: 0.75rem;
    --provider-openai: 45 90% 50%;
    --provider-anthropic: 15 85% 50%;
    --provider-google: 210 75% 50%;
    --provider-meta: 220 75% 55%;
    --provider-alibaba: 0 68% 50%;
    --provider-deepseek: 260 65% 55%;
    --provider-blackforest: 290 65% 50%;
    --provider-stability: 155 55% 42%;
    --provider-mistral: 195 75% 50%;
    --provider-kuaishou: 30 85% 50%;
    --provider-zhipu: 270 65% 55%;
    --price-low: 142 60% 42%;
    --price-mid: 45 90% 50%;
    --price-high: 0 70% 55%;
  }
}

@layer base {
  * { @apply border-border; }
  body {
    @apply bg-background text-foreground antialiased;
    font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
}

::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: hsl(var(--muted)); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: hsl(var(--muted-foreground)); }

.provider-openai { color: hsl(var(--provider-openai)); }
.provider-anthropic { color: hsl(var(--provider-anthropic)); }
.provider-google { color: hsl(var(--provider-google)); }
.provider-meta { color: hsl(var(--provider-meta)); }
.provider-alibaba { color: hsl(var(--provider-alibaba)); }
.provider-deepseek { color: hsl(var(--provider-deepseek)); }
.provider-blackforest { color: hsl(var(--provider-blackforest)); }
.provider-stability { color: hsl(var(--provider-stability)); }
.provider-mistral { color: hsl(var(--provider-mistral)); }
.provider-kuaishou { color: hsl(var(--provider-kuaishou)); }
.provider-zhipu { color: hsl(var(--provider-zhipu)); }

.provider-accent-openai { border-inline-start-color: hsl(var(--provider-openai)); }
.provider-accent-anthropic { border-inline-start-color: hsl(var(--provider-anthropic)); }
.provider-accent-google { border-inline-start-color: hsl(var(--provider-google)); }
.provider-accent-meta { border-inline-start-color: hsl(var(--provider-meta)); }
.provider-accent-alibaba { border-inline-start-color: hsl(var(--provider-alibaba)); }
.provider-accent-deepseek { border-inline-start-color: hsl(var(--provider-deepseek)); }
.provider-accent-blackforest { border-inline-start-color: hsl(var(--provider-blackforest)); }
.provider-accent-stability { border-inline-start-color: hsl(var(--provider-stability)); }
.provider-accent-mistral { border-inline-start-color: hsl(var(--provider-mistral)); }
.provider-accent-kuaishou { border-inline-start-color: hsl(var(--provider-kuaishou)); }
.provider-accent-zhipu { border-inline-start-color: hsl(var(--provider-zhipu)); }

.price-low { color: hsl(var(--price-low)); }
.price-mid { color: hsl(var(--price-mid)); }
.price-high { color: hsl(var(--price-high)); }

@layer components {
  .transition-fast { transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1); }
  .transition-normal { transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1); }
  .transition-slow { transition: all 400ms cubic-bezier(0.4, 0, 0.2, 1); }
  .glass-card { @apply rounded-xl border border-white/[0.06] bg-white/[0.02]; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
  .gradient-text { @apply bg-clip-text text-transparent; background-image: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent))); }
  .gradient-text-hero { @apply bg-clip-text text-transparent; background-image: linear-gradient(135deg, hsl(262 83% 72%), hsl(187 70% 55%), hsl(262 83% 58%)); }
  .glow-primary { box-shadow: 0 0 20px hsl(var(--primary) / 0.15), 0 0 60px hsl(var(--primary) / 0.06); }
  .glow-accent { box-shadow: 0 0 20px hsl(var(--accent) / 0.15), 0 0 60px hsl(var(--accent) / 0.06); }
}

@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@keyframes pulse-glow { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
@keyframes gradient-shift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }

.animate-shimmer { background: linear-gradient(90deg, transparent, hsl(var(--primary) / 0.08), transparent); background-size: 200% 100%; animation: shimmer 3s ease-in-out infinite; }
.animate-float { animation: float 6s ease-in-out infinite; }
.animate-pulse-glow { animation: pulse-glow 4s ease-in-out infinite; }
.animate-gradient { background-size: 200% 200%; animation: gradient-shift 8s ease infinite; }

::selection { background: hsl(var(--primary) / 0.3); }
""")

# ===== tailwind.config.ts =====
write_file("tailwind.config.ts", '''import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
      },
      borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)" },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "ui-monospace", "monospace"],
      },
      boxShadow: {
        "glow-primary": "0 0 20px hsl(var(--primary) / 0.15), 0 0 60px hsl(var(--primary) / 0.06)",
        "glow-accent": "0 0 20px hsl(var(--accent) / 0.15), 0 0 60px hsl(var(--accent) / 0.06)",
        "glow-xs": "0 0 8px hsl(var(--primary) / 0.1)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "fade-in-up": { "0%": { opacity: "0", transform: "translateY(20px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "scale-in": { "0%": { opacity: "0", transform: "scale(0.95)" }, "100%": { opacity: "1", transform: "scale(1)" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "fade-in": "fade-in 0.4s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
''')

# ===== app/layout.tsx =====
write_file("app/layout.tsx", '''import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIModelPrices - AI Model Price Comparison",
  description: "One-stop AI model price comparison platform",
  keywords: ["AI models", "price comparison", "OpenAI", "Claude", "Gemini"],
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
        {children}
      </body>
    </html>
  );
}
''')

# ===== next.config.ts =====
write_file("next.config.ts", '''import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
''')

print("Core files written!")

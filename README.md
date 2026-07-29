# AI Model Prices - AI模型价格对比站

> 一站式对比主流 AI 模型的价格、性能、上下文窗口

## 技术栈
- **框架**: Next.js 15 (App Router)
- **样式**: TailwindCSS + shadcn/ui
- **动画**: Aceternity UI (粒子背景、光效)
- **部署**: Vercel

## 快速开始

```bash
npm install
npm run dev
```

打开 http://localhost:3000

## 项目结构

```
app/
├── (main)/              # 主站点路由组
│   ├── page.tsx         # 首页 (Hero + 模型概览)
│   ├── models/          # 模型列表
│   │   └── [slug]/      # 模型详情
│   └── compare/         # 价格对比
components/
├── ui/                  # shadcn/ui 组件
├── aceternity/          # Aceternity UI 特效组件
└── layout/              # 导航栏、页脚
data/                    # 模型数据
lib/                     # 工具函数
```

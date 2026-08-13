# AI 模型新闻功能文档

## 功能概述

AI 模型新闻功能是一个组合方案（RSS + API）的新闻抓取和展示系统，可以自动抓取和展示 AI 模型相关的热门新闻。

## 主要特性

- ✅ **RSS 订阅**：从 10+ 权威科技媒体抓取新闻
- ✅ **NewsAPI 集成**：通过关键词搜索补充新闻来源
- ✅ **自动去重**：基于标题相似度去除重复新闻
- ✅ **智能分类**：自动将新闻分类为产品发布、价格调整、技术突破等
- ✅ **模型关联**：自动关联新闻中提到的 AI 模型
- ✅ **热度计算**：根据时间、来源、分类等计算新闻热度
- ✅ **响应式设计**：完美适配桌面和移动设备

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 NewsAPI（可选）

如需使用 NewsAPI 抓取新闻，需要获取 API Key：

1. 访问 https://newsapi.org/ 注册账号
2. 获取 API Key
3. 在项目根目录创建 `.env` 文件：

```bash
NEWSAPI_KEY=your_api_key_here
```

### 3. 抓取新闻

```bash
# 抓取新闻（RSS + API）
npm run fetch:news

# 处理新闻（去重、分类、关联模型）
npm run process:news

# 一键完成抓取和处理
npm run sync:news
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000/news 查看新闻列表。

## 文件结构

```
Project_aimodelprice/
├── app/
│   └── (main)/
│       ├── news/                    # 新闻页面
│       │   ├── page.tsx             # 新闻列表页
│       │   └── [slug]/
│       │       └── page.tsx         # 新闻详情页
├── components/
│   └── news/                        # 新闻组件
│       └── NewsCard.tsx
├── data/
│   ├── news-sources.json            # 新闻源配置
│   ├── news-metadata.json           # 处理后的新闻数据
│   └── news-raw.json                # 原始新闻数据（临时）
├── scripts/
│   ├── fetch-news.ts                # 新闻抓取脚本
│   └── process-news.ts              # 新闻处理脚本
├── types/
│   └── string-similarity.d.ts       # 类型声明
└── package.json
```

## 配置说明

### 新闻源配置 (`data/news-sources.json`)

```json
{
  "rssSources": [
    {
      "name": "TechCrunch AI",
      "url": "https://techcrunch.com/category/artificial-intelligence/feed/",
      "category": "科技媒体",
      "language": "en",
      "enabled": true
    }
    // ... 更多 RSS 源
  ],
  "apiSources": {
    "newsapi": {
      "enabled": true,
      "keywords": ["AI model", "LLM", "GPT", "Claude"],
      "languages": ["en", "zh"],
      "sortBy": "popularity",
      "pageSize": 20
    }
  },
  "settings": {
    "maxNewsPerRun": 50,              // 每次最多保留的新闻数
    "minHotness": 30,                 // 最低热度分数
    "deduplicationThreshold": 0.85,   // 去重相似度阈值
    "cacheExpiryHours": 6             // 缓存过期时间
  }
}
```

## 新闻分类

系统会自动将新闻分为以下类别：

| 分类 | 说明 | 示例关键词 |
|------|------|-----------|
| 产品发布 | AI 模型发布、新产品上线 | release, launch, 发布，推出 |
| 价格调整 | API 价格变化、折扣活动 | price, cost, 价格，降价 |
| 技术突破 | 研究成果、性能提升 | breakthrough, research, 技术，突破 |
| 行业动态 | 合作、投资、市场新闻 | partnership, investment, 行业 |
| 更新迭代 | 模型升级、版本更新 | update, upgrade, 更新，升级 |

## 热度计算

热度分数（0-100）由以下因素决定：

1. **时间衰减**（50%）：新闻发布时间越近，分数越高
2. **来源权重**：权威媒体权重更高（如官方博客 1.2x）
3. **分类权重**：产品发布（1.3x）> 价格调整（1.2x）> 技术突破（1.1x）
4. **模型关联**：关联的模型越多，加成越高（最多 +10 分）

## 自动化更新

### GitHub Actions 配置

创建 `.github/workflows/fetch-news.yml`：

```yaml
name: Fetch AI News

on:
  schedule:
    - cron: '0 */6 * * *'  # 每 6 小时执行一次
  workflow_dispatch:

jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - run: npm ci
      - run: npm run sync:news
      
      - uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: 'chore: auto-update news data'
          file_pattern: 'data/news-*.json'
```

### 环境变量配置

在 GitHub Actions 中配置环境变量：

```yaml
env:
  NEWSAPI_KEY: ${{ secrets.NEWSAPI_KEY }}
```

## 可用命令

| 命令 | 说明 |
|------|------|
| `npm run fetch:news` | 抓取新闻（RSS + API） |
| `npm run process:news` | 处理新闻（去重、分类、关联） |
| `npm run sync:news` | 一键完成抓取和处理 |

## 数据结构

### 新闻数据格式

```typescript
interface News {
  id: string;              // 唯一标识
  slug: string;            // URL 友好的标识符
  title: string;           // 新闻标题
  summary: string;         // 摘要
  content: string;         // 内容
  source: string;          // 来源媒体
  sourceUrl: string;       // 来源链接
  originalUrl: string;     // 原始链接
  publishedAt: string;     // 发布时间
  fetchedAt: string;       // 抓取时间
  imageUrl?: string;       // 图片 URL
  category: string;        // 分类
  tags: string[];          // 标签
  relatedModels: string[]; // 相关模型 ID
  sentiment: string;       // 情感分析（positive/negative/neutral）
  hotness: number;         // 热度分数（0-100）
  language: string;        // 语言
}
```

## 自定义新闻源

### 添加 RSS 源

编辑 `data/news-sources.json`，在 `rssSources` 数组中添加：

```json
{
  "name": "你的媒体名称",
  "url": "https://example.com/feed.xml",
  "category": "科技媒体",
  "language": "en",
  "enabled": true
}
```

### 添加 API 关键词

编辑 `data/news-sources.json`，在 `apiSources.newsapi.keywords` 数组中添加关键词。

## 常见问题

### Q: 为什么有些 RSS 源抓取失败？

A: 部分网站有反爬机制，可能需要：
- 降低抓取频率
- 添加 User-Agent 请求头
- 使用代理服务器

### Q: NewsAPI 免费额度用完了怎么办？

A: 可以：
- 等待第二天重置（免费用户每天 100 次）
- 升级到付费计划
- 禁用 NewsAPI，只使用 RSS 源

### Q: 如何修改新闻分类规则？

A: 编辑 `scripts/process-news.ts` 中的 `categoryKeywords` 对象。

### Q: 新闻数据多久更新一次？

A: 建议每 6 小时更新一次。可以通过 GitHub Actions 定时任务实现。

## 下一步优化建议

1. **AI 内容摘要**：使用 AI 模型生成新闻摘要
2. **情感分析增强**：更准确的情感判断
3. **多语言支持**：自动翻译非中文新闻
4. **图片处理**：自动下载和优化新闻图片
5. **推送通知**：重大新闻推送提醒

## 技术支持

如有问题，请提交 Issue 或联系开发团队。

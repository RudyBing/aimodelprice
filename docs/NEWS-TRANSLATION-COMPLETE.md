# 新闻翻译功能实现文档

## 📋 概述

AI 模型价格对比站的新闻翻译功能已实现，支持英文新闻自动翻译为中文。

## 🎯 翻译方案

采用**腾讯翻译君 + 有道翻译 API**双保险方案：

| 服务 | 优先级 | 免费额度 | 状态 |
|------|--------|----------|------|
| 腾讯翻译君 | 主服务 | 500 万字符/月 | ✅ 已验证 |
| 有道翻译 | 备选 | 100 万字符/月 | ✅ 已验证 |

## ✅ 实现功能

### 1. 翻译工具模块 (`scripts/translate-news.ts`)

- **双保险机制**：优先使用腾讯翻译，失败时自动切换到有道翻译
- **批量翻译**：支持批量翻译新闻，自动避免 API 限流
- **配置检查**：`checkTranslateConfig()` 检查 API 配置是否就绪
- **错误处理**：所有服务失败时保留原文，不中断流程

### 2. 集成到新闻处理流程 (`scripts/process-news.ts`)

翻译步骤已集成到新闻处理流程中：

```
1. 翻译（英文→中文）← 新增
2. 去重
3. 自动分类
4. 关联模型
5. 计算热度
6. 情感分析
7. 生成 slug
8. 过滤低热度
9. 限制数量
```

### 3. 测试脚本

- `scripts/test-tencent-sdk.ts` - 腾讯翻译 SDK 测试
- `scripts/test-tencent-simple.ts` - 腾讯翻译快速测试
- `scripts/test-translate.ts` - 翻译功能综合测试

## 🔧 配置方法

### 环境变量

在 `.env` 文件或 GitHub Secrets 中配置：

```bash
# 腾讯翻译君 API
TENCENT_SECRET_ID=your_secret_id
TENCENT_SECRET_KEY=your_secret_key

# 有道翻译 API（备选）
YOUDAO_APP_ID=your_app_id
YOUDAO_APP_SECRET=your_app_secret
```

### GitHub Actions 配置

在 GitHub 仓库 Settings → Secrets and variables → Actions 中添加：

- `TENCENT_SECRET_ID`
- `TENCENT_SECRET_KEY`
- `YOUDAO_APP_ID`
- `YOUDAO_APP_SECRET`

## 📊 测试结果

### 腾讯翻译 API 测试

```bash
$ npx tsx scripts/test-tencent-simple.ts

🧪 腾讯翻译 API 测试

EN: Hello World
ZH: 你好世界

EN: OpenAI Releases GPT-5
ZH: OpenAI 发布 GPT-5

EN: The new model features improved performance.
ZH: 新型号的性能得到了改进。

✅ 测试完成
```

**结论**：✅ 腾讯翻译 API 工作正常，支持长文本翻译

### 构建验证

```bash
$ npm run build

✓ Compiled successfully in 3.6s
✓ Generating static pages (10/10)

Route (app)                                 Size  First Load JS
┌ ○ /                                    2.87 kB         153 kB
├ ○ /models                              5.25 kB         165 kB
├ ○ /news                                  165 B         106 kB
...
✅ 构建成功
```

## 🚀 使用方法

### 本地测试

```bash
# 1. 设置环境变量
export TENCENT_SECRET_ID=your_id
export TENCENT_SECRET_KEY=your_key

# 2. 测试翻译
npx tsx scripts/test-tencent-simple.ts

# 3. 运行新闻处理（包含翻译）
npm run process:news
```

### GitHub Actions 自动翻译

配置好 Secrets 后，GitHub Actions 会自动运行：

```yaml
# .github/workflows/sync-news.yml
- name: 处理新闻（含翻译）
  run: npm run process:news
```

## 💡 翻译策略

1. **只翻译英文新闻**：中文新闻直接保留
2. **标题 + 摘要全翻译**：确保内容完整性
3. **自动故障切换**：腾讯失败自动切有道
4. **保留原文兜底**：所有服务失败时保留原文

## 📈 成本估算

假设每日处理 50 条英文新闻：

- 平均标题长度：30 字符
- 平均摘要长度：200 字符
- 每日翻译量：50 × (30 + 200) = 11,500 字符
- 每月翻译量：11,500 × 30 = 345,000 字符

**结论**：远低于腾讯免费额度（500 万字符/月），**成本 ¥0**

## ⚠️ 注意事项

1. **API 限流**：批量翻译时添加了 100ms 延迟，避免触发限流
2. **错误处理**：翻译失败不会中断流程，保留原文继续处理
3. **地域选择**：腾讯翻译使用 `ap-guangzhou`（广州）区域
4. **签名算法**：使用腾讯云官方 SDK，避免手动签名错误

## 📝 相关文件

- `scripts/translate-news.ts` - 翻译工具模块
- `scripts/process-news.ts` - 新闻处理流程（已集成翻译）
- `scripts/test-tencent-simple.ts` - 腾讯翻译测试
- `scripts/test-translate.ts` - 综合翻译测试
- `.github/workflows/sync-news.yml` - GitHub Actions 配置
- `docs/NEWS-TRANSLATION-IMPLEMENTATION.md` - 原始方案设计

## 🎉 总结

✅ 腾讯翻译 API 已验证可用  
✅ 有道翻译 API 作为备选  
✅ 翻译功能已集成到新闻处理流程  
✅ 构建验证通过  
✅ 成本为零（在免费额度内）  

**下一步**：
1. 配置 GitHub Secrets
2. 测试 GitHub Actions 自动翻译
3. 添加更多中文新闻源（可选）

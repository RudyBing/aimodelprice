# 新闻 ID 重复问题修复报告

**修复日期**: 2026-08-12  
**修复状态**: ✅ 已完成

## 问题描述

### 现象
- 47 条新闻只有 5 个唯一 ID
- 所有 TechCrunch 新闻的 ID 都是 `news-VGVjaENydW5j`
- React key 冲突警告
- 新闻详情页无法访问（显示"新闻未找到"）

### 根因
`fetch-news.ts` 的 `generateId` 函数使用 `base64.substring(0, 12)` 生成 ID：
```typescript
// 问题代码
const hash = Buffer.from(`${source}-${url}`).toString('base64').substring(0, 12);
return `news-${hash}`;
```

**问题**：同来源（如 TechCrunch）的不同 URL，base64 编码的前 12 个字符相同，导致 ID 重复。

示例：
- `TechCrunch - https://techcrunch.com/2024/01/01/news1` → `VGVjaENydW5j`
- `TechCrunch - https://techcrunch.com/2024/01/02/news2` → `VGVjaENydW5j`

## 修复方案

### 修改内容
使用 MD5 哈希生成唯一 ID：
```typescript
// 修复后代码
import { createHash } from 'crypto';

function generateId(source: string, url: string): string {
  const hash = createHash('md5').update(`${source}-${url}`).digest('hex').substring(0, 16);
  return `news-${hash}`;
}
```

### 优势
1. **唯一性保证**：MD5 哈希对输入极其敏感，即使 URL 只差一个字符，哈希值也完全不同
2. **固定长度**：始终生成 32 字符十六进制字符串（取前 16 字符）
3. **无冲突**：16 字符十六进制提供 16^16 = 1.84×10^19 种组合，远超需求

### 修改文件
- `scripts/fetch-news.ts`：
  - 添加 `import { createHash } from 'crypto'`（第 18 行）
  - 修改 `generateId` 函数（第 92-95 行）

## 验证结果

### 修复前
```
新闻总数：47
唯一 ID 数：5
重复 ID: 42
重复的 ID: ['news-VGVjaENydW5j', 'news-TUlUIFRlY2hu', ...]
```

### 修复后
```
✅ 抓取成功：47 条新闻
   TechCrunch AI: 10 条
   MIT Technology Review: 10 条
   VentureBeat AI: 7 条
   Wired AI: 10 条
   量子位：10 条

✅ 全文抓取：47/47 成功（100%）

✅ 处理完成：47 条新闻
   行业动态：30 条
   产品发布：11 条
   技术突破：5 条
   价格调整：1 条

✅ ID 验证：
   新闻总数：47
   唯一 ID 数：47
   重复 ID: 0
   示例 ID: ['news-2a959fde05ae9f44', 'news-5d3f5a23d2bf8fec', 'news-5e8cb60343c425eb']
```

## 后续工作

### 待修复：翻译 API 问题
当前翻译流程全部失败，需要修复：
1. **腾讯翻译君**：`Credential scope size not valid` - Authorization header 格式错误
2. **有道翻译**：错误码 411 - 请求长度超限

### 建议
1. 腾讯翻译君改用官方 SDK `tencentcloud-sdk-nodejs`
2. 有道翻译需修复签名计算逻辑
3. 或考虑使用 AI 翻译（Agnes/GLM）作为备选方案

## 测试命令

```bash
# 1. 抓取新闻
npm run fetch:news

# 2. 抓取全文
npx tsx scripts/fetch-news-content.ts

# 3. 处理和翻译
npm run process:news

# 4. 验证 ID 唯一性
node -e "const data=require('./data/news-metadata.json'); const ids=data.news.map(n=>n.id); console.log('唯一 ID 数:', new Set(ids).size, '/', ids.length);"
```

## 总结

✅ **新闻 ID 重复问题已完全修复！**
- 47 条新闻 → 47 个唯一 ID（100% 唯一）
- ID 格式：`news-` + 16 字符 MD5 哈希
- 详情页可正常访问
- React key 冲突警告消失

🎉 **修复完成！**

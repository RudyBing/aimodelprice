# 新闻翻译 GitHub Actions 配置指南

## ⚠️ 重要安全提示

**绝对不要将 `.env.local` 文件推送到 GitHub！**

`.env.local` 包含敏感的 API Key，一旦泄露可能导致：
- API 配额被盗用
- 产生意外费用
- 安全风险

## 🔐 正确的配置方式

### 方案对比

| 场景 | 配置方式 | 文件位置 | 安全性 |
|------|---------|---------|--------|
| **本地调试** | 系统环境变量 | 本地终端 | ⭐⭐⭐⭐⭐ |
| **GitHub Actions** | GitHub Secrets | GitHub 加密存储 | ⭐⭐⭐⭐⭐ |
| **Vercel 部署** | Vercel Environment Variables | Vercel 加密存储 | ⭐⭐⭐⭐⭐ |

## 📝 本地调试配置

### Windows（PowerShell）

**临时设置（当前终端会话）**：

```powershell
# 腾讯翻译君
$env:TENCENT_SECRET_ID="your_secret_id"
$env:TENCENT_SECRET_KEY="your_secret_key"

# 有道翻译
$env:YOUDAO_APP_ID="your_app_id"
$env:YOUDAO_APP_SECRET="your_app_secret"

# 验证
echo $env:TENCENT_SECRET_ID
```

**永久设置（系统环境变量）**：

```powershell
# 腾讯翻译君
[System.Environment]::SetEnvironmentVariable('TENCENT_SECRET_ID', 'your_secret_id', 'User')
[System.Environment]::SetEnvironmentVariable('TENCENT_SECRET_KEY', 'your_secret_key', 'User')

# 有道翻译
[System.Environment]::SetEnvironmentVariable('YOUDAO_APP_ID', 'your_app_id', 'User')
[System.Environment]::SetEnvironmentVariable('YOUDAO_APP_SECRET', 'your_app_secret', 'User')
```

**重启终端后生效**。

### macOS/Linux（Bash/Zsh）

**临时设置**：

```bash
export TENCENT_SECRET_ID="your_secret_id"
export TENCENT_SECRET_KEY="your_secret_key"
export YOUDAO_APP_ID="your_app_id"
export YOUDAO_APP_SECRET="your_app_secret"
```

**永久设置**（添加到 `~/.bashrc` 或 `~/.zshrc`）：

```bash
echo 'export TENCENT_SECRET_ID="your_secret_id"' >> ~/.bashrc
echo 'export TENCENT_SECRET_KEY="your_secret_key"' >> ~/.bashrc
echo 'export YOUDAO_APP_ID="your_app_id"' >> ~/.bashrc
echo 'export YOUDAO_APP_SECRET="your_app_secret"' >> ~/.bashrc
source ~/.bashrc
```

### 使用 .env.local（可选，仅限本地）

**注意**：`.env.local` 仅用于 Next.js 开发服务器，**不会**被 `tsx scripts/*` 读取！

```bash
# 创建 .env.local（已在 .gitignore 中）
cp .env.example .env.local

# 编辑 .env.local，填入 API Key
# 然后运行 Next.js 开发服务器
npm run dev
```

**验证配置**：

```bash
# 检查配置
npm run check:translate

# 测试翻译
npx tsx scripts/test-translate.ts

# 运行新闻处理
npm run process:news
```

## 🚀 GitHub Actions 配置

### 1. 获取 API Key

**腾讯翻译君**：
1. 访问 https://console.cloud.tencent.com/cam/capi
2. 创建 API Key
3. 开通"机器翻译"服务

**有道翻译**：
1. 访问 https://ai.youdao.com/
2. 创建应用
3. 获取 App ID 和 App Secret

### 2. 配置 GitHub Secrets

1. 访问你的 GitHub 仓库：https://github.com/YOUR_USERNAME/aimodelprice

2. 进入 **Settings** → **Secrets and variables** → **Actions**

3. 点击 **New repository secret**

4. 添加以下 Secrets：

| Name | Value | 说明 |
|------|-------|------|
| `TENCENT_SECRET_ID` | `AKIDxxxxxxxxxxxx` | 腾讯 Secret ID |
| `TENCENT_SECRET_KEY` | `xxxxxxxxxxxx` | 腾讯 Secret Key |
| `YOUDAO_APP_ID` | `xxxxxxxx` | 有道 App ID |
| `YOUDAO_APP_SECRET` | `xxxxxxxxxxxx` | 有道 App Secret |

### 3. 创建 GitHub Actions 工作流

创建文件 `.github/workflows/sync-news.yml`：

```yaml
name: Sync AI News

on:
  schedule:
    # 每天 UTC 2:00（北京时间 10:00）
    - cron: '0 2 * * *'
  workflow_dispatch:
    inputs:
      skip_translate:
        description: 'Skip translation (use English directly)'
        required: false
        default: 'false'
        type: boolean

jobs:
  sync-news:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Fetch news
        run: npm run fetch:news
      
      - name: Process and translate news
        env:
          TENCENT_SECRET_ID: ${{ secrets.TENCENT_SECRET_ID }}
          TENCENT_SECRET_KEY: ${{ secrets.TENCENT_SECRET_KEY }}
          YOUDAO_APP_ID: ${{ secrets.YOUDAO_APP_ID }}
          YOUDAO_APP_SECRET: ${{ secrets.YOUDAO_APP_SECRET }}
        run: npm run process:news
      
      - name: Check for changes
        id: git-check
        run: |
          git diff --quiet data/news-processed.json || echo "has_changes=true" >> $GITHUB_OUTPUT
      
      - name: Commit and push changes
        if: steps.git-check.outputs.has_changes == 'true'
        run: |
          git config --local user.email "github-actions[bot]@users.noreply.github.com"
          git config --local user.name "github-actions[bot]"
          git add data/news-processed.json
          git commit -m "chore(news): auto sync news $(date -u '+%Y-%m-%d %H:%M UTC')" || exit 0
          git push
```

### 4. 验证工作流

**手动触发测试**：

1. 进入仓库的 **Actions** 标签页
2. 选择 **Sync AI News** 工作流
3. 点击 **Run workflow**
4. 选择分支（通常是 `main`）
5. 点击 **Run workflow**

**查看运行结果**：

- 绿色 ✅：成功
- 红色 ❌：失败（点击查看详情）

### 5. 查看日志

如果翻译失败，查看 GitHub Actions 日志：

```
Run npm run process:news
> tsx scripts/process-news.ts

🔍 检查翻译配置
✅ 腾讯翻译君配置：已设置
✅ 有道翻译配置：已设置
✅ 翻译服务已就绪

🌐 开始批量翻译 (50 条)...
[1/50] 翻译：OpenAI Releases GPT-5...
   尝试使用 腾讯翻译君...
   ✅ 翻译成功 (腾讯)
...
```

## 💰 成本估算

**免费额度**：
- 腾讯翻译君：500 万字符/月
- 有道翻译：100 万字符/月
- **总计**：600 万字符/月

**预计使用**：
- 每日 50 条新闻 × 520 字符 = 26,000 字符/天
- 每月：780,000 字符
- **结论**：✅ 在免费额度内，成本 ¥0

## 🔍 故障排查

### 问题 1：GitHub Actions 读取不到环境变量

**错误信息**：
```
腾讯翻译君配置缺失：请设置 TENCENT_SECRET_ID 和 TENCENT_SECRET_KEY
```

**原因**：
- GitHub Secrets 未正确配置
- 工作流文件中未使用 `env:` 注入环境变量

**解决方法**：

检查工作流文件中是否正确配置：

```yaml
- name: Process and translate news
  env:
    TENCENT_SECRET_ID: ${{ secrets.TENCENT_SECRET_ID }}
    TENCENT_SECRET_KEY: ${{ secrets.TENCENT_SECRET_KEY }}
    YOUDAO_APP_ID: ${{ secrets.YOUDAO_APP_ID }}
    YOUDAO_APP_SECRET: ${{ secrets.YOUDAO_APP_SECRET }}
  run: npm run process:news
```

### 问题 2：本地调试读取不到环境变量

**错误信息**：
```
腾讯翻译君配置缺失
```

**原因**：
- `.env.local` 不会被 `tsx scripts/*` 读取
- 终端未正确设置环境变量

**解决方法**：

**方法 1**：使用系统环境变量（推荐）

```powershell
# Windows PowerShell
$env:TENCENT_SECRET_ID="your_secret_id"
npm run process:news
```

**方法 2**：使用 `dotenv-cli`（需要额外安装）

```bash
npm install -D dotenv-cli
dotenv -e .env.local -- tsx scripts/process-news.ts
```

### 问题 3：API Key 无效

**错误信息**：
```
腾讯翻译君 API 错误：401 Unauthorized
```

**原因**：
- API Key 配置错误
- 服务未开通

**解决方法**：
1. 检查 API Key 是否正确复制
2. 确认已开通"机器翻译"服务
3. 检查 API Key 是否过期

## 📝 最佳实践

### 1. 环境变量命名规范

- 使用大写字母 + 下划线
- 明确标识服务名称
- 示例：`TENCENT_SECRET_ID`

### 2. Secret 轮换

建议每 6 个月更换一次 API Key：

1. 在云服务商处创建新的 API Key
2. 更新 GitHub Secrets
3. 更新本地环境变量
4. 删除旧的 API Key

### 3. 监控配额

定期检查 API 使用量：

- **腾讯翻译君**：https://console.cloud.tencent.com/tmt
- **有道翻译**：https://ai.youdao.com/console/

### 4. 错误告警

可以在 GitHub Actions 中配置告警：

```yaml
- name: Notify on failure
  if: failure()
  run: |
    echo "新闻翻译失败，请检查日志"
    # 可以集成 Slack/Discord/邮件通知
```

## 📚 相关文件

- `.github/workflows/sync-news.yml` - GitHub Actions 工作流（需创建）
- `.env.example` - 环境变量示例
- `.gitignore` - Git 忽略配置
- `scripts/translate-news.ts` - 翻译工具
- `scripts/process-news.ts` - 新闻处理
- `docs/TRANSLATE-NEWS-GUIDE.md` - 使用指南

## ✅ 配置清单

### 本地开发

- [ ] 获取腾讯翻译君 API Key
- [ ] 获取有道翻译 API Key
- [ ] 设置系统环境变量
- [ ] 运行 `npm run check:translate` 验证
- [ ] 运行 `npx tsx scripts/test-translate.ts` 测试
- [ ] 运行 `npm run process:news` 完整流程

### GitHub Actions

- [ ] 在 GitHub Secrets 中配置 API Key
- [ ] 创建 `.github/workflows/sync-news.yml`
- [ ] 手动触发测试工作流
- [ ] 检查日志确认翻译成功
- [ ] 验证新闻数据已更新

### Vercel 部署（可选）

- [ ] 在 Vercel 配置环境变量
- [ ] 重新部署项目
- [ ] 验证新闻页面显示正常

---

**配置完成！🎉**

现在你可以安全地在本地调试和 GitHub Actions 中使用翻译功能，无需担心 API Key 泄露。

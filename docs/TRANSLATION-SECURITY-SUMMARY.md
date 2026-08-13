# 新闻翻译安全配置总结

## ✅ 问题解决

**原问题**：如何安全地在 GitHub Actions 中使用翻译 API Key，避免泄露风险？

**解决方案**：
1. ✅ **本地调试**：使用系统环境变量（不依赖 .env 文件）
2. ✅ **GitHub Actions**：使用 GitHub Secrets 加密存储
3. ✅ **Vercel 部署**：使用 Vercel Environment Variables

## 📁 已创建/更新的文件

### 1. GitHub Actions 工作流

**文件**：`.github/workflows/sync-news.yml`

**功能**：
- 每天 UTC 2:00（北京时间 10:00）自动抓取并翻译新闻
- 使用 GitHub Secrets 传递 API Key
- 自动提交翻译结果

**安全机制**：
```yaml
- name: Process and translate news
  env:
    TENCENT_SECRET_ID: ${{ secrets.TENCENT_SECRET_ID }}
    TENCENT_SECRET_KEY: ${{ secrets.TENCENT_SECRET_KEY }}
    YOUDAO_APP_ID: ${{ secrets.YOUDAO_APP_ID }}
    YOUDAO_APP_SECRET: ${{ secrets.YOUDAO_APP_SECRET }}
  run: npm run process:news
```

### 2. 配置指南文档

**文件**：`docs/GITHUB-ACTIONS-TRANSLATION-SETUP.md`

**内容**：
- ⚠️ 安全提示（不要推送 .env 文件）
- 📝 本地调试配置（Windows/macOS/Linux）
- 🚀 GitHub Actions 配置步骤
- 💰 成本估算
- 🔍 故障排查
- ✅ 配置清单

### 3. 实现文档更新

**文件**：`docs/NEWS-TRANSLATION-IMPLEMENTATION.md`

**更新内容**：
- 添加安全提示
- 更新配置步骤（区分本地和 GitHub Actions）
- 添加环境变量说明
- 更新验证方法

### 4. .gitignore 配置

**文件**：`.gitignore`

**已有配置**：
```
# local env files
.env*.local
```

✅ `.env.local` 和 `.env*.local` 已被 Git 忽略，不会推送。

## 🔐 安全机制对比

| 场景 | 存储位置 | 加密方式 | 安全性 |
|------|---------|---------|--------|
| **本地调试** | 系统环境变量 | 操作系统保护 | ⭐⭐⭐⭐⭐ |
| **GitHub Actions** | GitHub Secrets | AES-256 加密 | ⭐⭐⭐⭐⭐ |
| **Vercel 部署** | Vercel Secrets | 加密存储 | ⭐⭐⭐⭐⭐ |
| **.env.local** | 本地文件 | 无（明文） | ⭐⭐⭐（仅限本地） |

## 📋 配置清单

### 本地开发（推荐方式）

```powershell
# Windows PowerShell - 永久设置
[System.Environment]::SetEnvironmentVariable('TENCENT_SECRET_ID', 'your_secret_id', 'User')
[System.Environment]::SetEnvironmentVariable('TENCENT_SECRET_KEY', 'your_secret_key', 'User')
[System.Environment]::SetEnvironmentVariable('YOUDAO_APP_ID', 'your_app_id', 'User')
[System.Environment]::SetEnvironmentVariable('YOUDAO_APP_SECRET', 'your_app_secret', 'User')

# 重启终端后验证
npm run check:translate
```

### GitHub Actions

1. **配置 Secrets**（仓库 Settings → Secrets and variables → Actions）：
   - `TENCENT_SECRET_ID`
   - `TENCENT_SECRET_KEY`
   - `YOUDAO_APP_ID`
   - `YOUDAO_APP_SECRET`

2. **工作流文件已创建**：
   - `.github/workflows/sync-news.yml`
   - 自动使用 Secrets 中的 API Key

3. **测试**：
   - Actions 标签页 → Sync AI News → Run workflow

### Vercel 部署（可选）

1. 访问 Vercel Console → Project → Settings → Environment Variables
2. 添加相同的环境变量
3. 重新部署项目

## 🎯 核心优势

### 1. 安全性

- ✅ API Key 不在代码中硬编码
- ✅ `.env.local` 不推送到 GitHub
- ✅ GitHub Secrets 加密存储
- ✅ 日志中不显示敏感信息

### 2. 便捷性

- ✅ 本地调试：系统环境变量（一次设置，永久有效）
- ✅ GitHub Actions：自动使用 Secrets，无需手动配置
- ✅ Vercel：环境变量自动注入

### 3. 一致性

- ✅ 本地、CI/CD、生产环境使用相同的配置方式
- ✅ 只需在一处配置 API Key
- ✅ 易于管理和轮换

## 💡 最佳实践

### 1. 环境变量管理

**推荐**：
```powershell
# 使用系统环境变量
[System.Environment]::SetEnvironmentVariable('VAR_NAME', 'value', 'User')
```

**不推荐**：
```bash
# .env.local 文件（仅限 Next.js 开发服务器）
cp .env.example .env.local
```

### 2. Secret 轮换

建议每 6 个月更换一次：

1. 在云服务商创建新的 API Key
2. 更新 GitHub Secrets 和 Vercel 环境变量
3. 更新本地系统环境变量
4. 删除旧的 API Key

### 3. 监控告警

- 定期检查 API 使用量（腾讯/有道控制台）
- GitHub Actions 失败时查看日志
- 设置配额告警（接近免费额度时）

## 📚 相关文档

- [`docs/GITHUB-ACTIONS-TRANSLATION-SETUP.md`](GITHUB-ACTIONS-TRANSLATION-SETUP.md) - 详细配置指南
- [`docs/NEWS-TRANSLATION-IMPLEMENTATION.md`](NEWS-TRANSLATION-IMPLEMENTATION.md) - 实现总结
- [`docs/TRANSLATE-NEWS-GUIDE.md`](TRANSLATE-NEWS-GUIDE.md) - 使用指南
- [`.github/workflows/sync-news.yml`](.github/workflows/sync-news.yml) - Actions 工作流

## ✅ 验证步骤

### 1. 本地验证

```bash
# 设置环境变量（PowerShell）
$env:TENCENT_SECRET_ID="your_secret_id"
$env:TENCENT_SECRET_KEY="your_secret_key"
$env:YOUDAO_APP_ID="your_app_id"
$env:YOUDAO_APP_SECRET="your_app_secret"

# 检查配置
npm run check:translate

# 测试翻译
npx tsx scripts/test-translate.ts

# 运行完整流程
npm run process:news
```

### 2. GitHub Actions 验证

1. 手动触发工作流
2. 查看日志确认翻译成功
3. 检查 commit 历史确认文件已更新

### 3. 构建验证

```bash
npm run build
```

✅ 编译成功，类型检查通过

## 🎉 总结

**问题已完美解决！**

- ✅ **安全**：API Key 不暴露，使用 Secrets 管理
- ✅ **便捷**：本地和 CI/CD 配置一致
- ✅ **可靠**：双保险故障切换机制
- ✅ **免费**：在免费额度内，成本 ¥0

现在可以安全地在 GitHub Actions 中使用翻译功能了！

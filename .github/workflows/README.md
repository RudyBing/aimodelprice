# AI Model Prices - GitHub Actions 配置

## 🚀 完全自动化同步

本项目使用 GitHub Actions 实现**完全自动化**的数据更新流程：

1. ✅ **每日自动同步 LiteLLM 价格数据**（UTC 00:00 / 北京时间 8:00）
2. ✅ **每日自动 AI 生成新模型描述并导入**（无需手动触发）
3. ✅ **自动提交并 push 到 main 分支**
4. ✅ **触发 Vercel 自动重新部署**

---

## 📋 工作流程

### 完整自动化流程（每天运行）

```
每天 UTC 00:00（北京时间 8:00）自动触发
  ↓
Job 1: 价格同步
  - npm run sync:prices（拉取 LiteLLM 价格）
  - npm run build:data（合并数据）
  - 检查变更 → 自动 commit & push
  ↓
Job 2: AI 模型导入
  - npm run generate:candidates（生成候选列表）
  - npm run ai:generate（AI 生成描述）
  - npm run import:candidates（导入到项目）
  - 检查变更 → 自动 commit & push
  ↓
触发 Vercel 自动部署
```

### 两个 Job 说明

**Job 1: sync（价格同步）**
- 从 LiteLLM GitHub 拉取最新价格
- 与本地元数据合并
- 更新 `models-prices.json` 和 `models-generated.ts`
- 如果价格有变化，自动 commit

**Job 2: ai-import（AI 模型导入）**
- 扫描 LiteLLM 新增模型（候选列表）
- 调用 AI API 生成 description 和 strengths
- 批量导入到 `models-metadata.json`
- 如果有新模型，自动 commit

---

## 🔧 配置步骤

### 步骤 1：启用 GitHub Actions

- 进入仓库 → **Settings** → **Actions** → **General**
- 确保 **Allow all actions and reusable workflows** 已启用

---

### 步骤 2：配置写入权限

默认情况下 GitHub Token 只有读权限。需要：

- **Settings** → **Actions** → **General** → **Workflow permissions**
- 选择 **Read and write permissions**
- 勾选 **Allow GitHub Actions to create and approve pull requests**（可选）

---

### 步骤 3：配置 AI API Keys（必须）

**⚠️ 重要**：由于完全自动化流程每天会运行 AI 生成，必须配置 API Keys。

#### 3.1 获取 API Keys

**Agnes 2.5 Flash**：
- 访问 Agnes AI 官网
- 注册并创建 API Key

**GLM-4.7 Flash**（备选）：
- 访问 https://open.bigmodel.cn/
- 注册并创建 API Key

#### 3.2 添加到 GitHub Secrets

1. 进入仓库 → **Settings** → **Secrets and variables** → **Actions**

2. 点击 **New repository secret**

3. 添加以下 Secrets：

| Name | Value | Description |
|------|-------|-------------|
| `AGNES_API_KEY` | `sk-你的 Agnes API Key` | Agnes 2.5 Flash API Key |
| `GLM_API_KEY` | `sk-你的 GLM API Key` | GLM-4.7 Flash API Key |

4. 点击 **Add secret** 保存

---

### 步骤 4：本地测试

在推送到 GitHub 之前，建议先在本地模拟 GitHub Actions 流程：

```bash
# 赋予执行权限（Linux/Mac）
chmod +x scripts/test-github-actions.sh

# 运行测试
bash scripts/test-github-actions.sh
```

**测试脚本会执行**：
1. ✅ 清理环境（删除 node_modules）
2. ✅ 安装依赖（`npm install`）
3. ✅ 同步价格（`npm run sync`）
4. ✅ 检查数据变更
5. ✅ 生成候选列表（`npm run generate:candidates`）
6. ✅ 检查候选模型

---

### 步骤 5：验证配置

#### 5.1 手动触发测试

1. 进入 **Actions** 标签页
2. 点击 **Sync LiteLLM Prices**
3. 点击 **Run workflow**
4. 查看运行日志，确认成功

**预期运行时间**：约 3-5 分钟
- Job 1 (sync): ~2 分钟
- Job 2 (ai-import): ~2-3 分钟

#### 5.2 验证 AI 生成

检查日志中是否包含：
```
✅ Generate candidates
✅ AI generate descriptions
✅ Import candidates
```

---

## 📅 定时触发配置

### 默认配置

- **运行时间**：每天 UTC 00:00（北京时间 8:00）
- **自动执行**：价格同步 + AI 模型导入

### 修改频率

编辑 `.github/workflows/sync-prices.yml`：

```yaml
schedule:
  # 每天 UTC 00:00（北京时间 8:00）
  - cron: '0 0 * * *'
```

常用频率：
- 每天：`0 0 * * *`
- 每 12 小时：`0 0,12 * * *`
- 每周一：`0 0 * * 1`
- 每 6 小时：`0 0,6,12,18 * * *`

---

## 🚀 手动触发

### 仅同步价格（Dry Run）

1. 进入 **Actions** → **Sync LiteLLM Prices**
2. 点击 **Run workflow**
3. 勾选 **Skip commit and push (dry run)**
4. 点击 **Run workflow**

### 完整流程测试

1. 进入 **Actions** → **Sync LiteLLM Prices**
2. 点击 **Run workflow**
3. 不勾选任何选项
4. 点击 **Run workflow**

---

## 📊 监控与日志

### 查看运行历史

- 进入 **Actions** 标签页
- 查看所有 workflow 运行历史
- 点击具体运行查看日志

### 预期输出

**Job 1: sync**
```
✅ Checkout repository
✅ Setup Node.js
✅ Install dependencies
✅ Sync prices and build data
✅ Configure git
✅ Check for changes
✅ Commit and push changes
✅ Summary
```

**Job 2: ai-import**
```
✅ Checkout repository
✅ Setup Node.js
✅ Install dependencies
✅ Generate candidates
✅ AI generate descriptions
✅ Import candidates
✅ Configure git
✅ Check for changes
✅ Commit and push AI generated models
✅ Summary
```

---

## 💰 成本估算

### GitHub Actions
- **免费额度**: 2000 分钟/月
- **预计使用**: ~5 分钟/天 × 30 = 150 分钟/月
- **状态**: ✅ 在免费额度内

### AI 模型导入成本

| 服务 | 单价 | 每日 50 个模型成本 | 月度成本 |
|------|------|------------------|---------|
| Agnes 2.5 Flash | ¥0.001/1K | ¥0.10 | ¥3.00 |
| GLM-4.7 Flash | ¥0.001/1K | ¥0.10 | ¥3.00 |
| **合计** | - | **¥0.20/天** | **¥6.00/月** |

**注意**：
- 成本基于实际调用量，以上为估算值
- GitHub Actions 本身免费（每月 2000 分钟额度）
- 实际成本以 API 提供商账单为准

---

## 🔒 安全建议

### API Key 安全

1. **永远不要**将 API Key 提交到代码仓库
2. **只使用** GitHub Secrets 存储敏感信息
3. **定期轮换** API Key（建议每 3 个月）
4. **限制权限**：API Key 只授予必要权限
5. **监控用量**：定期检查 API 使用量和余额

### 代码审查

- 定期检查 `.github/workflows/` 目录下的文件
- 审查自动提交的变更
- 监控 API 使用量

---

## ⚠️ 注意事项

### 1. API Key 余额

由于完全自动化每天会运行 AI 生成，请确保：
- API Key 有足够余额
- 设置余额提醒
- 定期检查用量

### 2. Workflow Permissions

确保 GitHub Actions 有写入权限：
- Settings → Actions → General → Workflow permissions
- 选择 **Read and write permissions**

### 3. Vercel 自动部署

确保 Vercel 已连接并配置：
- 连接 GitHub 仓库
- 监听 main 分支
- 自动部署开启

### 4. 网络问题

GitHub Actions 使用 Ubuntu 环境：
- 确保 LiteLLM URL 可访问
- 如遇网络问题，添加重试机制

---

## 🆘 故障排查

### Q: Workflow 运行失败怎么办？

A: 
1. 查看 Actions 日志中的具体错误
2. 检查网络连接（GitHub Actions 使用 Ubuntu 环境）
3. 确认 npm 依赖安装成功
4. 检查 LiteLLM URL 是否可访问
5. 检查 API Keys 是否有效（AI 生成失败时）

### Q: AI 生成失败但价格同步成功？

A:
1. 检查 GitHub Secrets 中 API Keys 是否正确
2. 确认 API Key 有足够余额
3. 检查 API 地址是否正确
4. 查看 AI 服务状态（是否宕机）

### Q: 如何临时禁用 AI 模型导入？

A:
1. 暂时删除 GitHub Secrets 中的 `AGNES_API_KEY` 和 `GLM_API_KEY`
2. 或注释掉 workflow 文件中的 `ai-import` job
3. 或修改 cron 频率减少运行次数

### Q: 如何查看 AI 生成的模型？

A:
- 查看 git commit 历史，搜索 "auto-import AI generated models"
- 检查 `data/models-metadata.json` 的变更
- 访问网站查看新增模型

### Q: API 用量超标怎么办？

A:
1. 立即删除 GitHub Secrets 中的 API Keys
2. 修改 workflow 文件，注释掉 AI 生成步骤
3. 联系 API 提供商确认账单
4. 调整运行频率（如改为每周运行）

---

## ✅ 检查清单

在启用自动同步前，请确认：

- [ ] GitHub Actions 已启用
- [ ] Workflow permissions 设置为 Read and write
- [ ] **本地测试成功**（运行 `bash scripts/test-github-actions.sh`）
- [ ] **AI API Keys 已配置到 Secrets**（必须）
- [ ] API Key 有足够余额
- [ ] 测试运行成功（手动触发）
- [ ] Vercel 已连接并配置自动部署

---

## 📚 相关文档

- [AI 辅助导入指南](../../docs/AI-ASSISTED-IMPORT.md)
- [快速开始 - Agnes + GLM](../../docs/QUICKSTART-AGNES-GLM.md)
- [LiteLLM 同步说明](./sync-prices.yml)
- [自动更新测试报告](../../docs/AUTO-UPDATE-TEST.md)
- [配置完成报告](../../docs/GITHUB-ACTIONS-COMPLETE.md)
- [验证指南](../../docs/GITHUB-ACTIONS-VERIFY.md)

---

**最后更新**: 2026-08-05  
**维护者**: 项目团队  
**自动化级别**: 完全自动化（每日运行）

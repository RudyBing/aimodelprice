# AI Model Prices - GitHub Actions 配置

## 自动同步价格 + AI 模型导入

本项目使用 GitHub Actions 实现：
1. **每日自动同步 LiteLLM 价格数据**
2. **每日自动 AI 生成新模型描述并导入**（需配置 API Keys）

---

## 📋 工作流程

### 工作流 1：价格同步（每天运行）

```
每天 UTC 00:00（北京时间 8:00）自动触发
  ↓
运行 npm run sync 同步价格并生成数据
  ↓
自动提交并 push 到 main 分支
  ↓
触发 Vercel 自动重新部署
```

### 工作流 2：AI 模型导入（可选，需配置 API Keys）

```
价格同步完成后触发
  ↓
运行 npm run generate:candidates 生成候选列表
  ↓
运行 npm run ai:generate 调用 AI API 生成描述
  ↓
运行 npm run import:candidates 导入到项目
  ↓
自动提交并 push 到 main 分支
  ↓
触发 Vercel 自动重新部署
```

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

### 步骤 3：配置 AI API Keys（仅 AI 模型导入需要）

如果启用 AI 自动生成模型描述，需要配置 GitHub Secrets：

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
2. ✅ 安装依赖（`npm ci`）
3. ✅ 同步价格（`npm run sync`）
4. ✅ 检查数据变更
5. ✅ 生成候选列表（`npm run generate:candidates`）
6. ✅ 检查候选模型

---

### 步骤 5：验证配置

#### 5.1 测试价格同步

1. 进入 **Actions** 标签页
2. 点击 **Sync LiteLLM Prices**
3. 点击 **Run workflow**
4. 查看运行日志，确认成功

#### 5.2 测试 AI 模型导入

1. 进入 **Actions** 标签页
2. 点击 **Sync LiteLLM Prices**
3. 点击 **Run workflow**
4. 勾选 **Run AI generation for new models**
5. 点击 **Run workflow**
6. 查看运行日志，确认成功

---

## 📅 定时触发配置

### 默认配置

- **价格同步**：每天 UTC 00:00（北京时间 8:00）
- **AI 模型导入**：价格同步完成后自动运行（如果配置了 API Keys）

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

### 仅同步价格

1. 进入 **Actions** → **Sync LiteLLM Prices**
2. 点击 **Run workflow**
3. 选择分支（默认 main）
4. 点击 **Run workflow**

### 同步价格 + AI 导入

1. 进入 **Actions** → **Sync LiteLLM Prices**
2. 点击 **Run workflow**
3. 勾选 **Run AI generation for new models**
4. 点击 **Run workflow**

---

## 📊 监控与日志

### 查看运行历史

- 进入 **Actions** 标签页
- 查看所有 workflow 运行历史
- 点击具体运行查看日志

### 常见问题

#### Workflow 失败

**检查项**：
- Actions 日志中的错误信息
- 网络连接是否正常
- LiteLLM URL 是否变更
- API Key 是否有效（AI 导入失败时）

#### 没有自动 commit

**检查项**：
- Workflow permissions 是否为 Read and write
- git 用户配置是否正确
- 数据是否有实际变化

#### Vercel 没有自动部署

**检查项**：
- Vercel 是否连接到 GitHub
- 确认 main 分支 push 触发部署
- 检查 Vercel 部署设置

---

## 💰 成本估算

### AI 模型导入成本

| 服务 | 单价 | 每日 50 个模型成本 | 月度成本 |
|------|------|------------------|---------|
| Agnes 2.5 Flash | ¥0.001/1K | ¥0.10 | ¥3.00 |
| GLM-4.7 Flash | ¥0.001/1K | ¥0.10 | ¥3.00 |

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

### 代码审查

- 定期检查 `.github/workflows/` 目录下的文件
- 审查自动提交的变更
- 监控 API 使用量

---

## ✅ 检查清单

在启用自动同步前，请确认：

- [ ] GitHub Actions 已启用
- [ ] Workflow permissions 设置为 Read and write
- [ ] **本地测试成功**（运行 `bash scripts/test-github-actions.sh`）
- [ ] 测试运行成功（手动触发）
- [ ] Vercel 已连接并配置自动部署
- [ ] （可选）AI API Keys 已配置到 Secrets

---

## 🆘 故障排查

### Q: Workflow 运行失败怎么办？

A: 
1. 查看 Actions 日志中的具体错误
2. 检查网络连接（GitHub Actions 使用 Ubuntu 环境）
3. 确认 npm 依赖安装成功
4. 检查 LiteLLM URL 是否可访问

### Q: AI 生成失败但价格同步成功？

A:
1. 检查 GitHub Secrets 中 API Keys 是否正确
2. 确认 API Key 有足够余额
3. 检查 API 地址是否正确
4. 查看 AI 服务状态（是否宕机）

### Q: 如何禁用 AI 模型导入？

A:
1. 删除 GitHub Secrets 中的 `AGNES_API_KEY` 和 `GLM_API_KEY`
2. 或修改 workflow 文件，移除 `ai-import` job

---

## 📚 相关文档

- [AI 辅助导入指南](../../docs/AI-ASSISTED-IMPORT.md)
- [快速开始 - Agnes + GLM](../../docs/QUICKSTART-AGNES-GLM.md)
- [LiteLLM 同步说明](./sync-prices.yml)
- [自动更新测试报告](../../docs/AUTO-UPDATE-TEST.md)

---

**最后更新**: 2026-08-05  
**维护者**: 项目团队

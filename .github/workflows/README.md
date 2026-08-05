# AI Model Prices - GitHub Actions 配置

## 自动同步价格

本项目使用 GitHub Actions 实现每日自动同步 LiteLLM 价格数据。

### 工作流程

1. 每天 UTC 00:00（北京时间 8:00）自动触发
2. 运行 `npm run sync` 同步价格并生成数据
3. 自动提交并 push 到 main 分支
4. 触发 Vercel 自动重新部署

### 配置步骤

#### 1. 启用 GitHub Actions

- 进入仓库 → **Settings** → **Actions** → **General**
- 确保 **Allow all actions and reusable workflows** 已启用

#### 2. 配置写入权限

默认情况下 GitHub Token 只有读权限。需要：

- **Settings** → **Actions** → **General** → **Workflow permissions**
- 选择 **Read and write permissions**
- 勾选 **Allow GitHub Actions to create and approve pull requests**（可选）

#### 3. 验证

- 进入 **Actions** 标签页
- 查看 "Sync LiteLLM Prices" workflow
- 首次运行后检查是否成功提交

### 手动触发

如需立即同步（不等待定时触发）：

1. 进入 **Actions** → **Sync LiteLLM Prices**
2. 点击 **Run workflow** 按钮
3. 选择分支（默认 main）
4. 点击 **Run workflow**

### 修改同步频率

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

### 故障排查

**Workflow 失败**：
- 检查 Actions 日志
- 常见原因：网络问题、LiteLLM URL 变更

**没有自动 commit**：
- 检查 Workflow permissions 是否为 Read and write
- 确认 git 用户配置正确

**Vercel 没有自动部署**：
- 检查 Vercel 是否连接到 GitHub
- 确认 main 分支 push 触发部署

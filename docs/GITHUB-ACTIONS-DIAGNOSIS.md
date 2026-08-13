# GitHub Actions 模型导入问题诊断

## 问题现象
- 模型数量连续多天保持在 155 个
- GitHub Actions 每天运行但未新增模型

## 诊断结果

### 数据状态
```
LiteLLM 总模型：3003 个
本地已导入：155 个
候选列表：1232 个（待处理）
AI 生成结果：0 个（❌ 文件不存在）
```

### 问题定位
**`data/candidates-with-ai.json` 文件不存在**

说明 `ai:generate` 步骤失败，导致无法导入新模型。

## 解决步骤

### 1️⃣ 检查 GitHub Secrets 配置

访问：https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions

确认以下 Secret 已配置：
- `AGNES_API_KEY` - Agnes AI API Key
- `GLM_API_KEY` - GLM API Key（备用）

### 2️⃣ 查看 Actions 日志

访问：https://github.com/YOUR_USERNAME/YOUR_REPO/actions

找到最近的 `Sync LiteLLM Prices` 运行：
1. 点击运行记录
2. 展开 `ai-import` job
3. 查看错误信息

常见错误：
```
❌ 缺少 API Key: 请设置环境变量 AGNES_API_KEY
❌ AI API 调用失败：401 Unauthorized
❌ AI API 调用失败：429 Too Many Requests
```

### 3️⃣ 本地测试

在本地测试 AI 生成是否正常：

```bash
cd Project_aimodelprice

# PowerShell 设置环境变量
$env:AGNES_API_KEY="sk-xxx"
$env:GLM_API_KEY="xxx"

# 运行 AI 生成
npm run ai:generate

# 检查输出文件
ls data/candidates-with-ai.json
```

### 4️⃣ 修复后手动触发

修复配置后，在 GitHub Actions 页面：
1. 点击 `Sync LiteLLM Prices` workflow
2. 点击 `Run workflow`
3. 等待运行完成
4. 检查是否新增模型

## 预期结果

修复后，每天应该：
- ✅ 生成 20 个 AI 描述
- ✅ 导入到 `models-metadata.json`
- ✅ 模型总数增加 20 个
- ✅ 约 60 天导入完所有 1232 个候选

## 长期优化建议

### 1. 增加每日配额
修改 `.github/workflows/sync-prices.yml`:
```yaml
- name: AI generate descriptions
  run: npm run ai:generate
  env:
    BATCH_SIZE: 50  # 从 20 提升到 50
```

### 2. 添加失败通知
在 workflow 中添加：
```yaml
- name: Notify on failure
  if: failure()
  uses: actions/github-script@v7
  with:
    script: |
      // 发送 Discord/Slack 通知
```

### 3. 添加重试机制
修改 `ai-generate-descriptions.ts`:
```typescript
// 添加重试逻辑
for (let retry = 0; retry < 3; retry++) {
  try {
    await callAI(prompt, service);
    break;
  } catch (e) {
    if (retry === 2) throw e;
    await sleep(1000 * Math.pow(2, retry));
  }
}
```

## 监控清单

每周检查：
- [ ] GitHub Actions 运行状态
- [ ] 模型数量增长趋势
- [ ] AI 生成成功率
- [ ] API 配额使用情况

---

**创建时间**: 2026-08-13
**最后更新**: 2026-08-13

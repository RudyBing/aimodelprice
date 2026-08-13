# Git 冲突解决方案

## 问题描述

GitHub Actions 在提交 AI 生成的模型时频繁遇到 Git Rebase 冲突：

```
CONFLICT (content): Merge conflict in data/models-generated.ts
Rebasing (1/1)
error: could not apply ...
⚠️ 检测到冲突，放弃本次提交以避免数据丢失
```

## 根本原因

### 1. 并发运行冲突
两个 workflow 同时修改 `data/models-generated.ts`：
- **Sync Prices** job: 更新价格数据 → 重建 `models-generated.ts`
- **AI Import** job: 添加新模型 → 重建 `models-generated.ts`

### 2. Rebase 策略问题
原 workflow 使用简单的 `git pull --rebase`，遇到冲突时直接放弃：
```yaml
if ! git pull --rebase origin main; then
  git rebase --abort
  exit 0  # ❌ 直接放弃，导致提交丢失
fi
```

### 3. 文件生成机制
`models-generated.ts` 是自动生成的文件，每次 `build:data` 都会完全重写，导致：
- 内容顺序可能不同
- 时间戳不同
- 即使数据相同，git diff 也会显示变化

---

## ✅ 方案 1：改进冲突处理（已实施 - v2）

修改 `.github/workflows/sync-prices.yml`，使用 git stash 策略：

```yaml
- name: Commit and push AI generated models
  if: steps.ai-git-check.outputs.has_changes == 'true'
  run: |
    # 先暂存当前更改（避免 pull 失败）
    echo "💾 暂存当前更改..."
    git stash push -m "Auto-generated models"
    
    # 拉取远程变更
    echo "🔄 拉取远程变更..."
    git pull --rebase origin main || {
      echo "⚠️ Rebase 失败，尝试恢复更改..."
      
      # 恢复暂存的更改
      git stash pop || true
      
      # 对于自动生成的文件，使用远程版本
      git checkout --theirs data/models-generated.ts || true
      git checkout --theirs data/models-metadata.json || true
      
      git add data/models-metadata.json data/models-generated.ts || true
      git rebase --continue || {
        echo "❌ 冲突解决失败，放弃"
        git rebase --abort || true
        exit 0
      }
    }
    
    # 恢复暂存的更改
    echo "🔄 恢复暂存的更改..."
    git stash pop || true
    
    # 添加文件并创建提交
    git add data/models-metadata.json data/models-generated.ts
    git commit -m "feat(models): auto-import AI generated models" || exit 0
    git push origin main
    echo "✅ 推送成功！"
```

**改进点（v2）：**
1. ✅ **使用 git stash** - 先暂存更改，避免 "unstaged changes" 错误
2. ✅ **智能恢复** - pull 成功后恢复更改
3. ✅ **冲突自动解决** - 使用 `--theirs` 策略
4. ✅ **完整的错误处理** - 每个步骤都有 fallback

---

### ✅ 方案 2：分离文件，避免冲突（推荐）

将 `models-generated.ts` 拆分为两个文件：

#### 当前结构（冲突源）：
```
data/
├── models-metadata.json    # 手动维护的元数据
└── models-generated.ts     # 自动生成（包含价格 + 元数据）❌
```

#### 优化结构：
```
data/
├── models-metadata.json    # 手动维护的元数据
├── models-prices.json      # 自动同步的价格数据
└── models.ts               # 合并后的最终文件（由 build:data 生成）
```

**优点：**
- ✅ 价格同步只修改 `models-prices.json`
- ✅ 模型导入只修改 `models-metadata.json`
- ✅ `models.ts` 只在 build 时生成，不提交到 git

---

### ✅ 方案 3：禁用并发控制（简单粗暴）

修改 workflow 配置：

```yaml
# 当前配置：禁止并发，但不取消进行中的任务
concurrency:
  group: sync-prices
  cancel-in-progress: false

# 改为：允许并发（可能增加冲突）
# concurrency: null

# 或：取消进行中的任务（避免冲突）
concurrency:
  group: sync-prices
  cancel-in-progress: true  # ✅ 新的会取消旧的
```

---

## 临时手动修复

如果已经遇到冲突，手动修复步骤：

### 1. 拉取最新代码
```bash
git pull origin main
```

### 2. 解决冲突
```bash
# 查看冲突文件
git status

# 对于 models-generated.ts，使用远程版本
git checkout --theirs data/models-generated.ts

# 或者手动编辑解决冲突
code data/models-generated.ts

# 标记为解决
git add data/models-generated.ts data/models-metadata.json
```

### 3. 重新构建
```bash
npm run build:data
git add data/models-generated.ts
git commit -m "fix: resolve merge conflict"
git push
```

---

## 长期优化建议

### 1. 分离价格同步和模型导入

创建两个独立的 workflow：

**workflow-sync-prices.yml:**
```yaml
name: Sync Prices Only
on:
  schedule:
    - cron: '0 0 * * *'  # 每天 00:00
jobs:
  sync:
    # 只同步价格，不生成模型
```

**workflow-import-models.yml:**
```yaml
name: Import New Models
on:
  schedule:
    - cron: '0 12 * * *'  # 每天 12:00（错开时间）
jobs:
  import:
    # 只导入新模型，不同步价格
```

### 2. 使用 Pull Request 而不是直接推送

```yaml
- name: Create Pull Request
  uses: peter-evans/create-pull-request@v5
  with:
    title: 'feat: Auto-import AI models'
    body: 'Automatically generated models'
    branch: auto-import-models
```

**优点：**
- ✅ 可以审查变更
- ✅ 自动测试
- ✅ 避免冲突（PR 会自动合并）

### 3. 添加冲突检测和通知

```yaml
- name: Check for conflicts
  run: |
    if git diff --name-only | grep -q "models-generated.ts"; then
      echo "⚠️ 检测到 models-generated.ts 冲突"
      echo "::warning::文件冲突，可能需要手动干预"
    fi
```

---

## 监控清单

每周检查：
- [ ] GitHub Actions 是否有冲突警告
- [ ] 模型数量是否正常增长
- [ ] 提交历史是否有放弃的提交
- [ ] `models-generated.ts` 是否最新

---

## 故障排除

### Q: 推送失败，提示 "rejected because the remote contains work that you do not have"
**A:** 本地落后于远程，先拉取：
```bash
git pull --rebase
git push
```

### Q: Rebase 冲突无法解决
**A:** 放弃 rebase，重置到远程状态：
```bash
git rebase --abort
git reset --hard origin/main
```

### Q: Actions 一直显示 "冲突解决失败"
**A:** 检查是否两个 workflow 同时运行，考虑错开时间或禁用并发

---

**创建时间**: 2026-08-13  
**最后更新**: 2026-08-13  
**参考文档**: `.github/workflows/sync-prices.yml`

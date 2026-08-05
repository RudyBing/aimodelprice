#!/bin/bash
# GitHub Actions 本地测试脚本
# 模拟 GitHub Actions 的自动同步流程

set -e

echo "========================================"
echo "🧪 GitHub Actions 本地测试"
echo "========================================"
echo ""

# 1. 清理环境
echo "📦 步骤 1: 清理环境..."
rm -rf node_modules
rm -f package-lock.json
echo ""

# 2. 安装依赖
echo "📦 步骤 2: 安装依赖 (npm install)..."
npm install
echo ""

# 3. 同步价格
echo "🔄 步骤 3: 同步价格 (npm run sync)..."
npm run sync
echo ""

# 4. 检查变更
echo "🔍 步骤 4: 检查数据变更..."
if git diff --quiet; then
    echo "✅ 数据无变化"
    HAS_CHANGES="false"
else
    echo "⚠️  数据有变化"
    HAS_CHANGES="true"
    echo ""
    echo "📋 变更文件:"
    git status --short data/
fi
echo ""

# 5. 生成候选列表
echo "📋 步骤 5: 生成候选列表 (npm run generate:candidates)..."
npm run generate:candidates
echo ""

# 6. 检查候选
echo "🔍 步骤 6: 检查候选模型..."
npx tsx scripts/check-candidates.ts 2>&1 | head -20
echo ""

# 7. 总结
echo "========================================"
echo "📊 测试总结"
echo "========================================"
echo ""
echo "✅ 所有步骤执行完成！"
echo ""
echo "📋 检查结果:"
echo "   - 数据变更：$HAS_CHANGES"
echo "   - 候选列表：已生成"
echo ""
echo "💡 下一步:"
echo "   1. 如果数据有变更，可以手动 commit 并 push"
echo "   2. 如果需要 AI 生成，设置环境变量后运行 npm run ai:generate"
echo "   3. 推送到 GitHub 测试 Actions"
echo ""
echo "🚀 GitHub Actions 测试命令:"
echo "   git push origin main"
echo "   然后到 GitHub Actions 页面查看运行结果"
echo ""

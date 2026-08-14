const fs = require('fs');

let content = fs.readFileSync('scripts/process-news.ts', 'utf-8');

// 添加 AI 相关性过滤函数
const filterCode = `// AI 相关性关键词
const aiRelevantKeywords = [
  'ai', 'llm', 'gpt', 'claude', 'gemini', 'qwen', 'deepseek', 'llama', 'mistral',
  '大模型', '语言模型', 'openai', 'anthropic', 'google ai', 'meta ai',
  '推理', '训练', '微调', 'token', '多模态', 'agent', 'chatgpt', 'copilot',
];

// 排除关键词
const excludeKeywords = [
  '融资', '投资', '估值', 'ipo', '收购', '峰会', '大会', '论坛', '面试', '求职',
  '机器人', '硬件', '手机', '克隆', '老鼠', '医疗', 'crm', 'erp', 'saas', '服务器',
];

// 判断 AI 相关性
function isAiRelevant(news) {
  const text = (news.title + ' ' + news.summary).toLowerCase();
  
  // 强 AI 关键词（出现任意一个即可）
  const strongKeywords = ['llm', 'gpt', 'claude', 'gemini', 'qwen', 'deepseek', 'llama', 'mistral', '大模型', '语言模型'];
  
  // 检查是否包含强 AI 关键词
  const hasStrongKeyword = strongKeywords.some(kw => text.includes(kw.toLowerCase()));
  if (hasStrongKeyword) return true;
  
  // 检查是否包含排除关键词（且没有 AI 关键词）
  for (const kw of excludeKeywords) {
    if (text.includes(kw.toLowerCase())) {
      // 如果包含排除词，但不包含任何 AI 关键词，则排除
      const hasAnyAiKeyword = aiRelevantKeywords.some(k => text.includes(k.toLowerCase()));
      if (!hasAnyAiKeyword) return false;
    }
  }
  
  // 计算 AI 关键词分数
  let score = 0;
  for (const kw of aiRelevantKeywords) {
    if (text.includes(kw.toLowerCase())) score++;
  }
  
  // 包含 2 个及以上 AI 关键词，或包含"ai"且包含其他相关词
  return score >= 2 || (text.includes('ai') && score >= 1);
}

// 过滤低相关性新闻
function filterByRelevance(news) {
  console.log('\\n🎯 开始 AI 相关性过滤...');
  console.log('   原始数量：' + news.length);
  const relevant = news.filter(item => isAiRelevant(item));
  console.log('   过滤后：' + relevant.length + ' (移除 ' + (news.length - relevant.length) + ' 条低相关性新闻)');
  console.log('   相关性：' + ((relevant.length / news.length) * 100).toFixed(1) + '%');
  return relevant;
}

`;

// 在分类关键词之前插入
content = content.replace('// 分类关键词', filterCode + '// 分类关键词');

fs.writeFileSync('scripts/process-news.ts', content);
console.log('✅ AI 相关性过滤函数已添加！');

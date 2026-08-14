/**
 * 新闻处理脚本
 * 
 * 使用方法:
 *   npm run process:news
 * 
 * 功能:
 *   1. 去重（基于标题相似度）
 *   2. AI 相关性判断
 *   3. 自动分类
 *   4. 关联 AI 模型
 *   5. 计算热度分数
 *   6. 生成最终数据文件
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import stringSimilarity from 'string-similarity';

// 解决 ES Module 的 __dirname 问题
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 类型定义
interface RawNews {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  originalUrl: string;
  publishedAt: string;
  fetchedAt: string;
  imageUrl?: string;
  category: string;
  tags: string[];
  relatedModels: string[];
  sentiment: string;
  hotness: number;
  language: string;
}

interface ProcessedNews extends RawNews {
  slug: string;
  content: string;
}

interface NewsMetadata {
  news: ProcessedNews[];
  lastUpdated: string;
  total: number;
}

// 加载模型数据用于关联
function loadModels(): any[] {
  try {
    const modelsPath = path.join(rootDir, 'data', 'models-metadata.json');
    const content = fs.readFileSync(modelsPath, 'utf-8');
    const data = JSON.parse(content);
    return data.models || [];
  } catch (error) {
    console.log('⚠️  无法加载模型数据，跳过模型关联');
    return [];
  }
}

// 加载配置
function loadConfig(): any {
  const configPath = path.join(rootDir, 'data', 'news-sources.json');
  const content = fs.readFileSync(configPath, 'utf-8');
  return JSON.parse(content);
}

// 加载原始新闻
function loadRawNews(): RawNews[] {
  const rawPath = path.join(rootDir, 'data', 'news-raw.json');
  if (!fs.existsSync(rawPath)) {
    throw new Error('未找到原始新闻数据，请先运行：npm run fetch:news');
  }
  const content = fs.readFileSync(rawPath, 'utf-8');
  return JSON.parse(content);
}

// 生成 slug
function generateSlug(title: string, id: string): string {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 60);
  
  // 添加 ID 后缀确保唯一性
  const idSuffix = id.replace('news-', '');
  return `${baseSlug}-${idSuffix}`;
}

// 计算字符串相似度
function calculateSimilarity(str1: string, str2: string): number {
  return stringSimilarity.compareTwoStrings(str1.toLowerCase(), str2.toLowerCase());
}

// 去重
function deduplicateNews(news: RawNews[], threshold: number = 0.85): RawNews[] {
  console.log('\n🔄 开始去重...');
  console.log(`   原始数量：${news.length}`);
  
  const unique: RawNews[] = [];
  
  for (const item of news) {
    const isDuplicate = unique.some(existing => {
      const titleSimilarity = calculateSimilarity(item.title, existing.title);
      return titleSimilarity >= threshold;
    });
    
    if (!isDuplicate) {
      unique.push(item);
    }
  }
  
  console.log(`   去重后：${unique.length} (移除 ${news.length - unique.length} 条重复)`);
  return unique;
}

// AI 相关性关键词
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
  console.log('\n🎯 开始 AI 相关性过滤...');
  console.log('   原始数量：' + news.length);
  const relevant = news.filter(item => isAiRelevant(item));
  console.log('   过滤后：' + relevant.length + ' (移除 ' + (news.length - relevant.length) + ' 条低相关性新闻)');
  console.log('   相关性：' + ((relevant.length / news.length) * 100).toFixed(1) + '%');
  return relevant;
}

// 分类关键词
const categoryKeywords = {
  '产品发布': ['release', 'launch', 'announce', 'introduce', '发布', '推出', 'new model'],
  '价格调整': ['price', 'cost', 'pricing', 'discount', '价格', '降价', '涨价', '免费'],
  '技术突破': ['breakthrough', 'research', 'paper', 'benchmark', 'performance', '技术', '研究', '突破'],
  '行业动态': ['partnership', 'acquisition', 'investment', 'funding', '行业', '合作', '投资'],
  '更新迭代': ['update', 'upgrade', 'improve', 'version', '更新', '升级', '改进'],
};

// 自动分类
function categorizeNews(news: RawNews[]): RawNews[] {
  console.log('\n🏷️  开始自动分类...');
  
  return news.map(item => {
    const text = `${item.title} ${item.summary}`.toLowerCase();
    
    let bestCategory = '行业动态';
    let maxScore = 0;
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      const score = keywords.reduce((acc, keyword) => {
        return acc + (text.includes(keyword.toLowerCase()) ? 1 : 0);
      }, 0);
      
      if (score > maxScore) {
        maxScore = score;
        bestCategory = category;
      }
    }
    
    return {
      ...item,
      category: bestCategory,
    };
  });
}

// 关联 AI 模型
function linkModels(news: RawNews[], models: any[]): RawNews[] {
  console.log('\n🔗 开始关联 AI 模型...');
  
  return news.map(item => {
    const text = `${item.title} ${item.summary}`.toLowerCase();
    const relatedModelIds: string[] = [];
    
    for (const model of models) {
      const modelNames = [
        model.name.toLowerCase(),
        model.id.toLowerCase(),
        model.slug.toLowerCase(),
      ];
      
      const aliases: Record<string, string[]> = {
        'gpt-4.1': ['gpt-4', 'gpt4', 'gpt 4'],
        'claude-sonnet-4': ['claude sonnet', 'claude-sonnet', 'sonnet 4'],
        'claude-opus-4': ['claude opus', 'claude-opus', 'opus 4'],
        'gemini-pro': ['gemini', 'google gemini'],
        'llama-3': ['llama', 'llama3', 'llama 3'],
      };
      
      const allNames = [...modelNames, ...(aliases[model.id] || [])];
      
      if (allNames.some(name => text.includes(name))) {
        relatedModelIds.push(model.slug);
      }
    }
    
    // 限制关联模型数量
    return {
      ...item,
      relatedModels: relatedModelIds.slice(0, 5),
    };
  });
}

// 计算热度分数
function calculateHotness(news: RawNews[]): RawNews[] {
  console.log('\n🔥 开始计算热度分数...');
  
  const now = new Date().getTime();
  const hoursPerDay = 24;
  
  return news.map(item => {
    const publishedTime = new Date(item.publishedAt).getTime();
    const hoursAgo = (now - publishedTime) / (1000 * 60 * 60);
    
    // 时间衰减分数（越新越高）
    const timeScore = Math.max(0, 100 - hoursAgo);
    
    // 来源权重
    const sourceWeights: Record<string, number> = {
      'OpenAI Blog': 1.2,
      'Anthropic Blog': 1.2,
      'Google AI Blog': 1.2,
      'Meta AI Blog': 1.2,
      'TechCrunch AI': 1.1,
      'The Verge AI': 1.1,
      'MIT Technology Review': 1.1,
    };
    const sourceWeight = sourceWeights[item.source] || 1.0;
    
    // 分类权重
    const categoryWeights: Record<string, number> = {
      '产品发布': 1.3,
      '价格调整': 1.2,
      '技术突破': 1.1,
      '行业动态': 1.0,
      '更新迭代': 1.0,
    };
    const categoryWeight = categoryWeights[item.category] || 1.0;
    
    // 关联模型数量加成
    const relationBonus = Math.min(item.relatedModels.length * 2, 10);
    
    // 最终热度分数
    const hotness = Math.round(
      (timeScore * 0.5 + 50) * sourceWeight * categoryWeight + relationBonus
    );
    
    return {
      ...item,
      hotness: Math.min(100, Math.max(0, hotness)),
    };
  });
}

// 情感分析（简化版）
function analyzeSentiment(news: RawNews[]): RawNews[] {
  console.log('\n😊 开始情感分析...');
  
  const positiveWords = [
    'breakthrough', 'impressive', 'powerful', 'best', 'improve',
    '突破', '强大', '优秀', '提升', '创新', '领先'
  ];
  
  const negativeWords = [
    'problem', 'issue', 'fail', 'delay', 'cut', 'reduce',
    '问题', '失败', '延迟', '削减', '下降'
  ];
  
  return news.map(item => {
    const text = `${item.title} ${item.summary}`.toLowerCase();
    
    const positiveCount = positiveWords.filter(word => text.includes(word)).length;
    const negativeCount = negativeWords.filter(word => text.includes(word)).length;
    
    let sentiment = 'neutral';
    if (positiveCount > negativeCount + 1) sentiment = 'positive';
    else if (negativeCount > positiveCount + 1) sentiment = 'negative';
    
    return { ...item, sentiment };
  });
}

// 保存处理后的数据
function saveProcessedNews(news: ProcessedNews[]) {
  const outputPath = path.join(rootDir, 'data', 'news-metadata.json');
  
  const metadata: NewsMetadata = {
    news: news.sort((a, b) => b.hotness - a.hotness), // 按热度排序
    lastUpdated: new Date().toISOString(),
    total: news.length,
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(metadata, null, 2), 'utf-8');
  console.log(`\n💾 处理后的数据已保存到：${outputPath}`);
  console.log(`   共 ${news.length} 条新闻`);
}

// 主函数
async function main() {
  console.log('='.repeat(60));
  console.log('🚀 AI 模型新闻处理工具');
  console.log('='.repeat(60));

  try {
    // 加载数据
    console.log('\n📂 加载数据...');
    const rawNews = loadRawNews();
    const models = loadModels();
    const config = loadConfig();
    
    console.log(`   原始新闻：${rawNews.length} 条`);
    console.log(`   模型数据：${models.length} 个`);

    // 处理流程
    let processed = rawNews;
    
    // 1. 去重
    processed = deduplicateNews(processed, config.settings.deduplicationThreshold);
    
    // 2. AI 相关性过滤
    processed = filterByRelevance(processed);
    
    // 3. 自动分类
    processed = categorizeNews(processed);
    
    // 3. 关联模型
    processed = linkModels(processed, models);
    
    // 4. 计算热度
    processed = calculateHotness(processed);
    
    // 5. 情感分析
    processed = analyzeSentiment(processed);
    
    // 6. 生成 slug
    const withSlugs: ProcessedNews[] = processed.map(item => ({
      ...item,
      slug: generateSlug(item.title, item.id),
      content: item.summary, // 暂时用摘要作为内容
    }));
    
    // 7. 过滤低热度新闻
    const filtered = withSlugs.filter(item => item.hotness >= config.settings.minHotness);
    console.log(`\n🎯 过滤低热度新闻：${withSlugs.length - filtered.length} 条`);
    
    // 8. 限制数量
    const final = filtered.slice(0, config.settings.maxNewsPerRun);
    console.log(`📦 最终保留：${final.length} 条（上限 ${config.settings.maxNewsPerRun}）`);
    
    // 保存结果
    saveProcessedNews(final);

    console.log('\n✅ 处理完成！');
    console.log('\n📊 统计信息:');
    const categoryStats: Record<string, number> = {};
    final.forEach(item => {
      categoryStats[item.category] = (categoryStats[item.category] || 0) + 1;
    });
    Object.entries(categoryStats).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} 条`);
    });

  } catch (error) {
    console.error('\n❌ 处理失败:', (error as Error).message);
    process.exit(1);
  }
}

// 执行
main();

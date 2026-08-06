/**
 * 从 LiteLLM 生成待导入模型列表
 * 功能：
 * 1. 扫描 LiteLLM 数据
 * 2. 对比本地已导入模型
 * 3. 生成待导入候选列表（按热度/价格排序）
 * 
 * 运行：tsx scripts/generate-candidates.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const METADATA_FILE = path.join(DATA_DIR, 'models-metadata.json');
const CANDIDATES_FILE = path.join(DATA_DIR, 'candidates-to-import.json');

interface LiteLLMModel {
  litellm_provider: string;
  mode: string;
  input_cost_per_token?: number;
  output_cost_per_token?: number;
  input_cost_per_image?: number;
  cost_per_image?: number;
  input_cost_per_second?: number;
  output_cost_per_second?: number;
  max_input_tokens?: number;
  max_output_tokens?: number;
  supports_vision?: boolean;
  supports_function_call?: boolean;
}

interface CandidateModel {
  litellmId: string;
  suggestedId: string;
  name: string;
  provider: string;
  category: string;
  pricing: {
    input: string;
    output: string;
    unit?: string;
  };
  contextWindow: string;
  multimodal: boolean;
  description?: string;
  strengths?: string[];
  benchmarkScore?: number;
  freeTier?: string;
  released?: string;
  url?: string;
  logo?: string;
}

function parseModelId(modelId: string): { name: string; provider: string } {
  const cleanId = modelId
    .replace(/^[a-z]+\./i, '')
    .replace(/^[a-z]+\//i, '')
    .replace(/^bedrock\//i, '')
    .replace(/^azure\//i, '')
    .replace(/^vertex_ai\//i, '');
  
  const name = cleanId
    .replace(/-\d{8}/g, '')
    .replace(/-v\d+(:\d+)?/g, '')
    .replace(/@20\d{6}/g, '')
    .split('/')[0]
    .split('-')[0] === 'gpt' || cleanId.startsWith('gpt') 
      ? cleanId.split('-').slice(0, 3).join('-')
      : cleanId.split('-').slice(0, 2).join(' ');
  
  return {
    name: name.charAt(0).toUpperCase() + name.slice(1),
    provider: modelId.split('.')[0] || modelId.split('/')[0] || 'Unknown',
  };
}

function modeToCategory(mode: string): string {
  const mapping: Record<string, string> = {
    chat: 'text',
    completion: 'text',
    embedding: 'text',
    image_generation: 'image',
    image_edit: 'image',
    video_generation: 'video',
    audio_transcription: 'audio',
    audio_speech: 'audio',
    rerank: 'text',
    search: 'text',
    ocr: 'text',
    moderation: 'text',
  };
  return mapping[mode] || 'open-source';
}

function formatPrice(costPerToken?: number, costPerImage?: number, costPerSecond?: number): string {
  if (costPerImage !== undefined) {
    return `$${(costPerImage).toFixed(2)} / image`;
  }
  if (costPerSecond !== undefined) {
    return `$${(costPerSecond * 60).toFixed(4)} / min`;
  }
  if (costPerToken !== undefined) {
    const per1M = costPerToken * 1_000_000;
    if (per1M < 0.01) {
      return `$${per1M.toFixed(4)} / 1M tokens`;
    }
    return `$${per1M.toFixed(2)} / 1M tokens`;
  }
  return '免费';
}

function formatContextWindow(maxTokens?: number): string {
  if (!maxTokens) return '未知';
  if (maxTokens >= 1_000_000) return `${(maxTokens / 1_000_000).toFixed(1)}M tokens`;
  if (maxTokens >= 1_000) return `${Math.round(maxTokens / 1_000)}K tokens`;
  return `${maxTokens} tokens`;
}

async function generateCandidates() {
  console.log('🔍 开始生成候选模型列表...\n');

  // 直接从 GitHub 拉取 LiteLLM 数据
  console.log('📥 从 GitHub 拉取 LiteLLM 数据...');
  const litellmUrl = 'https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json';
  
  let litellmData: Record<string, any>;
  try {
    const response = await fetch(litellmUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    litellmData = await response.json();
    console.log(`✅ 拉取成功，共 ${Object.keys(litellmData).length} 个模型\n`);
  } catch (error) {
    console.error('❌ 拉取 LiteLLM 数据失败:', error);
    console.error('   请检查网络连接');
    process.exit(1);
  }

  // 读取本地已导入模型
  if (!fs.existsSync(METADATA_FILE)) {
    console.error('❌ 找不到 models-metadata.json');
    process.exit(1);
  }
  const metadata = JSON.parse(fs.readFileSync(METADATA_FILE, 'utf-8'));
  const existingIds = new Set(metadata.models.map((m: any) => m.litellmModelId).filter(Boolean));

  console.log(`📦 LiteLLM 模型总数：${Object.keys(litellmData).length}`);
  console.log(`📦 本地已导入：${metadata.models.length}`);
  console.log(`📦 已有 litellmModelId 映射：${existingIds.size}\n`);

  // 筛选候选模型
  const candidates: CandidateModel[] = [];
  const excludedProviders = new Set([
    'fireworks_ai', 'bedrock_converse', 'vercel_ai_gateway', 'azure_ai',
    'novita', 'deepinfra', 'replicate', 'snowflake', 'nebius', 'watsonx',
    'databricks', 'github_copilot', 'cloudflare', 'ollama', 'oci',
    'together_ai', 'perplexity', 'deepgram', 'assemblyai', 'jina_ai'
  ]);

  Object.entries(litellmData).forEach(([modelId, data]: [string, any]) => {
    const model = data as LiteLLMModel;
    
    // 跳过已导入的
    if (existingIds.has(modelId)) return;

    // 跳过 excluded providers（保留主流厂商）
    if (excludedProviders.has(model.litellm_provider)) return;

    // 只保留 chat 和 image_generation（主要类别）
    if (!['chat', 'image_generation', 'video_generation', 'audio_transcription'].includes(model.mode)) return;

    // 跳过测试/实验性模型
    if (modelId.includes('test') || modelId.includes('experimental') || modelId.includes('preview')) return;

    const { name, provider } = parseModelId(modelId);
    
    // 跳过名称太短或太长的
    if (name.length < 3 || name.length > 50) return;

    candidates.push({
      litellmId: modelId,
      suggestedId: modelId
        .replace(/\./g, '-')
        .replace(/\//g, '-')
        .replace(/@/g, '-')
        .toLowerCase()
        .slice(0, 50),
      name,
      provider: provider.charAt(0).toUpperCase() + provider.slice(1),
      category: modeToCategory(model.mode),
      pricing: {
        input: formatPrice(model.input_cost_per_token, model.input_cost_per_image, model.input_cost_per_second),
        output: formatPrice(model.output_cost_per_token, model.cost_per_image, model.output_cost_per_second),
        unit: model.input_cost_per_image ? 'image' : undefined,
      },
      contextWindow: formatContextWindow(model.max_input_tokens),
      multimodal: model.supports_vision || false,
      strengths: [],
    });
  });

  // 按厂商分组统计
  const providerCount = new Map<string, number>();
  candidates.forEach(c => {
    providerCount.set(c.provider, (providerCount.get(c.provider) || 0) + 1);
  });

  console.log('📊 候选模型按厂商统计：');
  Array.from(providerCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .forEach(([provider, count]) => {
      console.log(`   ${provider.padEnd(20)} ${count.toString().padStart(3)} 个`);
    });

  // 排序：优先主流厂商
  const priorityProviders = ['OpenAI', 'Anthropic', 'Google', 'Gemini', 'Mistral', 'XAI', 'Cohere', 'Stability'];
  candidates.sort((a, b) => {
    const aPriority = priorityProviders.indexOf(a.provider);
    const bPriority = priorityProviders.indexOf(b.provider);
    if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority;
    if (aPriority !== -1) return -1;
    if (bPriority !== -1) return 1;
    return a.provider.localeCompare(b.provider);
  });

  // 保存候选列表
  fs.writeFileSync(CANDIDATES_FILE, JSON.stringify(candidates, null, 2), 'utf-8');
  console.log(`\n💾 候选列表已保存 → ${CANDIDATES_FILE}`);
  console.log(`📝 共 ${candidates.length} 个候选模型`);
  console.log('\n✅ 生成完成！');
  console.log('\n下一步：');
  console.log('  1. 查看 candidates-to-import.json');
  console.log('  2. 运行 tsx scripts/ai-generate-descriptions.ts 生成描述');
  console.log('  3. 手动审核后运行 tsx scripts/import-candidates.ts 导入');
}

generateCandidates().catch(err => {
  console.error('❌ 生成失败:', err);
  process.exit(1);
});

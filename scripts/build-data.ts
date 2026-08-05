/**
 * 数据构建脚本
 *
 * 将 models-metadata.json（本地元数据）+ models-prices.json（LiteLLM 同步价格）
 * 合并后生成 data/models-generated.ts（纯数据文件，可在客户端安全导入）
 *
 * 用法:
 *   npm run sync:prices    # 从 LiteLLM 拉取最新价格
 *   npm run build:data     # 合并数据并生成 models-generated.ts
 *   npm run dev            # 开发模式（自动 build:data）
 */

import fs from 'fs';
import path from 'path';

// ==================== 类型 ====================

interface MetadataModel {
  id: string;
  name: string;
  slug: string;
  provider: string;
  description: string;
  category: ModelCategory;
  logo?: string;
  strengths: string[];
  benchmarkScore?: number;
  released?: string;
  url: string;
  freeTier?: string;
  litellmModelId: string | null;
  pricing?: ModelPrice;
  contextWindow?: string;
  updatedAt?: string;  // 可选：手动指定的更新日期
}

interface MetadataFile {
  models: MetadataModel[];
}

interface PriceSyncEntry {
  inputCostPerToken?: number;
  outputCostPerToken?: number;
  maxInputTokens?: number;
  maxOutputTokens?: number;
  supportsVision?: boolean;
  source: 'litellm' | 'fallback';
}

interface PriceSyncFile {
  syncedAt: string;
  source: string;
  models: Array<{ id: string; prices: PriceSyncEntry }>;
}

interface ModelPrice {
  input: string;
  output: string;
  unit?: string;
}

type ModelCategory =
  | 'text' | 'image' | 'video' | 'audio'
  | 'code' | 'multimodal' | 'open-source';

interface AIModel {
  id: string;
  name: string;
  slug: string;
  provider: string;
  logo?: string;
  description: string;
  category: ModelCategory;
  pricing: ModelPrice | ModelPrice[];
  contextWindow: string;
  multimodal: boolean;
  strengths: string[];
  benchmarkScore?: number;
  released?: string;
  url: string;
  freeTier?: string;
  updatedAt: string;
}

// ==================== 工具函数 ====================

function formatTokenCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M tokens`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K tokens`;
  return `${n} tokens`;
}

function formatPricePer1M(costPerToken: number): string {
  const per1M = costPerToken * 1_000_000;
  if (per1M >= 1) return `$${per1M.toFixed(2)} / 1M tokens`;
  return `$${per1M.toFixed(4)} / 1M tokens`;
}

function loadJSON<T>(filename: string): T | null {
  const filePath = path.join(process.cwd(), 'data', filename);
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[build:data] 读取 ${filename} 失败:`, err);
    return null;
  }
}

/**
 * 从旧的 models-generated.ts 文件中提取 models 数组
 */
function loadOldModelsData(): AIModel[] | null {
  const filePath = path.join(process.cwd(), 'data', 'models-generated.ts');
  try {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // 查找 `export const models: AIModel[] = ` 后面的 JSON 数组
    const match = content.match(/export const models: AIModel\[\] = (\[[\s\S]*?\]);\s*$/m);
    if (!match) return null;
    
    return JSON.parse(match[1]) as AIModel[];
  } catch (err) {
    console.warn(`[build:data] 读取旧的 models-generated.ts 失败:`, err);
    return null;
  }
}

function metadataToAIModel(
  meta: MetadataModel,
  priceEntry: PriceSyncEntry | null,
  oldModel?: AIModel
): AIModel {
  const today = new Date().toISOString().split('T')[0];
  
  // 决定 updatedAt 的逻辑
  const getUpdatedAt = () => {
    // 1. 如果 metadata 中指定了 updatedAt，优先使用（手动更新）
    if (meta.updatedAt) return meta.updatedAt;
    // 2. 从 LiteLLM 同步的模型，更新为今天
    if (priceEntry && priceEntry.source === 'litellm') return today;
    // 3. Fallback 模型，保留旧的 updatedAt
    return oldModel?.updatedAt || today;
  };
  
  if (priceEntry && priceEntry.source === 'litellm') {
    const pricing: ModelPrice = {
      input: priceEntry.inputCostPerToken != null
        ? formatPricePer1M(priceEntry.inputCostPerToken)
        : (meta.pricing?.input || ''),
      output: priceEntry.outputCostPerToken != null
        ? formatPricePer1M(priceEntry.outputCostPerToken)
        : (meta.pricing?.output || ''),
    };

    const contextWindow = priceEntry.maxInputTokens != null
      ? formatTokenCount(priceEntry.maxInputTokens)
      : (meta.contextWindow || '-');

    const multimodal = priceEntry.supportsVision != null
      ? priceEntry.supportsVision
      : false;

    return {
      id: meta.id,
      name: meta.name,
      slug: meta.slug,
      provider: meta.provider,
      logo: meta.logo,
      description: meta.description,
      category: meta.category,
      pricing,
      contextWindow,
      multimodal,
      strengths: meta.strengths,
      benchmarkScore: meta.benchmarkScore,
      released: meta.released,
      url: meta.url,
      freeTier: meta.freeTier,
      updatedAt: getUpdatedAt(),
    };
  }

  // Fallback：使用 metadata 中的价格或 fallback
  return {
    id: meta.id,
    name: meta.name,
    slug: meta.slug,
    provider: meta.provider,
    logo: meta.logo,
    description: meta.description,
    category: meta.category,
    pricing: meta.pricing ?? { input: '', output: '' },
    contextWindow: meta.contextWindow ?? '-',
    multimodal: meta.category === 'multimodal' || false,
    strengths: meta.strengths,
    benchmarkScore: meta.benchmarkScore,
    released: meta.released,
    url: meta.url,
    freeTier: meta.freeTier,
    updatedAt: getUpdatedAt(),
  };
}

// ==================== 主函数 ====================

export async function buildData(): Promise<void> {
  console.log('[build:data] 开始构建模型数据...');

  const metadata = loadJSON<MetadataFile>('models-metadata.json');
  if (!metadata) {
    throw new Error('[build:data] 缺少 models-metadata.json');
  }

  const priceSync = loadJSON<PriceSyncFile>('models-prices.json');

  const priceMap = new Map<string, PriceSyncEntry>();
  if (priceSync) {
    for (const entry of priceSync.models) {
      priceMap.set(entry.id, entry.prices);
    }
    console.log(`[build:data] ✅ 已加载 LiteLLM 价格同步数据 (${priceSync.syncedAt})`);
  } else {
    console.log('[build:data] ⚠️  未找到 models-prices.json，使用本地 fallback 价格');
  }

  // 加载旧的生成数据以保留 updatedAt
  const oldModels = loadOldModelsData();
  const oldModelMap = new Map<string, AIModel>();
  if (oldModels) {
    for (const model of oldModels) {
      oldModelMap.set(model.id, model);
    }
    console.log(`[build:data] ✅ 已加载 ${oldModels.length} 个旧模型数据`);
  } else {
    console.log('[build:data] ⚠️  未找到旧的 models-generated.ts，所有模型将使用今日日期');
  }

  const models: AIModel[] = metadata.models.map((meta) => {
    const priceEntry = priceMap.get(meta.id) ?? null;
    const oldModel = oldModelMap.get(meta.id);
    return metadataToAIModel(meta, priceEntry, oldModel);
  });

  // 生成 TypeScript 文件
  const categoryType = "'text' | 'image' | 'video' | 'audio' | 'code' | 'multimodal' | 'open-source'";

  const tsContent = `// Auto-generated by npm run build:data
// DO NOT edit manually. Source: data/models-metadata.json + data/models-prices.json

export interface ModelPrice {
  input: string;
  output: string;
  unit?: string;
}

export interface AIModel {
  id: string;
  name: string;
  slug: string;
  provider: string;
  logo?: string;
  description: string;
  category: ModelCategory;
  pricing: ModelPrice | ModelPrice[];
  contextWindow: string;
  multimodal: boolean;
  strengths: string[];
  benchmarkScore?: number;
  released?: string;
  url: string;
  freeTier?: string;
  updatedAt: string;
}

export type ModelCategory = ${categoryType};

export const modelCategories: { id: ModelCategory; label: string; icon: string; description: string }[] = [
  { id: "text", label: "文本模型", icon: "Type", description: "LLM 对话、写作、推理" },
  { id: "image", label: "图像生成", icon: "Image", description: "AI 绘图、图像编辑" },
  { id: "video", label: "视频生成", icon: "Video", description: "AI 视频创作" },
  { id: "audio", label: "音频处理", icon: "Mic", description: "语音合成、音乐生成" },
  { id: "code", label: "代码助手", icon: "Code2", description: "编程辅助、代码生成" },
  { id: "multimodal", label: "多模态", icon: "Sparkles", description: "图文音视频综合理解" },
  { id: "open-source", label: "开源模型", icon: "Globe", description: "可自部署的开源模型" },
];

export const models: AIModel[] = ${JSON.stringify(models, null, 2)};

export function getModelBySlug(slug: string): AIModel | undefined {
  return models.find((m) => m.slug === slug);
}

export function getModelsByCategory(category: ModelCategory): AIModel[] {
  return models.filter((m) => m.category === category);
}

export function getAllCategories(): ModelCategory[] {
  return [...new Set(models.map((m) => m.category))];
}
`;

  const outputPath = path.join(process.cwd(), 'data', 'models-generated.ts');
  fs.writeFileSync(outputPath, tsContent, 'utf-8');
  console.log(`[build:data] ✅ 生成 ${models.length} 个模型 → data/models-generated.ts`);

  const today = new Date().toISOString().split('T')[0];
  const updatedCount = models.filter((m) => m.updatedAt === today).length;
  const unchangedCount = models.length - updatedCount;
  console.log(`[build:data]   完成！共 ${models.length} 个模型，今日更新 ${updatedCount} 个，保留旧日期 ${unchangedCount} 个`);
}

// 直接执行时运行
const isMain = typeof require !== 'undefined'
  ? require.main === module
  : false;

if (isMain) {
  buildData().catch((err) => {
    console.error('[build:data] ❌ 构建失败:', err);
    process.exit(1);
  });
}

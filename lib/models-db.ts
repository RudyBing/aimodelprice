// 模型数据访问层 - 从 PostgreSQL 数据库读取 AI 模型数据
// 数据源优先级：SQL 优先，SQL 抛异常或返回空数组时回退到本地 JSON（./data/spider_ai_models.json）

import sql from './db';
import { loadAiModelsFromJson } from './json-fallback';
import type { AIModel, ModelPrice, ModelCategory } from '@/data/models-generated';

// 数据库模型接口
interface DbAIModel {
  id: string;
  name: string;
  slug: string;
  provider: string;
  logo: string;
  description: string;
  category: string;
  pricing_input: string | null;
  pricing_output: string | null;
  pricing_unit: string | null;
  context_window: string;
  multimodal: boolean;
  strengths: string[];
  benchmark_score: number | null;
  composite_score: number | null;
  released: string | null;
  url: string;
  free_tier: string | null;
  updated_at: string;
}

// 将数据库记录转换为 AIModel 对象
function mapDbToModel(dbModel: DbAIModel): AIModel {
  // 构建 pricing 对象
  const pricing: ModelPrice = {
    input: dbModel.pricing_input || '',
    output: dbModel.pricing_output || '',
  };

  if (dbModel.pricing_unit) {
    pricing.unit = dbModel.pricing_unit;
  }

  return {
    id: dbModel.id,
    name: dbModel.name,
    slug: dbModel.slug,
    provider: dbModel.provider,
    logo: dbModel.logo || '',
    description: dbModel.description,
    category: dbModel.category as ModelCategory,
    pricing,
    contextWindow: dbModel.context_window,
    multimodal: dbModel.multimodal,
    strengths: dbModel.strengths || [],
    benchmarkScore: dbModel.benchmark_score || undefined,
    compositeScore: dbModel.composite_score || undefined,
    released: dbModel.released || undefined,
    url: dbModel.url,
    freeTier: dbModel.free_tier || undefined,
    updatedAt: dbModel.updated_at,
  };
}

// ---- JSON 本地回退实现（字段与 spider_ai_models 表一致）----

// 从 JSON 获取所有已发布模型（与 SQL 排序一致）
function getModelsFromJson(): AIModel[] {
  const models = loadAiModelsFromJson()
    .filter((m) => String(m.is_published) === 'true')
    .map((m) => mapDbToModel(m as unknown as DbAIModel));

  // null/undefined 分数视为 -1，保证 DESC 排序时排在所有有值记录之后（与 SQL NULLS LAST 一致）
  const score = (v: number | undefined) => (v == null ? -1 : v);

  models.sort((a, b) => {
    const compositeDiff = score(b.compositeScore) - score(a.compositeScore);
    if (compositeDiff !== 0) return compositeDiff;
    const benchDiff = score(b.benchmarkScore) - score(a.benchmarkScore);
    if (benchDiff !== 0) return benchDiff;
    if (a.provider !== b.provider) return a.provider.localeCompare(b.provider);
    return a.name.localeCompare(b.name);
  });
  return models;
}

// 从 JSON 获取单个模型
function getModelBySlugFromJson(slug: string): AIModel | null {
  const model = getModelsFromJson().find((m) => m.slug === slug);
  return model || null;
}

// 从 JSON 获取分类模型
function getModelsByCategoryFromJson(category: string): AIModel[] {
  return getModelsFromJson().filter((m) => m.category === category);
}

// 从 JSON 获取厂商列表
function getProvidersFromJson(): string[] {
  const providers = new Set(getModelsFromJson().map((m) => m.provider));
  return Array.from(providers).sort();
}

// 从 JSON 获取统计
function getModelStatsFromJson(): { modelCount: number; providerCount: number } {
  const models = getModelsFromJson();
  const providers = new Set(models.map((m) => m.provider));
  return { modelCount: models.length, providerCount: providers.size };
}

// ---- 对外数据访问函数（SQL 优先，异常/空数组回退 JSON）----

// 从数据库获取所有模型数据
export async function getModelsFromDb(): Promise<AIModel[]> {
  try {
    const models = await sql<DbAIModel[]>`
      SELECT 
        id, name, slug, provider, logo, description, category,
        pricing_input, pricing_output, pricing_unit,
        context_window, multimodal, strengths,
        benchmark_score, composite_score, released, url, free_tier, updated_at
      FROM spider_ai_models
      WHERE is_published = TRUE
      ORDER BY composite_score DESC NULLS LAST, benchmark_score DESC NULLS LAST, provider, name
    `;

    if (models.length === 0) {
      console.warn('SQL 返回空数组，回退到本地 JSON 读取模型数据');
      return getModelsFromJson();
    }

    return models.map(mapDbToModel);
  } catch (error) {
    console.error('从数据库读取模型数据失败，回退到本地 JSON:', error);
    return getModelsFromJson();
  }
}

// 根据 slug 获取单个模型
export async function getModelBySlug(slug: string): Promise<AIModel | null> {
  try {
    const models = await sql<DbAIModel[]>`
      SELECT 
        id, name, slug, provider, logo, description, category,
        pricing_input, pricing_output, pricing_unit,
        context_window, multimodal, strengths,
        benchmark_score, composite_score, released, url, free_tier, updated_at
      FROM spider_ai_models
      WHERE is_published = TRUE AND slug = ${slug}
      LIMIT 1
    `;

    if (models.length === 0) {
      return getModelBySlugFromJson(slug);
    }

    return mapDbToModel(models[0]);
  } catch (error) {
    console.error(`从数据库读取模型 ${slug} 失败，回退到本地 JSON:`, error);
    return getModelBySlugFromJson(slug);
  }
}

// 根据分类筛选模型
export async function getModelsByCategory(category: string): Promise<AIModel[]> {
  try {
    const models = await sql<DbAIModel[]>`
      SELECT 
        id, name, slug, provider, logo, description, category,
        pricing_input, pricing_output, pricing_unit,
        context_window, multimodal, strengths,
        benchmark_score, composite_score, released, url, free_tier, updated_at
      FROM spider_ai_models
      WHERE is_published = TRUE AND category = ${category}
      ORDER BY composite_score DESC NULLS LAST, provider, name
    `;

    if (models.length === 0) {
      return getModelsByCategoryFromJson(category);
    }

    return models.map(mapDbToModel);
  } catch (error) {
    console.error(`从数据库读取分类 ${category} 的模型失败，回退到本地 JSON:`, error);
    return getModelsByCategoryFromJson(category);
  }
}

// 获取所有厂商
export async function getProviders(): Promise<string[]> {
  try {
    const result = await sql<{ provider: string }[]>`
      SELECT DISTINCT provider 
      FROM spider_ai_models 
      WHERE is_published = TRUE
      ORDER BY provider
    `;

    if (result.length === 0) {
      return getProvidersFromJson();
    }

    return result.map(r => r.provider);
  } catch (error) {
    console.error('从数据库读取厂商列表失败，回退到本地 JSON:', error);
    return getProvidersFromJson();
  }
}

// 获取模型和厂商统计（供 Footer 使用）
export async function getModelStats(): Promise<{ modelCount: number; providerCount: number }> {
  try {
    const result = await sql<{ model_count: number; provider_count: number }[]>`
      SELECT 
        COUNT(*) as model_count,
        COUNT(DISTINCT provider) as provider_count
      FROM spider_ai_models
      WHERE is_published = TRUE
    `;

    if (result.length === 0) {
      return getModelStatsFromJson();
    }

    return { modelCount: result[0].model_count, providerCount: result[0].provider_count };
  } catch (error) {
    console.error('从数据库读取模型统计失败，回退到本地 JSON:', error);
    return getModelStatsFromJson();
  }
}
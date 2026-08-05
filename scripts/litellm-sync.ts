/**
 * LiteLLM 价格同步脚本
 *
 * 用法:
 *   npm run sync:prices
 *
 * 功能:
 *   1. 从 LiteLLM GitHub 拉取 model_prices_and_context_window.json
 *   2. 根据 data/models-metadata.json 中的 litellmModelId 匹配价格
 *   3. 写入 data/models-prices.json
 *
 * 同步后运行:
 *   npm run build:data
 */

import fs from 'fs';
import path from 'path';

const LITELLM_RAW_URL =
  'https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json';

const DATA_DIR = path.join(process.cwd(), 'data');

type LiteLLMData = Record<string, Record<string, unknown>>;

async function fetchLiteLLMData(): Promise<LiteLLMData> {
  console.log('[sync] 正在从 LiteLLM GitHub 拉取价格数据...');
  const res = await fetch(LITELLM_RAW_URL);
  if (!res.ok) {
    throw new Error(`LiteLLM 数据拉取失败: HTTP ${res.status} ${res.statusText}`);
  }
  const data = (await res.json()) as LiteLLMData;
  const modelCount = Object.keys(data).filter(
    (k) => k !== 'sample_spec' && k !== 'fallback_generalizations'
  ).length;
  console.log(`[sync] ✅ 拉取成功，共 ${modelCount} 个模型条目`);
  return data;
}

function findEntry(litellmData: LiteLLMData, modelId: string): Record<string, unknown> | null {
  // 精确匹配
  if (litellmData[modelId]) return litellmData[modelId];

  // 前缀匹配（找最长匹配）
  let bestMatch: Record<string, unknown> | null = null;
  let bestLen = 0;
  for (const key of Object.keys(litellmData)) {
    if (key === 'sample_spec' || key === 'fallback_generalizations') continue;
    if (key.startsWith(modelId) && key.length > bestLen) {
      bestMatch = litellmData[key];
      bestLen = key.length;
    }
  }
  return bestMatch;
}

async function main() {
  // 1. 读取本地元数据
  const metaPath = path.join(DATA_DIR, 'models-metadata.json');
  if (!fs.existsSync(metaPath)) {
    console.error('[sync] ❌ 找不到 models-metadata.json');
    process.exit(1);
  }
  const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
  console.log(`[sync] ✅ 共 ${metadata.models.length} 个模型元数据`);

  // 2. 拉取 LiteLLM
  const litellmData = await fetchLiteLLMData();

  // 3. 匹配
  const synced: Array<{ id: string; prices: Record<string, unknown> }> = [];
  for (const model of metadata.models) {
    const litellmModelId = model.litellmModelId;
    if (!litellmModelId) {
      synced.push({
        id: model.id,
        prices: { source: 'fallback' },
      });
      continue;
    }

    const entry = findEntry(litellmData, litellmModelId);
    if (!entry) {
      console.log(`[sync] ⚠️  未找到: ${litellmModelId}`);
      synced.push({ id: model.id, prices: { source: 'fallback' } });
      continue;
    }

    const prices: Record<string, unknown> = { source: 'litellm' };
    if (entry.input_cost_per_token != null) prices.inputCostPerToken = Number(entry.input_cost_per_token);
    if (entry.output_cost_per_token != null) prices.outputCostPerToken = Number(entry.output_cost_per_token);
    if (entry.max_input_tokens != null) prices.maxInputTokens = Number(entry.max_input_tokens);
    if (entry.max_output_tokens != null) prices.maxOutputTokens = Number(entry.max_output_tokens);
    if (entry.supports_vision != null) prices.supportsVision = Boolean(entry.supports_vision);

    synced.push({ id: model.id, prices });
  }

  // 4. 写入
  const output = {
    syncedAt: new Date().toISOString(),
    source: 'LiteLLM GitHub (model_prices_and_context_window.json)',
    models: synced,
  };

  const outPath = path.join(DATA_DIR, 'models-prices.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8');

  const litellmCount = synced.filter((m) => m.prices.source === 'litellm').length;
  const fallbackCount = synced.filter((m) => m.prices.source === 'fallback').length;
  console.log(`[sync] ✅ 价格同步完成 → ${outPath}`);
  console.log(`[sync]   - LiteLLM 匹配: ${litellmCount} 个`);
  console.log(`[sync]   - 本地 fallback: ${fallbackCount} 个`);
  console.log('');
  console.log('[sync] 下一步: 运行 "npm run build:data" 合并数据');
}

main().catch((err) => {
  console.error('[sync] ❌ 同步失败:', err);
  process.exit(1);
});

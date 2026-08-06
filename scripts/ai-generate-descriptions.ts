/**
 * 使用 AI 生成模型描述和优势
 * 
 * 功能：
 * 1. 读取 candidates-to-import.json
 * 2. 调用 AI API 生成 description 和 strengths
 * 3. 保存结果到 candidates-with-ai.json
 * 
 * 运行：tsx scripts/ai-generate-descriptions.ts
 * 
 * 支持的 AI 服务：
 * - Agnes 2.5 Flash (优先，快速便宜)
 * - GLM-4.7 Flash (备选，当 Agnes 失败时)
 * - DeepSeek (备用)
 * - 智谱 AI (备用)
 * - OpenAI (备用)
 * - Ollama (本地免费)
 */

import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const CANDIDATES_FILE = path.join(DATA_DIR, 'candidates-to-import.json');
const OUTPUT_FILE = path.join(DATA_DIR, 'candidates-with-ai.json');

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
}

// AI 服务配置
const AI_SERVICES = {
  agnes: {
    name: 'Agnes 2.5 Flash',
    baseUrl: 'https://apihub.agnes-ai.cn/v1', // 请根据实际情况修改
    model: 'agnes-2.5-flash',
    apiKeyEnv: 'AGNES_API_KEY',
    pricePer1K: 0, // 假设价格，请根据实际情况修改
    isPrimary: true,
  },
  glm: {
    name: 'GLM-4.7 Flash',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-4-flash',
    apiKeyEnv: 'GLM_API_KEY',
    pricePer1K: 0, // 假设价格，请根据实际情况修改
    isFallback: true,
  },
  deepseek: {
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com',
    model: 'deepseek-chat',
    apiKeyEnv: 'DEEPSEEK_API_KEY',
    pricePer1K: 0.002,
  },
  zhipu: {
    name: '智谱 AI',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-4',
    apiKeyEnv: 'ZHIPU_API_KEY',
    pricePer1K: 0.005,
  },
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    apiKeyEnv: 'OPENAI_API_KEY',
    pricePer1K: 0.00015,
  },
  ollama: {
    name: 'Ollama (本地)',
    baseUrl: 'http://localhost:11434',
    model: 'qwen2.5:7b',
    apiKeyEnv: '',
    pricePer1K: 0,
  },
};

// 选择 AI 服务（优先 Agnes，失败时切换到 GLM）
let SELECTED_SERVICE = AI_SERVICES.agnes;
let USE_FALLBACK = false;

function getApiKey(service: typeof AI_SERVICES[keyof typeof AI_SERVICES]): string {
  if (!service.apiKeyEnv) return '';
  const apiKey = process.env[service.apiKeyEnv];
  if (!apiKey) {
    throw new Error(
      `缺少 API Key: 请设置环境变量 ${service.apiKeyEnv}\n` +
      `例如：export ${service.apiKeyEnv}=your_api_key`
    );
  }
  return apiKey;
}

function generatePrompt(model: CandidateModel): string {
  return `你是一个 AI 模型专家，请为以下模型生成简短的中文介绍：

**模型信息**：
- 名称：${model.name}
- 厂商：${model.provider}
- 类别：${model.category}
- 价格：${model.pricing.input} (输入), ${model.pricing.output} (输出)
- 上下文窗口：${model.contextWindow}
- 多模态：${model.multimodal ? '支持' : '不支持'}

**任务**：
1. **描述**（50-80 字）：简洁介绍模型定位、核心能力、适用场景
2. **优势**（3-5 条）：列出该模型相比竞品的独特优势

**输出格式**（严格 JSON）：
{
  "description": "简短描述...",
  "strengths": ["优势 1", "优势 2", "优势 3"]
}

**示例**：
{
  "description": "OpenAI 最新一代推理模型，在数学、科学和编程领域表现卓越，支持复杂的多步推理任务。",
  "strengths": ["强大的推理能力", "优秀的数学和科学表现", "支持复杂任务分解"]
}`;
}

async function callAI(prompt: string, service: typeof AI_SERVICES[keyof typeof AI_SERVICES]): Promise<{ description: string; strengths: string[] }> {
  const apiKey = getApiKey(service);
  const url = `${service.baseUrl}/chat/completions`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
    },
    body: JSON.stringify({
      model: service.model,
      messages: [
        {
          role: 'system',
          content: '你是一个专业的 AI 模型分析师，擅长用简洁准确的语言描述模型特点。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI API 调用失败：${response.status} ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content.trim();

  // 解析 JSON（处理可能的 markdown 代码块）
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`AI 返回格式错误：${content}`);
  }

  try {
    const result = JSON.parse(jsonMatch[0]);
    return {
      description: result.description || '',
      strengths: Array.isArray(result.strengths) ? result.strengths : [],
    };
  } catch (e) {
    throw new Error(`JSON 解析失败：${content}`);
  }
}

async function generateDescriptions() {
  console.log('🤖 AI 服务配置：');
  console.log(`   主要服务：${AI_SERVICES.agnes.name}`);
  console.log(`   备选服务：${AI_SERVICES.glm.name}`);
  console.log('');

  // 读取候选列表
  if (!fs.existsSync(CANDIDATES_FILE)) {
    console.error('❌ 找不到 candidates-to-import.json');
    console.error('   请先运行：tsx scripts/generate-candidates.ts');
    process.exit(1);
  }

  const candidates: CandidateModel[] = JSON.parse(
    fs.readFileSync(CANDIDATES_FILE, 'utf-8')
  );

  console.log(`📦 候选模型数：${candidates.length}\n`);

  // 批量生成（限制前 50 个用于测试）
  const batchSize = 50;
  const toProcess = candidates.slice(0, batchSize);

  const results: CandidateModel[] = [];
  let totalCost = 0;
  const estimatedTokensPerModel = 200;
  
  let agnesSuccessCount = 0;
  let glmSuccessCount = 0;
  let failedCount = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const model = toProcess[i];
    console.log(`[${i + 1}/${toProcess.length}] 生成：${model.name} (${model.provider})`);

    try {
      // 优先使用 Agnes
      let aiResult;
      let usedService = AI_SERVICES.agnes;

      try {
        const prompt = generatePrompt(model);
        aiResult = await callAI(prompt, AI_SERVICES.agnes);
        agnesSuccessCount++;
        console.log(`   ✅ Agnes 生成成功`);
      } catch (agnesError) {
        // Agnes 失败，切换到 GLM
        console.log(`   ⚠️  Agnes 失败，切换到 GLM...`);
        try {
          const prompt = generatePrompt(model);
          aiResult = await callAI(prompt, AI_SERVICES.glm);
          glmSuccessCount++;
          usedService = AI_SERVICES.glm;
          console.log(`   ✅ GLM 生成成功`);
        } catch (glmError) {
          failedCount++;
          console.log(`   ❌ GLM 也失败：${(glmError as Error).message.slice(0, 60)}...`);
          results.push(model); // 保留原模型，description 留空
          continue;
        }
      }

      results.push({
        ...model,
        description: aiResult.description,
        strengths: aiResult.strengths,
      });

      const cost = (estimatedTokensPerModel / 1000) * usedService.pricePer1K;
      totalCost += cost;

      console.log(`   📝 描述：${aiResult.description.slice(0, 60)}...`);
      console.log(`   💪 优势：${aiResult.strengths.length} 条`);
    } catch (error) {
      console.error(`   ❌ 失败：${error}`);
      failedCount++;
      results.push(model);
    }

    // 避免 API 限流，每 10 个暂停 1 秒
    if ((i + 1) % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // 保存结果
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2), 'utf-8');
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ AI 生成完成！');
  console.log(`📊 生成统计：`);
  console.log(`   Agnes 成功：${agnesSuccessCount} 个`);
  console.log(`   GLM 成功：${glmSuccessCount} 个`);
  console.log(`   失败：${failedCount} 个`);
  console.log(`   成功率：${((agnesSuccessCount + glmSuccessCount) / toProcess.length * 100).toFixed(1)}%`);
  console.log(`📝 成功生成：${results.filter(r => r.description).length}/${results.length} 个`);
  console.log(`💰 预估成本：¥${totalCost.toFixed(4)} (混合使用 Agnes 和 GLM)`);
  console.log(`💾 结果已保存 → ${OUTPUT_FILE}`);
  console.log('\n下一步：');
  console.log('  1. 查看 candidates-with-ai.json 审核结果');
  console.log('  2. 手动修改不满意的描述');
  console.log('  3. 运行 tsx scripts/import-candidates.ts 导入到项目');
}

generateDescriptions().catch(err => {
  console.error('❌ 生成失败:', err);
  process.exit(1);
});

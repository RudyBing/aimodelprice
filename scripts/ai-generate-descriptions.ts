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
 * AI 服务：Agnes 2.5 Flash (主) + GLM-4.7 Flash (备) 双保险
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

interface AIService {
  name: string;
  baseUrl: string;
  model: string;
  apiKeyEnv: string;
  isPrimary: boolean;
}

// AI 服务配置：Agnes (主) + GLM (备) 双保险
const AI_SERVICES: Record<string, AIService> = {
  agnes: {
    name: 'Agnes 2.5 Flash',
    baseUrl: 'https://apihub.agnes-ai.cn/v1',
    model: 'agnes-2.5-flash',
    apiKeyEnv: 'AGNES_API_KEY',
    isPrimary: true,
  },
  glm: {
    name: 'GLM-4.7 Flash',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-4-flash',
    apiKeyEnv: 'GLM_API_KEY',
    isPrimary: false,
  },
};

// 优先使用 Agnes，失败时切换到 GLM
const PRIMARY_SERVICE = AI_SERVICES.agnes;
const FALLBACK_SERVICE = AI_SERVICES.glm;

function getApiKey(service: AIService): string {
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

async function callAI(prompt: string, service: AIService): Promise<{ description: string; strengths: string[] }> {
  const apiKey = getApiKey(service);
  const url = `${service.baseUrl}/chat/completions`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
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
  console.log('🤖 使用 AI 服务：Agnes 2.5 Flash (主) + GLM-4.7 Flash (备)\n');

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

  // 批量生成（每天 20 个）
  const batchSize = 20;
  const toProcess = candidates.slice(0, batchSize);

  const results: CandidateModel[] = [];
  let agnesSuccess = 0;
  let glmSuccess = 0;
  let failed = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const model = toProcess[i];
    console.log(`[${i + 1}/${toProcess.length}] 生成：${model.name} (${model.provider})`);

    try {
      const prompt = generatePrompt(model);
      
      // 优先使用 Agnes
      let aiResult;
      try {
        aiResult = await callAI(prompt, PRIMARY_SERVICE);
        agnesSuccess++;
        console.log(`   ✅ Agnes 成功`);
      } catch (agnesError) {
        // Agnes 失败，切换到 GLM
        console.log(`   ⚠️ Agnes 失败，切换 GLM...`);
        try {
          aiResult = await callAI(prompt, FALLBACK_SERVICE);
          glmSuccess++;
          console.log(`   ✅ GLM 成功`);
        } catch (glmError) {
          // GLM 也失败，记录失败
          failed++;
          console.log(`   ❌ GLM 也失败，跳过此模型`);
          continue; // 跳过这个模型，不添加到结果
        }
      }

      results.push({
        ...model,
        description: aiResult.description,
        strengths: aiResult.strengths,
      });

    } catch (error) {
      failed++;
      console.log(`   ❌ 失败：${error}`);
      // 不添加失败的模型
    }
  }

  // 保存到文件
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2), 'utf-8');

  console.log('\n📊 生成统计：');
  console.log(`   Agnes 成功：${agnesSuccess} 个`);
  console.log(`   GLM 成功：${glmSuccess} 个`);
  console.log(`   失败跳过：${failed} 个`);
  console.log(`   有效结果：${results.length} 个`);
  console.log(`\n✅ 结果已保存到：${OUTPUT_FILE}`);
  console.log('\n下一步：');
  console.log('  1. 检查生成的内容是否准确');
  console.log('  2. 运行：tsx scripts/import-candidates.ts 导入到项目');
}

generateDescriptions().catch(err => {
  console.error('❌ 生成失败:', err);
  process.exit(1);
});

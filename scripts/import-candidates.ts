/**
 * 导入 AI 生成的候选模型到项目
 * 
 * 功能：
 * 1. 读取 candidates-with-ai.json（已审核的模型）
 * 2. 添加到 models-metadata.json
 * 3. 自动运行 build:data 生成新数据
 * 
 * 运行：tsx scripts/import-candidates.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const DATA_DIR = path.join(process.cwd(), 'data');
const CANDIDATES_FILE = path.join(DATA_DIR, 'candidates-with-ai.json');
const METADATA_FILE = path.join(DATA_DIR, 'models-metadata.json');

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

interface MetadataModel {
  id: string;
  name: string;
  slug: string;
  provider: string;
  logo: string;
  description: string;
  category: string;
  litellmModelId?: string;
  pricing: {
    input: string;
    output: string;
    unit?: string;
  };
  contextWindow: string;
  multimodal: boolean;
  strengths: string[];
  benchmarkScore?: number;
  freeTier?: string;
  released?: string;
  url: string;
}

async function importCandidates() {
  console.log('📥 开始导入候选模型...\n');

  // 读取候选列表
  if (!fs.existsSync(CANDIDATES_FILE)) {
    console.error('❌ 找不到 candidates-with-ai.json');
    console.error('   请先运行：tsx scripts/ai-generate-descriptions.ts');
    process.exit(1);
  }

  const candidates: CandidateModel[] = JSON.parse(
    fs.readFileSync(CANDIDATES_FILE, 'utf-8')
  );

  // 不过滤，全部导入（没有 AI 描述的会使用默认模板）
  const validCandidates = candidates.map(c => ({
    ...c,
    description: c.description || `${c.name} 是 ${c.provider} 推出的${c.category}模型，具体特点待补充。`,
    strengths: c.strengths && c.strengths.length > 0 ? c.strengths : [`由${c.provider}开发`, `适用于${c.category}场景`]
  }));
  
  console.log(`📦 候选模型：${candidates.length} 个`);
  console.log(`✅ 有效模型：${validCandidates.length} 个\n`);

  if (validCandidates.length === 0) {
    console.error('❌ 没有可导入的模型');
    process.exit(1);
  }

  // 读取现有元数据
  if (!fs.existsSync(METADATA_FILE)) {
    console.error('❌ 找不到 models-metadata.json');
    process.exit(1);
  }

  const metadata: { models: MetadataModel[] } = JSON.parse(
    fs.readFileSync(METADATA_FILE, 'utf-8')
  );

  console.log(`📚 当前已有模型：${metadata.models.length} 个\n`);

  // 转换并添加
  const newModels: MetadataModel[] = validCandidates.map(candidate => {
    // 生成 URL
    const providerUrls: Record<string, string> = {
      'OpenAI': 'https://platform.openai.com/docs/models',
      'Anthropic': 'https://docs.anthropic.com/claude/docs/models-overview',
      'Google': 'https://cloud.google.com/vertex-ai/docs/generative-ai/learn/models',
      'Gemini': 'https://ai.google.dev/gemini-api/docs/models/gemini',
      'Mistral': 'https://docs.mistral.ai/getting-started/models/models_overview/',
      'XAI': 'https://docs.x.ai/docs/models',
      'Cohere': 'https://docs.cohere.com/docs/models',
      'Stability': 'https://platform.stability.ai/docs/api-reference',
    };

    return {
      id: candidate.suggestedId,
      name: candidate.name,
      slug: candidate.suggestedId,
      provider: candidate.provider,
      logo: '',
      description: candidate.description || '',
      category: candidate.category,
      litellmModelId: candidate.litellmId,
      pricing: candidate.pricing,
      contextWindow: candidate.contextWindow,
      multimodal: candidate.multimodal,
      strengths: candidate.strengths || [],
      url: providerUrls[candidate.provider] || `https://${candidate.provider.toLowerCase()}.com`,
      freeTier: candidate.pricing.input.includes('免费') ? '有' : undefined,
      released: new Date().toISOString().split('T')[0], // 今天
    };
  });

  // 添加到元数据
  const originalCount = metadata.models.length;
  metadata.models.push(...newModels);

  // 保存元数据
  fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2), 'utf-8');
  
  console.log(`✅ 成功导入 ${newModels.length} 个模型`);
  console.log(`📊 导入后总数：${metadata.models.length} 个\n`);

  // 显示新增的模型
  console.log('📋 新增模型列表：');
  newModels.forEach((m, i) => {
    console.log(`   ${i + 1}. ${m.name} (${m.provider}) - ${m.category}`);
  });

  // 自动运行 build:data
  console.log('\n🔨 正在运行 npm run build:data...');
  try {
    execSync('npm run build:data', { stdio: 'inherit' });
    console.log('\n✅ 数据构建成功！\n');
  } catch (error) {
    console.error('\n❌ 数据构建失败，请手动运行 npm run build:data');
  }

  console.log('🎉 导入完成！');
  console.log('\n下一步：');
  console.log('  1. 运行 npm run dev 查看效果');
  console.log('  2. 检查新增模型的信息是否准确');
  console.log('  3. 如有问题，修改 models-metadata.json 后重新 build:data');
}

importCandidates().catch(err => {
  console.error('❌ 导入失败:', err);
  process.exit(1);
});

/**
 * 修复重复模型 ID 脚本
 * 
 * 使用方法:
 *   npx tsx scripts/fix-duplicate-ids.ts
 * 
 * 功能:
 *   1. 检测重复 ID
 *   2. 自动重命名重复的 ID（添加后缀）
 *   3. 保存修复后的数据
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

interface AIModel {
  id: string;
  name: string;
  slug: string;
  provider: string;
  [key: string]: any;
}

interface ModelsMetadata {
  models: AIModel[];
  lastUpdated: string;
  total: number;
}

function loadModels(): ModelsMetadata {
  const metadataPath = path.join(rootDir, 'data', 'models-metadata.json');
  const content = fs.readFileSync(metadataPath, 'utf-8');
  return JSON.parse(content);
}

function saveModels(data: ModelsMetadata) {
  const metadataPath = path.join(rootDir, 'data', 'models-metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`\n💾 修复后的数据已保存到：${metadataPath}`);
}

function fixDuplicateIds(data: ModelsMetadata): ModelsMetadata {
  const seenIds = new Map<string, number>();
  const fixedModels: AIModel[] = [];
  let duplicateCount = 0;

  for (const model of data.models) {
    const count = seenIds.get(model.id) || 0;
    
    if (count > 0) {
      // 发现重复，生成新 ID
      const newId = `${model.id}-dup${count}`;
      console.log(`   ⚠️  重复 ID: ${model.id} → ${newId}`);
      fixedModels.push({
        ...model,
        id: newId,
      });
      duplicateCount++;
    } else {
      fixedModels.push(model);
    }
    
    seenIds.set(model.id, count + 1);
  }

  return {
    ...data,
    models: fixedModels,
    total: fixedModels.length,
  };
}

function main() {
  console.log('='.repeat(60));
  console.log('🔧 修复重复模型 ID');
  console.log('='.repeat(60));

  try {
    // 加载数据
    console.log('\n📂 加载模型数据...');
    const data = loadModels();
    
    console.log(`   原始模型数：${data.models.length}`);
    
    // 检测重复
    const allIds = data.models.map(m => m.id);
    const uniqueIds = new Set(allIds);
    const duplicateCount = allIds.length - uniqueIds.size;
    
    console.log(`   唯一 ID 数：${uniqueIds.size}`);
    console.log(`   重复 ID 数：${duplicateCount}`);
    
    if (duplicateCount === 0) {
      console.log('\n✅ 没有发现重复 ID，无需修复');
      return;
    }
    
    // 修复重复
    console.log('\n🔧 开始修复重复 ID...');
    const fixedData = fixDuplicateIds(data);
    
    // 验证修复结果
    const fixedIds = fixedData.models.map(m => m.id);
    const fixedUniqueIds = new Set(fixedIds);
    const fixedDuplicateCount = fixedIds.length - fixedUniqueIds.size;
    
    console.log(`\n📊 修复结果:`);
    console.log(`   修复后模型数：${fixedData.models.length}`);
    console.log(`   修复后唯一 ID 数：${fixedUniqueIds.size}`);
    console.log(`   修复后重复 ID 数：${fixedDuplicateCount}`);
    
    if (fixedDuplicateCount === 0) {
      console.log('\n✅ 所有重复 ID 已修复！');
      saveModels(fixedData);
    } else {
      console.log('\n❌ 仍有重复 ID，修复失败');
    }

  } catch (error) {
    console.error('\n❌ 修复失败:', (error as Error).message);
    process.exit(1);
  }
}

main();

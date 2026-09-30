// JSON 本地回退读取工具
// 当数据库访问受限时，从 data/ 目录读取与 spider_ai_models / spider_news 表字段一致的 JSON 文件
// 注意：JSON 文件为团队同步的来源，字段与数据库表保持一致

import fs from 'fs';
import path from 'path';

// 读取 data/ 目录下的 JSON 文件，返回数组；文件缺失或解析失败返回空数组
function loadJsonArray(filename: string): unknown[] {
  const filePath = path.join(process.cwd(), 'data', filename);
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`读取本地 JSON 文件 ${filename} 失败:`, error);
    return [];
  }
}

export function loadAiModelsFromJson(): Record<string, unknown>[] {
  return loadJsonArray('spider_ai_models.json') as Record<string, unknown>[];
}

export function loadNewsFromJson(): Record<string, unknown>[] {
  return loadJsonArray('spider_news.json') as Record<string, unknown>[];
}
/**
 * 新闻全文抓取脚本
 * 
 * 使用方法:
 *   npx tsx scripts/fetch-news-content.ts
 * 
 * 功能:
 *   1. 从 news-raw.json 读取新闻
 *   2. 抓取每条新闻的完整内容（带重试机制）
 *   3. 保存回 news-raw.json
 * 
 * 特点:
 *   - 带重试机制（最多 3 次）
 *   - 失败则放弃该条新闻
 *   - 可中断，下次继续
 */

import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

// 解决 ES Module 的 __dirname 问题
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

interface RawNews {
  id: string;
  title: string;
  summary: string;
  content: string;
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

// 抓取网页完整内容（带重试机制）
async function fetchWebContent(url: string, maxRetries: number = 3): Promise<string | null> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`    尝试抓取 (${attempt}/${maxRetries}): ${url.substring(0, 60)}...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 秒超时
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
      
      const html = await response.text();
      
      // 使用 Readability 提取主要内容
      const doc = new JSDOM(html, { url });
      const reader = new Readability(doc.window.document);
      const result = reader.parse();
      
      if (result && result.textContent) {
        const content = result.textContent.trim().substring(0, 10000); // 限制长度
        console.log(`    ✅ 成功，${content.length} 字符`);
        return content;
      }
      
      console.log(`    ⚠️  Readability 未能提取内容`);
      return null;
      
    } catch (error) {
      lastError = error as Error;
      console.log(`    ❌ 第 ${attempt} 次失败：${lastError.message}`);
      
      if (attempt < maxRetries) {
        // 指数退避：第 1 次等 1 秒，第 2 次等 2 秒
        const delay = attempt * 1000;
        console.log(`    等待 ${delay}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // 所有重试都失败
  console.log(`    ❌ 放弃抓取，已达到最大重试次数`);
  return null;
}

// 加载新闻
function loadNews(): RawNews[] {
  const rawPath = path.join(rootDir, 'data', 'news-raw.json');
  if (!fs.existsSync(rawPath)) {
    throw new Error('未找到新闻数据，请先运行：npm run fetch:news');
  }
  const content = fs.readFileSync(rawPath, 'utf-8');
  return JSON.parse(content);
}

// 保存新闻
function saveNews(news: RawNews[]) {
  const outputPath = path.join(rootDir, 'data', 'news-raw.json');
  fs.writeFileSync(outputPath, JSON.stringify(news, null, 2), 'utf-8');
  console.log(`\n💾 数据已保存到：${outputPath}`);
}

// 主函数
async function main() {
  console.log('='.repeat(60));
  console.log('📰 新闻全文抓取工具');
  console.log('='.repeat(60));

  try {
    // 加载新闻
    console.log('\n📂 加载新闻数据...');
    const allNews = loadNews();
    console.log(`   共 ${allNews.length} 条新闻`);
    
    // 过滤出没有内容的新闻
    const newsWithoutContent = allNews.filter(n => !n.content || n.content.length === 0);
    console.log(`   需要抓取全文：${newsWithoutContent.length} 条`);
    
    if (newsWithoutContent.length === 0) {
      console.log('\n✅ 所有新闻都已有全文内容！');
      return;
    }
    
    // 抓取全文
    console.log('\n🔍 开始抓取全文...');
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < newsWithoutContent.length; i++) {
      const news = newsWithoutContent[i];
      console.log(`\n[${i + 1}/${newsWithoutContent.length}] 抓取：${news.title.substring(0, 50)}...`);
      
      const content = await fetchWebContent(news.originalUrl);
      
      if (content) {
        // 更新原新闻对象
        const originalIndex = allNews.findIndex(n => n.id === news.id);
        if (originalIndex !== -1) {
          allNews[originalIndex].content = content;
        }
        successCount++;
      } else {
        // 抓取失败，从列表中移除
        const originalIndex = allNews.findIndex(n => n.id === news.id);
        if (originalIndex !== -1) {
          allNews.splice(originalIndex, 1);
        }
        failCount++;
        console.log(`   ❌ 已放弃此条新闻`);
      }
      
      // 添加延迟，避免请求过快
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 每 10 条保存一次进度
      if ((i + 1) % 10 === 0) {
        saveNews(allNews);
        console.log(`   📊 进度保存：成功 ${successCount} 条，失败 ${failCount} 条`);
      }
    }
    
    // 最终保存
    saveNews(allNews);
    
    console.log('\n✅ 全文抓取完成！');
    console.log(`   成功：${successCount} 条`);
    console.log(`   失败：${failCount} 条（已放弃）`);
    console.log(`   剩余：${allNews.length} 条`);
    console.log('\n下一步运行：npm run process:news');

  } catch (error) {
    console.error('\n❌ 抓取失败:', (error as Error).message);
    process.exit(1);
  }
}

// 执行
main();

/**
 * 测试脚本：验证新闻数据加载
 * 
 * 使用方法:
 *   npx tsx scripts/test-news.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function testNewsData() {
  console.log('='.repeat(60));
  console.log('🧪 新闻功能测试');
  console.log('='.repeat(60));
  
  // 测试 1: 检查配置文件
  console.log('\n📋 测试 1: 检查配置文件');
  const sourcesPath = path.join(rootDir, 'data', 'news-sources.json');
  if (fs.existsSync(sourcesPath)) {
    const sources = JSON.parse(fs.readFileSync(sourcesPath, 'utf-8'));
    console.log(`   ✓ news-sources.json 存在`);
    console.log(`     - RSS 源：${sources.rssSources.length} 个`);
    console.log(`     - API 关键词：${sources.apiSources.newsapi.keywords.length} 个`);
  } else {
    console.log(`   ✗ news-sources.json 不存在`);
  }
  
  // 测试 2: 检查新闻数据
  console.log('\n📰 测试 2: 检查新闻数据');
  const newsPath = path.join(rootDir, 'data', 'news-metadata.json');
  if (fs.existsSync(newsPath)) {
    const newsData = JSON.parse(fs.readFileSync(newsPath, 'utf-8'));
    console.log(`   ✓ news-metadata.json 存在`);
    console.log(`     - 新闻总数：${newsData.news.length} 条`);
    console.log(`     - 最后更新：${newsData.lastUpdated}`);
    
    // 统计分类
    const categories: Record<string, number> = {};
    newsData.news.forEach((n: any) => {
      categories[n.category] = (categories[n.category] || 0) + 1;
    });
    console.log(`     - 分类统计:`);
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`       • ${cat}: ${count} 条`);
    });
    
    // 检查字段完整性
    const requiredFields = ['id', 'slug', 'title', 'summary', 'source', 'publishedAt', 'category', 'hotness'];
    const sample = newsData.news[0];
    const missingFields = requiredFields.filter(f => !(f in sample));
    if (missingFields.length === 0) {
      console.log(`   ✓ 所有必需字段都存在`);
    } else {
      console.log(`   ✗ 缺少字段：${missingFields.join(', ')}`);
    }
  } else {
    console.log(`   ✗ news-metadata.json 不存在`);
    console.log(`     提示：运行 npm run sync:news 生成数据`);
  }
  
  // 测试 3: 检查页面文件
  console.log('\n📄 测试 3: 检查页面文件');
  const pages = [
    'app/(main)/news/page.tsx',
    'app/(main)/news/[slug]/page.tsx',
    'components/news/NewsCard.tsx',
  ];
  
  pages.forEach(page => {
    const pagePath = path.join(rootDir, page);
    if (fs.existsSync(pagePath)) {
      console.log(`   ✓ ${page}`);
    } else {
      console.log(`   ✗ ${page}`);
    }
  });
  
  // 测试 4: 检查 npm 脚本
  console.log('\n🔧 测试 4: 检查 npm 脚本');
  const packagePath = path.join(rootDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  const requiredScripts = ['fetch:news', 'process:news', 'sync:news'];
  
  requiredScripts.forEach(script => {
    if (packageJson.scripts[script]) {
      console.log(`   ✓ ${script}: ${packageJson.scripts[script]}`);
    } else {
      console.log(`   ✗ ${script} 未定义`);
    }
  });
  
  // 测试 5: 检查 Header 导航
  console.log('\n🧭 测试 5: 检查 Header 导航');
  const headerPath = path.join(rootDir, 'components', 'layout', 'Header.tsx');
  if (fs.existsSync(headerPath)) {
    const header = fs.readFileSync(headerPath, 'utf-8');
    if (header.includes('/news')) {
      console.log(`   ✓ Header 包含新闻导航`);
    } else {
      console.log(`   ✗ Header 缺少新闻导航`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ 测试完成！');
  console.log('='.repeat(60));
}

testNewsData();

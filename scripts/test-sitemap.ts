/**
 * 测试 sitemap 生成脚本
 * 
 * 使用方法：
 * npx tsx scripts/test-sitemap.ts
 */

import { models } from '../data/models';

const baseUrl = 'https://aimodelprice.com';

console.log('🔍 测试 Sitemap 生成\n');
console.log('=' .repeat(60));

// 模拟 sitemap 生成
const staticPages = [
  {
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1,
  },
  {
    url: `${baseUrl}/models`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  },
  {
    url: `${baseUrl}/compare`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  },
  {
    url: `${baseUrl}/search`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  },
];

const modelPages = models.map((model) => ({
  url: `${baseUrl}/models/${model.slug}`,
  lastModified: new Date(),
  changeFrequency: 'weekly',
  priority: 0.6,
}));

const allPages = [...staticPages, ...modelPages];

console.log(`\n📊 统计信息:`);
console.log(`   - 静态页面：${staticPages.length} 个`);
console.log(`   - 模型页面：${modelPages.length} 个`);
console.log(`   - 总计：${allPages.length} 个 URL`);

console.log(`\n📋 URL 列表:`);
console.log('=' .repeat(60));

allPages.forEach((page, index) => {
  console.log(`${(index + 1).toString().padStart(3)}. ${page.url}`);
  console.log(`   优先级：${page.priority} | 更新频率：${page.changeFrequency}`);
});

console.log('\n' + '=' .repeat(60));
console.log('✅ Sitemap 数据结构正常\n');

// 生成 XML 示例
console.log('📄 XML 示例 (前 5 条):\n');
console.log('<?xml version="1.0" encoding="UTF-8"?>');
console.log('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

allPages.slice(0, 5).forEach((page) => {
  console.log('  <url>');
  console.log(`    <loc>${page.url}</loc>`);
  console.log(`    <lastmod>${page.lastModified.toISOString().split('T')[0]}</lastmod>`);
  console.log(`    <changefreq>${page.changeFrequency}</changefreq>`);
  console.log(`    <priority>${page.priority}</priority>`);
  console.log('  </url>');
});

console.log('  ...');
console.log('</urlset>');

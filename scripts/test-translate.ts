/**
 * 测试翻译功能
 * 
 * 使用方法：
 * npx tsx scripts/test-translate.ts
 */

import { translateNewsItem, checkTranslateConfig } from './translate-news';

async function testTranslate() {
  console.log('🧪 测试翻译功能\n');
  console.log('='.repeat(60));
  
  // 检查配置
  const config = checkTranslateConfig();
  console.log('\n📊 配置检查：');
  console.log(`   腾讯翻译君：${config.tencent ? '✅' : '❌'}`);
  console.log(`   整体状态：${config.ready ? '✅ 就绪' : '❌ 未配置'}`);
  
  if (!config.ready) {
    console.log('\n⚠️  翻译配置缺失，请配置环境变量：');
    console.log('   - TENCENT_SECRET_ID, TENCENT_SECRET_KEY');
    console.log('\n参考：docs/TRANSLATE-NEWS-GUIDE.md\n');
    return;
  }
  
  // 测试用例
  const testCases = [
    {
      title: 'OpenAI Releases GPT-5 with Enhanced Reasoning',
      summary: 'OpenAI has announced GPT-5, featuring significant improvements in mathematical reasoning and code generation capabilities.',
    },
    {
      title: 'Google Gemini 3.0 Supports Multimodal Input',
      summary: 'The latest version of Gemini can now process text, images, and audio simultaneously, setting new benchmarks.',
    },
  ];
  
  console.log('\n📝 开始测试翻译...\n');
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`[${i + 1}/${testCases.length}] 测试：${testCase.title}`);
    
    try {
      const result = await translateNewsItem(testCase.title, testCase.summary);
      
      console.log(`   ✅ 翻译成功 (${result.translateService})`);
      console.log(`   原文标题：${testCase.title}`);
      console.log(`   翻译标题：${result.title}`);
      console.log(`   原文摘要：${testCase.summary.substring(0, 80)}...`);
      console.log(`   翻译摘要：${result.summary.substring(0, 80)}...`);
      
    } catch (error) {
      console.log(`   ❌ 翻译失败：${(error as Error).message}`);
    }
    
    console.log('');
  }
  
  console.log('='.repeat(60));
  console.log('✅ 测试完成\n');
}

testTranslate().catch(console.error);

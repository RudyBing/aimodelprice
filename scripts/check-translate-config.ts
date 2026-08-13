/**
 * 检查翻译配置
 */

import { checkTranslateConfig } from './translate-news';

console.log('\n🔍 检查翻译服务配置\n');

const config = checkTranslateConfig();

console.log(`  腾讯翻译君：${config.tencent ? '✅ 已配置' : '❌ 未配置'}`);
if (config.tencent) {
  console.log('    - 免费额度：500 万字符/月');
  console.log('    - 适用场景：长文本翻译，技术新闻');
  console.log('    - API 地域：广州 (ap-guangzhou)');
}

console.log('');

if (config.ready) {
  console.log('✅ 翻译服务已就绪，可以正常使用');
} else {
  console.log('❌ 翻译服务未配置，请设置环境变量:');
  console.log('   TENCENT_SECRET_ID');
  console.log('   TENCENT_SECRET_KEY');
}

console.log('');

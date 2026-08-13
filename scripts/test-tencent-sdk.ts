/**
 * 腾讯翻译君 SDK 测试脚本 - 使用 request 方法
 * 
 * 使用方法:
 *   npx tsx scripts/test-tencent-sdk.ts
 */

import * as tencentcloud from "tencentcloud-sdk-nodejs";

const TmtClient = tencentcloud.tmt.v20180321.Client;

const client = new TmtClient({
  credential: {
    secretId: process.env.TENCENT_SECRET_ID || '',
    secretKey: process.env.TENCENT_SECRET_KEY || '',
  },
  region: "ap-beijing",
  profile: {
    httpProfile: {
      endpoint: "tmt.tencentcloudapi.com",
    },
  },
});

async function test() {
  console.log('🔍 腾讯云翻译 API 测试（官方 SDK）\n');
  console.log('Secret ID:', (process.env.TENCENT_SECRET_ID || '').substring(0, 12) + '...');
  console.log('Secret Key:', process.env.TENCENT_SECRET_KEY ? '已设置' : '未设置');
  console.log('SDK:', typeof tencentcloud !== 'undefined' ? '已加载' : '未加载');
  console.log('Client methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(client)).filter(m => !m.startsWith('_')));
  console.log();

  try {
    // 尝试使用 request 方法
    const params = {
      SourceText: "Hello World",
      Source: "en",
      Target: "zh",
      ProjectId: 0,
    };

    console.log('翻译：Hello World (en → zh)');
    console.log('使用 request 方法调用 TextTranslate...');
    
    const result = await client.request("TextTranslate", params);
    console.log('✅ 翻译成功:', (result as any).TargetText);
    console.log('完整结果:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('❌ 失败:', (err as Error).message);
    console.error('错误详情:', JSON.stringify(err, null, 2));
  }
}

test();

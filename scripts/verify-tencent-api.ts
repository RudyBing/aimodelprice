/**
 * 验证腾讯云 API Key（使用官方 SDK 方式）
 * 
 * 参考：https://cloud.tencent.com/document/api/55/9077
 */

import crypto from 'crypto';
import fetch from 'node-fetch';

const TENCENT_CONFIG = {
  secretId: process.env.TENCENT_SECRET_ID?.trim() || '',
  secretKey: process.env.TENCENT_SECRET_KEY?.trim() || '',
  endpoint: 'tmt.tencentcloudapi.com',
  version: '2018-03-21',
  action: 'TextTranslate',
  region: 'ap-beijing',
};

async function verifyTencentAPI() {
  console.log('🔍 验证腾讯云 API Key\n');
  console.log('='.repeat(60));
  
  if (!TENCENT_CONFIG.secretId || !TENCENT_CONFIG.secretKey) {
    console.log('❌ 配置缺失');
    return;
  }
  
  console.log(`Secret ID: ${TENCENT_CONFIG.secretId}`);
  console.log(`Secret Key: ${TENCENT_CONFIG.secretKey}`);
  console.log(`Secret ID 长度：${TENCENT_CONFIG.secretId.length}`);
  console.log(`Secret Key 长度：${TENCENT_CONFIG.secretKey.length}`);
  console.log('');
  
  const timestamp = Math.floor(Date.now() / 1000);
  const date = new Date(timestamp * 1000).toISOString().split('T')[0];
  
  console.log(`Timestamp: ${timestamp}`);
  console.log(`Date: ${date}`);
  console.log('');
  
  // 1. 生成规范请求
  const httpRequestMethod = 'POST';
  const uri = '/';
  const queryString = '';
  
  const payload = {
    SourceText: 'Hello',
    Source: 'en',
    Target: 'zh',
    ProjectId: 0,
  };
  const requestBody = JSON.stringify(payload);
  
  // 构建规范请求头
  const canonicalHeaderDict: Record<string, string> = {
    'content-type': 'application/json; charset=utf-8',
    'host': TENCENT_CONFIG.endpoint,
    'x-tc-action': TENCENT_CONFIG.action.toLowerCase(),
    'x-tc-region': TENCENT_CONFIG.region,
    'x-tc-timestamp': timestamp.toString(),
    'x-tc-version': TENCENT_CONFIG.version,
  };
  
  // 按字母顺序排序
  const sortedKeys = Object.keys(canonicalHeaderDict).sort();
  const signedHeaders = sortedKeys.join(';');
  
  let canonicalHeaders = '';
  for (const key of sortedKeys) {
    canonicalHeaders += `${key}:${canonicalHeaderDict[key]}\n`;
  }
  
  const hashedRequestPayload = crypto.createHash('sha256').update(requestBody).digest('hex');
  
  const canonicalRequest = [
    httpRequestMethod,
    uri,
    queryString,
    canonicalHeaders,
    signedHeaders,
    hashedRequestPayload,
  ].join('\n');
  
  // 2. 生成待签名字符串
  const algorithm = 'TC3-HMAC-SHA256';
  const service = 'tmt';
  const credentialScope = `${date}/${service}/tc3_request`;
  const hashedCanonicalRequest = crypto.createHash('sha256').update(canonicalRequest).digest('hex');
  const stringToSign = [
    algorithm,
    timestamp.toString(),
    credentialScope,
    hashedCanonicalRequest,
  ].join('\n');
  
  // 3. 计算签名（关键步骤）
  console.log('签名计算过程:');
  console.log(`  SecretKey: ${TENCENT_CONFIG.secretKey}`);
  console.log(`  Date: ${date}`);
  
  const secretDate = crypto.createHmac('sha256', TENCENT_CONFIG.secretKey).update(date).digest();
  console.log(`  SecretDate (hex): ${secretDate.toString('hex')}`);
  
  const secretService = crypto.createHmac('sha256', secretDate).update(service).digest();
  console.log(`  SecretService (hex): ${secretService.toString('hex')}`);
  
  const secretSigning = crypto.createHmac('sha256', secretService).update('tc3_request').digest();
  console.log(`  SecretSigning (hex): ${secretSigning.toString('hex')}`);
  
  const signature = crypto.createHmac('sha256', secretSigning).update(stringToSign).digest('hex');
  console.log(`  Signature: ${signature}`);
  console.log('');
  
  // 4. 生成 Authorization
  const authorization = `${algorithm} Credential=${TENCENT_CONFIG.secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  
  // 5. 发送请求
  console.log('🚀 发送 API 请求...\n');
  
  try {
    const response = await fetch(`https://${TENCENT_CONFIG.endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json; charset=utf-8',
        'Host': TENCENT_CONFIG.endpoint,
        'X-TC-Action': TENCENT_CONFIG.action,
        'X-TC-Version': TENCENT_CONFIG.version,
        'X-TC-Timestamp': timestamp.toString(),
        'X-TC-Region': TENCENT_CONFIG.region,
      },
      body: requestBody,
    });
    
    console.log(`Status: ${response.status} ${response.statusText}\n`);
    
    const data = await response.json() as any;
    
    if (data.Response?.Error) {
      console.log(`❌ 错误 Code: ${data.Response.Error.Code}`);
      console.log(`❌ 错误 Message: ${data.Response.Error.Message}`);
      console.log(`📋 RequestId: ${data.Response.RequestId}`);
      console.log('');
      
      // 分析错误原因
      if (data.Response.Error.Code === 'AuthFailure.SignatureFailure') {
        console.log('💡 签名验证失败的可能原因:');
        console.log('   1. Secret Key 不正确（可能复制错误）');
        console.log('   2. 时间戳过期（超过 5 分钟）');
        console.log('   3. 签名算法细节有误');
        console.log('');
        console.log('🔗 建议:');
        console.log('   - 重新生成 API Key: https://console.cloud.tencent.com/cam/capi');
        console.log('   - 确保开通了机器翻译 TMT 服务: https://console.cloud.tencent.com/tmt');
        console.log('   - 使用腾讯云官方 SDK 测试');
      }
    } else if (data.Response?.TargetText) {
      console.log('✅ 翻译成功!');
      console.log(`  原文：${data.Response.SourceText}`);
      console.log(`  译文：${data.Response.TargetText}`);
      console.log(`  来源语言：${data.Response.Source}`);
      console.log(`  目标语言：${data.Response.Target}`);
    }
    
  } catch (error) {
    console.log(`❌ 请求失败：${(error as Error).message}`);
  }
  
  console.log('='.repeat(60));
}

verifyTencentAPI().catch(console.error);

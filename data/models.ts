// AI Model Price Data
//
// 数据流:
//   models-metadata.json (本地元数据)
//   + models-prices.json (LiteLLM 同步的价格)
//   → [npm run build:data] 合并生成 →
//   models-generated.ts (纯数据，供客户端和服务端使用)
//
// 更新数据:
//   npm run sync:prices  # 从 LiteLLM 拉取最新价格
//   npm run build:data   # 合并数据并生成 models-generated.ts

export * from './models-generated';

// 搜索页面 - Server Component 包装器
// 从数据库加载模型数据并传递给客户端组件

import { getModelsFromDb, getProviders } from '@/data/models';
import SearchPageClient from './search-client';

export default async function SearchPage() {
  // 从数据库加载模型数据
  const models = await getModelsFromDb();
  
  // 获取所有提供商列表
  const providers = await getProviders();
  
  // 传递给客户端组件
  return <SearchPageClient models={models} providers={providers} />;
}

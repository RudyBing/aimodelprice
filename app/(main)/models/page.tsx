// 模型列表页面 - Server Component
// 从数据库加载模型数据并传递给客户端组件

import { getModelsFromDb, getProviders } from '@/lib/models-db';
import ModelsPage from './models-client';

export const revalidate = 1800;

export default async function ModelsPageWrapper() {
  // 从数据库加载模型数据
  const models = await getModelsFromDb();
  
  // 获取所有提供商列表
  const providers = await getProviders();
  
  // 传递给客户端组件
  return <ModelsPage models={models} providers={providers} />;
}

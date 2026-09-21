// 模型对比页面 - Server Component 包装器
// 从数据库加载模型数据并传递给客户端组件

import { getModelsFromDb } from '@/data/models';
import ComparePageClient from './compare-client';

export const revalidate = 10800;
export const revalidateTag = 'compare';

export default async function ComparePage() {
  // 从数据库加载模型数据
  const models = await getModelsFromDb();
  
  // 传递给客户端组件
  return <ComparePageClient models={models} />;
}

// AI Model Price Data
//
// 数据流：
//   从 PostgreSQL 数据库 spider_ai_models 表读取
//
// 更新数据:
//   通过数据库操作更新 spider_ai_models 表

// 重新导出类型和常量（这些是静态的，不需要从数据库读取）
export type { AIModel, ModelPrice, ModelCategory } from './models-generated';
export { modelCategories } from './models-generated';

// 从数据库获取模型数据的函数
// 注意：这是异步函数，只能在 Server Components 或 Server Actions 中使用
export { getModelsFromDb, getModelBySlug, getModelsByCategory, getProviders, getModelStats } from '@/lib/models-db';

// 缓存的模型数据（在 Server Components 中使用）
// 为了保持向后兼容，我们提供一个同步的 models 数组
// 但推荐在新代码中直接使用 getModelsFromDb()

// 注意：由于数据库读取是异步的，无法直接导出同步的 models 数组
// 需要在 Server Components 中使用 await getModelsFromDb() 获取数据
// 
// 示例用法（在 Server Component 中）:
// import { getModelsFromDb } from '@/data/models';
// const models = await getModelsFromDb();

// PostgreSQL 数据库连接
// 使用 postgres.js 轻量级客户端

import postgres from 'postgres';

// 从环境变量获取数据库连接 URL
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('DATABASE_URL 环境变量未设置，数据库连接将不可用');
}

// 创建数据库连接池
// postgres.js 会自动管理连接池
const sql = connectionString 
  ? postgres(connectionString, {
      // 连接池配置
      max: 10, // 最大连接数
      idle_timeout: 30, // 空闲连接超时（秒）
      connect_timeout: 10, // 连接超时（秒）
    })
  : postgres();

// 测试数据库连接
export async function testConnection(): Promise<boolean> {
  try {
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.error('数据库连接失败:', error);
    return false;
  }
}

// 导出 sql 实例供其他模块使用
export default sql;

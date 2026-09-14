// 新闻页面 - Server Component 包装器
// 从数据库加载新闻数据并传递给客户端组件

import { getNewsFromDb } from '@/lib/news-db';
import NewsListPage from './news-client';

export const revalidate = 1800;

export default async function NewsPage() {
  // 从数据库加载新闻数据
  const news = await getNewsFromDb();
  
  // 传递给客户端组件
  return <NewsListPage news={news} />;
}

import { revalidateTag } from 'next/cache';

export async function POST() {
  // 爬虫完成后调用此接口，主动失效所有标签对应的缓存页面
  await revalidateTag('models-list');
  await revalidateTag('models-detail');
  await revalidateTag('news-list');
  await revalidateTag('news-detail');
  await revalidateTag('compare');
  await revalidateTag('search');

  return Response.json({ success: true });
}

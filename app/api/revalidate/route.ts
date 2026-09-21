/**
 * ISR 缓存失效接口（供爬虫调度器调用）
 *
 * 当前 revalidate 采用时间窗口方式，主动触发仅用于未来扩展。
 * 如需基于 tag 失效，需在 lib 层的 fetch 调用中添加:
 *   next: { tags: ['models-list', 'news-list', ...] }
 */
export async function POST() {
  return Response.json({ success: true, message: 'Cache revalidation triggered' });
}

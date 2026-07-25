export function paginate<T>(items: T[], page: number, pageSize: number): { pageItems: T[]; pageCount: number; clampedPage: number } {
  if (items.length === 0) return { pageItems: [], pageCount: 0, clampedPage: 0 };
  const pageCount = Math.ceil(items.length / pageSize);
  const clampedPage = Math.min(Math.max(page, 0), pageCount - 1);
  return { pageItems: items.slice(clampedPage * pageSize, clampedPage * pageSize + pageSize), pageCount, clampedPage };
}

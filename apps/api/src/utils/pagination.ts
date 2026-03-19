export interface PaginationInput {
  page?: number;
  pageSize?: number;
}

export const normalizePagination = ({ page = 1, pageSize = 12 }: PaginationInput) => {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safePageSize = Math.min(Math.max(Math.floor(pageSize), 1), 50);

  return {
    page: safePage,
    pageSize: safePageSize,
    skip: (safePage - 1) * safePageSize,
    take: safePageSize,
  };
};

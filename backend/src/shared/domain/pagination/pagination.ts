export interface PaginationInput {
  page?: number
  pageSize?: number
}

export interface Pagination {
  page: number
  pageSize: number
  skip: number
  take: number
}

export function normalizePagination(input: PaginationInput): Pagination {
  const page = Math.max(1, Math.trunc(input.page ?? 1))
  const pageSize = Math.min(100, Math.max(1, Math.trunc(input.pageSize ?? 20)))

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  }
}

import { describe, expect, it } from 'vitest'
import { normalizePagination } from '../../../src/shared/domain/pagination/pagination.js'

describe('normalizePagination', () => {
  it('uses defaults for missing pagination values', () => {
    expect(normalizePagination({})).toEqual({
      page: 1,
      pageSize: 20,
      skip: 0,
      take: 20,
    })
  })

  it('caps page size at 100', () => {
    expect(normalizePagination({ page: 2, pageSize: 500 })).toEqual({
      page: 2,
      pageSize: 100,
      skip: 100,
      take: 100,
    })
  })
})

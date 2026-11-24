import { describe, expect, it } from 'vitest';
import { offsetOf, toPage } from './pagination';

describe('offsetOf', () => {
  it('computes the offset from page and limit', () => {
    expect(offsetOf({ page: 1, limit: 10 })).toBe(0);
    expect(offsetOf({ page: 3, limit: 10 })).toBe(20);
  });
});

describe('toPage', () => {
  it('builds the page with total pages rounded up', () => {
    expect(toPage(['a', 'b'], 5, { page: 1, limit: 2 })).toEqual({
      items: ['a', 'b'],
      page: 1,
      limit: 2,
      total: 5,
      totalPages: 3,
    });
  });

  it('has at least one page even without items', () => {
    expect(toPage([], 0, { page: 1, limit: 10 }).totalPages).toBe(1);
  });
});

import { describe, expect, it } from 'vitest';
import { offsetOf, toPage } from './pagination';

describe('offsetOf', () => {
  it('calcula o deslocamento a partir de página e limite', () => {
    expect(offsetOf({ page: 1, limit: 10 })).toBe(0);
    expect(offsetOf({ page: 3, limit: 10 })).toBe(20);
  });
});

describe('toPage', () => {
  it('monta a página com o total de páginas arredondado para cima', () => {
    expect(toPage(['a', 'b'], 5, { page: 1, limit: 2 })).toEqual({
      items: ['a', 'b'],
      page: 1,
      limit: 2,
      total: 5,
      totalPages: 3,
    });
  });

  it('tem ao menos uma página mesmo sem itens', () => {
    expect(toPage([], 0, { page: 1, limit: 10 }).totalPages).toBe(1);
  });
});

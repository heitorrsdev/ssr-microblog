import type { Page } from '../shared/dto';

export interface PageRequest {
  page: number;
  limit: number;
}

export const offsetOf = ({ page, limit }: PageRequest): number => (page - 1) * limit;

export function toPage<T>(items: T[], total: number, { page, limit }: PageRequest): Page<T> {
  return { items, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

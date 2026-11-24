import type { PostDto } from '../../shared/dto';
import type { PostRow } from '../db/posts.repository';

export function toPostDto(row: PostRow): PostDto {
  return {
    id: row.id,
    body: row.body,
    createdAt: row.createdAt,
    author: { handle: row.authorHandle, displayName: row.authorDisplayName },
  };
}

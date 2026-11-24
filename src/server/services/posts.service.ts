import type { Page, PostDto } from '../../shared/dto';
import type { PostsRepository } from '../db/posts.repository';
import { NotFoundError } from '../errors';
import { offsetOf, toPage, type PageRequest } from '../pagination';
import { toPostDto } from './mappers';

export function createPostsService(deps: { posts: PostsRepository }) {
  return {
    list(request: PageRequest): Page<PostDto> {
      const rows = deps.posts.findPage({ limit: request.limit, offset: offsetOf(request) });
      return toPage(rows.map(toPostDto), deps.posts.count(), request);
    },

    get(id: number): PostDto {
      const row = deps.posts.findById(id);
      if (!row) {
        throw new NotFoundError('post_not_found', 'Post not found');
      }
      return toPostDto(row);
    },
  };
}

export type PostsService = ReturnType<typeof createPostsService>;

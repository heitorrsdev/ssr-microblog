import type { Page, PostDto, UserDto } from '../../shared/dto';
import type { PostsRepository } from '../db/posts.repository';
import type { UserRow, UsersRepository } from '../db/users.repository';
import { NotFoundError } from '../errors';
import { offsetOf, toPage, type PageRequest } from '../pagination';
import { toPostDto } from './mappers';

export function createUsersService(deps: { users: UsersRepository; posts: PostsRepository }) {
  function requireUser(handle: string): UserRow {
    const user = deps.users.findByHandle(handle);
    if (!user) {
      throw new NotFoundError('user_not_found', 'User not found');
    }
    return user;
  }

  return {
    getProfile(handle: string): UserDto {
      const user = requireUser(handle);
      return {
        handle: user.handle,
        displayName: user.displayName,
        bio: user.bio,
        createdAt: user.createdAt,
        postCount: deps.posts.count({ userId: user.id }),
      };
    },

    listPosts(handle: string, request: PageRequest): Page<PostDto> {
      const user = requireUser(handle);
      const rows = deps.posts.findPage({
        userId: user.id,
        limit: request.limit,
        offset: offsetOf(request),
      });
      return toPage(rows.map(toPostDto), deps.posts.count({ userId: user.id }), request);
    },
  };
}

export type UsersService = ReturnType<typeof createUsersService>;

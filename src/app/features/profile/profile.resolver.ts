import { inject } from '@angular/core';
import type { ResolveFn } from '@angular/router';
import { forkJoin } from 'rxjs';
import type { Page, PostDto, UserDto } from '../../../shared/dto';
import { ApiService } from '../../core/api.service';
import { orNotFound } from '../../core/not-found';
import { pageFrom } from '../../core/page-param';

export interface ProfileData {
  user: UserDto;
  posts: Page<PostDto>;
}

export const profileResolver: ResolveFn<ProfileData | null> = (route) => {
  const api = inject(ApiService);
  const notFound = orNotFound<ProfileData>();
  const handle = String(route.params['handle']);

  return forkJoin({
    user: api.getUser(handle),
    posts: api.listUserPosts(handle, pageFrom(route)),
  }).pipe(notFound);
};

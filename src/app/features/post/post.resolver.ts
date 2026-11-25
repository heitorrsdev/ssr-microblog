import { inject } from '@angular/core';
import type { ResolveFn } from '@angular/router';
import type { PostDto } from '../../../shared/dto';
import { ApiService } from '../../core/api.service';
import { orNotFound } from '../../core/not-found';

export const postResolver: ResolveFn<PostDto | null> = (route) => {
  const api = inject(ApiService);
  const notFound = orNotFound<PostDto>();

  return api.getPost(Number(route.paramMap.get('id'))).pipe(notFound);
};

import { inject } from '@angular/core';
import type { ResolveFn } from '@angular/router';
import type { Page, PostDto } from '../../../shared/dto';
import { ApiService } from '../../core/api.service';
import { pageFrom } from '../../core/page-param';

export const feedResolver: ResolveFn<Page<PostDto>> = (route) =>
  inject(ApiService).listPosts(pageFrom(route));

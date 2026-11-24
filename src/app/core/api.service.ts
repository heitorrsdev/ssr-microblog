import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Page, PostDto, UserDto } from '../../shared/dto';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  listPosts(page: number) {
    return this.http.get<Page<PostDto>>('/api/posts', { params: { page } });
  }

  getPost(id: number) {
    return this.http.get<PostDto>(`/api/posts/${id}`);
  }

  getUser(handle: string) {
    return this.http.get<UserDto>(`/api/users/${encodeURIComponent(handle)}`);
  }

  listUserPosts(handle: string, page: number) {
    return this.http.get<Page<PostDto>>(`/api/users/${encodeURIComponent(handle)}/posts`, {
      params: { page },
    });
  }
}

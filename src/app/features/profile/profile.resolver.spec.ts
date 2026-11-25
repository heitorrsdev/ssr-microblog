import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RESPONSE_INIT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { convertToParamMap, type ActivatedRouteSnapshot } from '@angular/router';
import { firstValueFrom, type Observable } from 'rxjs';
import type { Page, PostDto, UserDto } from '../../../shared/dto';
import { profileResolver, type ProfileData } from './profile.resolver';

describe('profileResolver', () => {
  const user: UserDto = {
    handle: 'maria',
    displayName: 'Maria Souza',
    bio: 'Bio',
    createdAt: '2026-11-23T12:00:00.000Z',
    postCount: 0,
  };
  const posts: Page<PostDto> = { items: [], page: 1, limit: 10, total: 0, totalPages: 1 };

  function setup(init: ResponseInit) {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RESPONSE_INIT, useValue: init },
      ],
    });
    const http = TestBed.inject(HttpTestingController);
    const resolve = (handle: string) => {
      const route = {
        params: { handle },
        paramMap: convertToParamMap({ handle }),
        queryParamMap: convertToParamMap({}),
      } as unknown as ActivatedRouteSnapshot;
      const result = TestBed.runInInjectionContext(() => profileResolver(route, {} as never));
      return firstValueFrom(result as Observable<ProfileData | null>);
    };
    return { http, resolve };
  }

  it('returns the user with their posts', async () => {
    const { http, resolve } = setup({});

    const result = resolve('maria');
    http.expectOne('/api/users/maria').flush(user);
    http.expectOne((req) => req.url === '/api/users/maria/posts').flush(posts);

    expect(await result).toEqual({ user, posts });
  });

  it('returns null and marks the response as 404 when the user does not exist', async () => {
    const init: ResponseInit = {};
    const { http, resolve } = setup(init);

    const result = resolve('ghost');
    http.expectOne('/api/users/ghost').flush('', { status: 404, statusText: 'Not Found' });

    expect(await result).toBeNull();
    expect(init.status).toBe(404);
  });
});

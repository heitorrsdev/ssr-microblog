import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RESPONSE_INIT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { convertToParamMap, type ActivatedRouteSnapshot } from '@angular/router';
import { firstValueFrom, type Observable } from 'rxjs';
import type { PostDto } from '../../../shared/dto';
import { postResolver } from './post.resolver';

describe('postResolver', () => {
  const post: PostDto = {
    id: 5,
    body: 'Olá',
    createdAt: '2026-11-23T12:00:00.000Z',
    author: { handle: 'maria', displayName: 'Maria Souza' },
  };

  function setup(init: ResponseInit) {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RESPONSE_INIT, useValue: init },
      ],
    });
    const http = TestBed.inject(HttpTestingController);
    const resolve = (id: string) => {
      const route = { paramMap: convertToParamMap({ id }) } as ActivatedRouteSnapshot;
      const result = TestBed.runInInjectionContext(() => postResolver(route, {} as never));
      return firstValueFrom(result as Observable<PostDto | null>);
    };
    return { http, resolve };
  }

  it('returns the post', async () => {
    const { http, resolve } = setup({});

    const result = resolve('5');
    http.expectOne('/api/posts/5').flush(post);

    expect(await result).toEqual(post);
  });

  it('returns null and marks the response as 404 when the post does not exist', async () => {
    const init: ResponseInit = {};
    const { http, resolve } = setup(init);

    const result = resolve('99');
    http.expectOne('/api/posts/99').flush('', { status: 404, statusText: 'Not Found' });

    expect(await result).toBeNull();
    expect(init.status).toBe(404);
  });

  it('returns null and marks the response as 404 when the id is not numeric', async () => {
    const init: ResponseInit = {};
    const { http, resolve } = setup(init);

    const result = resolve('abc');
    http.expectOne('/api/posts/NaN').flush('', { status: 400, statusText: 'Bad Request' });

    expect(await result).toBeNull();
    expect(init.status).toBe(404);
  });
});

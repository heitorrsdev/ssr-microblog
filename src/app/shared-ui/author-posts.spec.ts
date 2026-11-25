import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { Page, PostDto } from '../../shared/dto';
import { AuthorPosts } from './author-posts';

describe('AuthorPosts', () => {
  const postWith = (id: number): PostDto => ({
    id,
    body: `Post ${id}`,
    createdAt: '2026-11-23T12:00:00.000Z',
    author: { handle: 'maria', displayName: 'Maria Souza' },
  });

  const pageOf = (items: PostDto[]): Page<PostDto> => ({
    items,
    page: 1,
    limit: 10,
    total: items.length,
    totalPages: 1,
  });

  function setup() {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    const fixture = TestBed.createComponent(AuthorPosts);
    fixture.componentRef.setInput('handle', 'maria');
    fixture.componentRef.setInput('exceptId', 1);
    const http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    TestBed.tick();
    const request = http.expectOne((req) => req.url === '/api/users/maria/posts');
    const el = fixture.nativeElement as HTMLElement;
    return { fixture, request, el };
  }

  it('hides the current post and shows at most 4 others', async () => {
    const { fixture, request, el } = setup();

    request.flush(pageOf([1, 2, 3, 4, 5, 6, 7].map(postWith)));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(el.querySelectorAll('app-post-card')).toHaveLength(4);
    expect(el.textContent).not.toContain('Post 1 ');
    expect(el.textContent).toContain('Post 2');
  });

  it('shows the empty message only after the data has loaded', async () => {
    const { fixture, request, el } = setup();

    expect(el.textContent).not.toContain('Sem outros posts');

    request.flush(pageOf([postWith(1)]));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(el.textContent).toContain('Sem outros posts deste autor.');
  });

  it('renders no posts and does not throw when the request fails', async () => {
    const { fixture, request, el } = setup();

    request.flush('boom', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(el.querySelectorAll('app-post-card')).toHaveLength(0);
    expect(el.textContent).not.toContain('Sem outros posts');
  });
});

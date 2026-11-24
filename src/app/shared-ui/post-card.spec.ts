import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { PostDto } from '../../shared/dto';
import { PostCard } from './post-card';

describe('PostCard', () => {
  const post: PostDto = {
    id: 5,
    body: 'Olá mundo',
    createdAt: '2026-11-23T12:00:00.000Z',
    author: { handle: 'maria', displayName: 'Maria Souza' },
  };

  async function render() {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(PostCard);
    fixture.componentRef.setInput('post', post);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows the text, the author linking to the profile and a link to the post', async () => {
    const el = await render();

    expect(el.textContent).toContain('Olá mundo');
    expect(el.querySelector('a.author')?.getAttribute('href')).toBe('/u/maria');
    expect(el.querySelector('a.when')?.getAttribute('href')).toBe('/p/5');
  });

  it('always shows the date in UTC, the same on the server and in the browser', async () => {
    const el = await render();

    expect(el.querySelector('time')?.textContent).toContain('23/11/2026 12:00 UTC');
    expect(el.querySelector('time')?.getAttribute('datetime')).toBe('2026-11-23T12:00:00.000Z');
  });
});

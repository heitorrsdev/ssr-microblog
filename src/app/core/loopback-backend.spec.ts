import { toLoopbackUrl } from './loopback-backend';

describe('toLoopbackUrl', () => {
  const publicOrigin = 'http://localhost:4400';
  const loopbackOrigin = 'http://127.0.0.1:4000';

  it('sends same-origin requests to the loopback origin', () => {
    expect(
      toLoopbackUrl('http://localhost:4400/api/posts?page=2', publicOrigin, loopbackOrigin),
    ).toBe('http://127.0.0.1:4000/api/posts?page=2');
  });

  it('keeps requests to other origins', () => {
    expect(toLoopbackUrl('https://example.com/api/posts', publicOrigin, loopbackOrigin)).toBe(
      'https://example.com/api/posts',
    );
  });
});

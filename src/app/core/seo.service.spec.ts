import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { SITE_URL } from './site-url';
import { SeoService } from './seo.service';

describe('SeoService', () => {
  let seo: SeoService;
  let doc: Document;

  const meta = (attr: 'name' | 'property', key: string) =>
    doc.head.querySelector(`meta[${attr}="${key}"]`)?.getAttribute('content');
  const canonical = () => doc.head.querySelector('link[rel="canonical"]')?.getAttribute('href');

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: SITE_URL, useValue: 'https://example.test' }],
    });
    seo = TestBed.inject(SeoService);
    doc = TestBed.inject(DOCUMENT);
  });

  it('sets title, description, Open Graph and canonical', () => {
    seo.set({ title: 'Feed', description: 'Últimos posts', path: '/feed' });

    expect(doc.title).toBe('Feed · Microblog');
    expect(meta('name', 'description')).toBe('Últimos posts');
    expect(meta('property', 'og:title')).toBe('Feed · Microblog');
    expect(meta('property', 'og:description')).toBe('Últimos posts');
    expect(meta('property', 'og:type')).toBe('website');
    expect(meta('property', 'og:url')).toBe('https://example.test/feed');
    expect(meta('name', 'robots')).toBe('index,follow');
    expect(canonical()).toBe('https://example.test/feed');
  });

  it('uses og:type article when given', () => {
    seo.set({ title: 'Post', description: 'x', path: '/p/1', type: 'article' });

    expect(meta('property', 'og:type')).toBe('article');
  });

  it('updates the existing canonical instead of duplicating it', () => {
    seo.set({ title: 'A', description: 'a', path: '/a' });
    seo.set({ title: 'B', description: 'b', path: '/b' });

    expect(doc.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(canonical()).toBe('https://example.test/b');
  });

  it('without a path removes canonical and og:url; noindex sets robots', () => {
    seo.set({ title: 'A', description: 'a', path: '/a' });
    seo.set({ title: 'Não encontrado', description: 'x', noindex: true });

    expect(canonical()).toBeUndefined();
    expect(meta('property', 'og:url')).toBeUndefined();
    expect(meta('name', 'robots')).toBe('noindex');
  });
});

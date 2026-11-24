import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Pagination } from './pagination';

describe('Pagination', () => {
  async function render(page: number, totalPages: number) {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Pagination);
    fixture.componentRef.setInput('page', page);
    fixture.componentRef.setInput('totalPages', totalPages);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  const linkTexts = (el: HTMLElement) =>
    Array.from(el.querySelectorAll('a')).map((a) => a.textContent?.trim());

  it('renders nothing with a single page', async () => {
    expect((await render(1, 1)).querySelector('nav')).toBeNull();
  });

  it('on the first page only has "Próxima"', async () => {
    const el = await render(1, 3);

    expect(linkTexts(el)).toEqual(['Próxima']);
    expect(el.querySelector('a')?.getAttribute('href')).toContain('page=2');
  });

  it('in the middle has "Anterior" and "Próxima"', async () => {
    const el = await render(2, 3);

    expect(linkTexts(el)).toEqual(['Anterior', 'Próxima']);
    expect(el.textContent).toContain('Página 2 de 3');
  });

  it('on the last page only has "Anterior"', async () => {
    expect(linkTexts(await render(3, 3))).toEqual(['Anterior']);
  });
});

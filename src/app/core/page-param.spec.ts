import { ActivatedRouteSnapshot, convertToParamMap } from '@angular/router';
import { pageFrom } from './page-param';

const routeWith = (query: Record<string, string | undefined>) =>
  ({ queryParamMap: convertToParamMap(query) }) as ActivatedRouteSnapshot;

describe('pageFrom', () => {
  it('uses the page given in the query', () => {
    expect(pageFrom(routeWith({ page: '3' }))).toBe(3);
  });

  it.each([{}, { page: '0' }, { page: '-2' }, { page: 'abc' }, { page: '1.5' }])(
    'falls back to 1 when the value is missing or invalid (%j)',
    (query) => {
      expect(pageFrom(routeWith(query))).toBe(1);
    },
  );
});

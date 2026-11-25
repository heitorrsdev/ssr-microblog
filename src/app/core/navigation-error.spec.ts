import { ErrorHandler, RESPONSE_INIT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NavigationError, RedirectCommand, Router, provideRouter } from '@angular/router';
import { handleNavigationError } from './navigation-error';

describe('handleNavigationError', () => {
  const cause = new Error('api down');
  const handleError = vi.fn();

  function run(init: ResponseInit | null) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: RESPONSE_INIT, useValue: init },
        { provide: ErrorHandler, useValue: { handleError } },
      ],
    });
    const navigationError = new NavigationError(1, '/p/1', cause);
    return TestBed.runInInjectionContext(() => handleNavigationError(navigationError));
  }

  beforeEach(() => handleError.mockClear());

  it('logs the error and redirects to the error page without changing the address', () => {
    const result = run({});

    expect(handleError).toHaveBeenCalledWith(cause);
    expect(result).toBeInstanceOf(RedirectCommand);
    expect(TestBed.inject(Router).serializeUrl(result.redirectTo as never)).toBe('/erro');
    expect(result.navigationBehaviorOptions).toEqual({ skipLocationChange: true });
  });

  it('marks the response as 500 with no cache, keeping the existing headers', () => {
    const init: ResponseInit = { headers: new Headers({ 'Content-Type': 'text/html' }) };

    run(init);

    expect(init.status).toBe(500);
    expect(new Headers(init.headers).get('Cache-Control')).toBe('no-store');
    expect(new Headers(init.headers).get('Content-Type')).toBe('text/html');
  });

  it('works in the browser, where RESPONSE_INIT is null', () => {
    expect(run(null)).toBeInstanceOf(RedirectCommand);
  });
});

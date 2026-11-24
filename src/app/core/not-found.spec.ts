import { HttpErrorResponse } from '@angular/common/http';
import { RESPONSE_INIT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError, type Observable } from 'rxjs';
import { orNotFound } from './not-found';

describe('orNotFound', () => {
  const run = <T>(source$: Observable<T>) =>
    TestBed.runInInjectionContext(() => firstValueFrom(source$.pipe(orNotFound())));

  it('keeps the value when there is no error', async () => {
    TestBed.configureTestingModule({ providers: [{ provide: RESPONSE_INIT, useValue: {} }] });

    expect(await run(of('ok'))).toBe('ok');
  });

  it('converts 404 and 400 to null and marks the response as status 404 with no cache', async () => {
    const init: ResponseInit = {};
    TestBed.configureTestingModule({ providers: [{ provide: RESPONSE_INIT, useValue: init }] });

    expect(await run(throwError(() => new HttpErrorResponse({ status: 404 })))).toBeNull();
    expect(await run(throwError(() => new HttpErrorResponse({ status: 400 })))).toBeNull();
    expect(init.status).toBe(404);
    expect(new Headers(init.headers).get('Cache-Control')).toBe('no-store');
  });

  it('works in the browser, where RESPONSE_INIT is null', async () => {
    TestBed.configureTestingModule({ providers: [{ provide: RESPONSE_INIT, useValue: null }] });

    expect(await run(throwError(() => new HttpErrorResponse({ status: 404 })))).toBeNull();
  });

  it('propagates errors that are not 404/400', async () => {
    TestBed.configureTestingModule({ providers: [{ provide: RESPONSE_INIT, useValue: {} }] });

    await expect(
      run(throwError(() => new HttpErrorResponse({ status: 500 }))),
    ).rejects.toBeInstanceOf(HttpErrorResponse);
  });
});

import { HttpErrorResponse } from '@angular/common/http';
import { RESPONSE_INIT, inject } from '@angular/core';
import { catchError, of, throwError, type OperatorFunction } from 'rxjs';

// Must be called in an injection context.
export function orNotFound<T>(): OperatorFunction<T, T | null> {
  const responseInit = inject(RESPONSE_INIT, { optional: true });

  return catchError((error: unknown) => {
    if (error instanceof HttpErrorResponse && (error.status === 404 || error.status === 400)) {
      if (responseInit) {
        responseInit.status = 404;
        const headers = new Headers(responseInit.headers);
        headers.set('Cache-Control', 'no-store');
        responseInit.headers = headers;
      }
      return of(null);
    }
    return throwError(() => error);
  });
}

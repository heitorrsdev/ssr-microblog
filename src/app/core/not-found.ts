import { HttpErrorResponse } from '@angular/common/http';
import { RESPONSE_INIT, inject } from '@angular/core';
import { catchError, of, throwError, type OperatorFunction } from 'rxjs';
import { setUncachedStatus } from './response-status';

// Must be called in an injection context.
export function orNotFound<T>(): OperatorFunction<T, T | null> {
  const responseInit = inject(RESPONSE_INIT, { optional: true });

  return catchError((error: unknown) => {
    if (error instanceof HttpErrorResponse && (error.status === 404 || error.status === 400)) {
      setUncachedStatus(responseInit, 404);
      return of(null);
    }
    return throwError(() => error);
  });
}

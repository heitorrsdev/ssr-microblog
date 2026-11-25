import { ErrorHandler, RESPONSE_INIT, inject } from '@angular/core';
import { NavigationError, RedirectCommand, Router } from '@angular/router';
import { setUncachedStatus } from './response-status';

const ERROR_PATH = '/erro';

export function handleNavigationError({
  error,
  url,
}: NavigationError): RedirectCommand | undefined {
  inject(ErrorHandler).handleError(error);
  setUncachedStatus(inject(RESPONSE_INIT, { optional: true }), 500);
  if (url === ERROR_PATH) {
    return undefined;
  }
  return new RedirectCommand(inject(Router).parseUrl(ERROR_PATH), { skipLocationChange: true });
}

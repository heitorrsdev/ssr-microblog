import { ErrorHandler, RESPONSE_INIT, inject } from '@angular/core';
import { NavigationError, RedirectCommand, Router } from '@angular/router';
import { setUncachedStatus } from './response-status';

export function handleNavigationError({ error }: NavigationError): RedirectCommand {
  inject(ErrorHandler).handleError(error);
  setUncachedStatus(inject(RESPONSE_INIT, { optional: true }), 500);
  return new RedirectCommand(inject(Router).parseUrl('/erro'), { skipLocationChange: true });
}

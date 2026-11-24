import { DOCUMENT } from '@angular/common';
import { InjectionToken, REQUEST_CONTEXT, inject } from '@angular/core';

// On the server it comes from the request context (`SITE_URL` env); in the browser, from the current origin.
export const SITE_URL = new InjectionToken<string>('SITE_URL', {
  providedIn: 'root',
  factory: () => {
    const context = inject(REQUEST_CONTEXT, { optional: true }) as { siteUrl?: string } | null;
    return context?.siteUrl ?? inject(DOCUMENT).location.origin;
  },
});

import { FetchBackend, HttpRequest } from '@angular/common/http';
import { Injectable, REQUEST, REQUEST_CONTEXT, inject } from '@angular/core';

export function toLoopbackUrl(url: string, publicOrigin: string, loopbackOrigin: string): string {
  const target = new URL(url);
  if (target.origin !== publicOrigin) {
    return url;
  }
  return new URL(target.pathname + target.search, loopbackOrigin).toString();
}

// The public origin (Host header) may not be reachable from inside the server, e.g. behind a
// proxy or a remapped container port. Running last, after the transfer cache, keeps its keys.
@Injectable()
export class LoopbackBackend extends FetchBackend {
  private readonly request = inject(REQUEST, { optional: true });
  private readonly loopbackOrigin = (
    inject(REQUEST_CONTEXT, { optional: true }) as { loopbackOrigin?: string } | null
  )?.loopbackOrigin;

  override handle(req: HttpRequest<unknown>) {
    if (!this.request || !this.loopbackOrigin) {
      return super.handle(req);
    }
    const publicOrigin = new URL(this.request.url).origin;
    return super.handle(
      req.clone({ url: toLoopbackUrl(req.url, publicOrigin, this.loopbackOrigin) }),
    );
  }
}

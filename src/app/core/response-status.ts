export function setUncachedStatus(responseInit: ResponseInit | null, status: number): void {
  if (!responseInit) {
    return;
  }
  const headers = new Headers(responseInit.headers);
  headers.set('Cache-Control', 'no-store');
  responseInit.status = status;
  responseInit.headers = headers;
}

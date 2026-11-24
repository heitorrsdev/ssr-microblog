import type { ActivatedRouteSnapshot } from '@angular/router';

export function pageFrom(route: ActivatedRouteSnapshot): number {
  const value = Number(route.queryParamMap.get('page'));
  return Number.isInteger(value) && value >= 1 ? value : 1;
}

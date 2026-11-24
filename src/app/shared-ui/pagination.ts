import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pagination',
  imports: [RouterLink],
  template: `
    @if (totalPages() > 1) {
      <nav class="pagination" aria-label="Paginação">
        @if (page() > 1) {
          <a [routerLink]="[]" [queryParams]="{ page: page() - 1 }">Anterior</a>
        }
        <span>Página {{ page() }} de {{ totalPages() }}</span>
        @if (page() < totalPages()) {
          <a [routerLink]="[]" [queryParams]="{ page: page() + 1 }">Próxima</a>
        }
      </nav>
    }
  `,
})
export class Pagination {
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();
}

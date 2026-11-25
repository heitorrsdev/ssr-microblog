import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo.service';

@Component({
  selector: 'app-error-page',
  imports: [RouterLink],
  template: `
    <h1>Algo deu errado</h1>
    <p>Não foi possível carregar esta página. Tente novamente em instantes.</p>
    <a routerLink="/feed">Voltar ao feed</a>
  `,
})
export class ErrorPage {
  constructor() {
    inject(SeoService).set({
      title: 'Algo deu errado',
      description: 'Erro ao carregar a página.',
      noindex: true,
    });
  }
}

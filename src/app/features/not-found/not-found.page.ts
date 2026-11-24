import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo.service';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  template: `
    <h1>Página não encontrada</h1>
    <p>O endereço que você acessou não existe.</p>
    <a routerLink="/feed">Voltar ao feed</a>
  `,
})
export class NotFoundPage {
  constructor() {
    inject(SeoService).set({
      title: 'Página não encontrada',
      description: 'Página não encontrada.',
      noindex: true,
    });
  }
}

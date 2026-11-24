import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo.service';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  template: `
    <section class="hero">
      <h1>Microblog</h1>
      <p>Pensamentos curtos, renderizados no servidor.</p>
      <a class="button" routerLink="/feed">Ver o feed</a>
    </section>
  `,
})
export class HomePage {
  constructor() {
    // Prerendered page: no path, because the public URL is only known at runtime.
    inject(SeoService).set({
      title: 'Início',
      description: 'Microblog de estudo com Angular e renderização no servidor.',
    });
  }
}

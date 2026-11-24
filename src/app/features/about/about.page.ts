import { Component, inject } from '@angular/core';
import { SeoService } from '../../core/seo.service';

@Component({
  selector: 'app-about-page',
  template: `
    <h1>Sobre</h1>
    <p>
      Este projeto existe para estudar renderização no servidor (SSR) com Angular: páginas estáticas
      geradas no build, páginas dinâmicas renderizadas a cada requisição, SEO, cache HTTP e
      hidratação incremental.
    </p>
  `,
})
export class AboutPage {
  constructor() {
    inject(SeoService).set({
      title: 'Sobre',
      description: 'Sobre o projeto de estudo de SSR com Angular.',
    });
  }
}

import { Component, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { PostDto } from '../../../shared/dto';
import { SeoService } from '../../core/seo.service';
import { excerpt } from '../../core/text';
import { AuthorPosts } from '../../shared-ui/author-posts';
import { PostCard } from '../../shared-ui/post-card';

@Component({
  selector: 'app-post-page',
  imports: [PostCard, AuthorPosts, RouterLink],
  template: `
    @if (post(); as current) {
      <h1>Post de {{ current.author.displayName }}</h1>
      <app-post-card [post]="current" />
      @defer (on viewport; hydrate on viewport) {
        <app-author-posts [handle]="current.author.handle" [exceptId]="current.id" />
      } @placeholder {
        <p class="placeholder">Mais posts do autor…</p>
      }
    } @else {
      <h1>Post não encontrado</h1>
      <a routerLink="/feed">Voltar ao feed</a>
    }
  `,
})
export class PostPage {
  readonly post = input.required<PostDto | null>();
  private readonly seo = inject(SeoService);

  constructor() {
    effect(() => {
      const current = this.post();
      if (!current) {
        this.seo.set({
          title: 'Post não encontrado',
          description: 'Post não encontrado.',
          noindex: true,
        });
        return;
      }
      this.seo.set({
        title: `Post de ${current.author.displayName}`,
        description: excerpt(current.body, 160),
        path: `/p/${current.id}`,
        type: 'article',
      });
    });
  }
}

import { Component, effect, inject, input } from '@angular/core';
import type { Page, PostDto } from '../../../shared/dto';
import { SeoService } from '../../core/seo.service';
import { Pagination } from '../../shared-ui/pagination';
import { PostCard } from '../../shared-ui/post-card';

@Component({
  selector: 'app-feed-page',
  imports: [PostCard, Pagination],
  template: `
    <h1>Feed</h1>
    @for (post of feed().items; track post.id) {
      <app-post-card [post]="post" />
    } @empty {
      <p>Nenhum post nesta página.</p>
    }
    <app-pagination [page]="feed().page" [totalPages]="feed().totalPages" />
  `,
})
export class FeedPage {
  readonly feed = input.required<Page<PostDto>>();
  private readonly seo = inject(SeoService);

  constructor() {
    effect(() => {
      const { page } = this.feed();
      this.seo.set({
        title: page === 1 ? 'Feed' : `Feed · página ${page}`,
        description: 'Últimos posts do microblog.',
        path: page === 1 ? '/feed' : `/feed?page=${page}`,
      });
    });
  }
}

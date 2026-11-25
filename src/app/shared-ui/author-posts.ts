import { Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ApiService } from '../core/api.service';
import { PostCard } from './post-card';

@Component({
  selector: 'app-author-posts',
  imports: [PostCard],
  template: `
    <section aria-labelledby="more-title">
      <h2 id="more-title">Mais posts de &#64;{{ handle() }}</h2>
      @for (post of others(); track post.id) {
        <app-post-card [post]="post" />
      } @empty {
        <p>Sem outros posts deste autor.</p>
      }
    </section>
  `,
})
export class AuthorPosts {
  readonly handle = input.required<string>();
  readonly exceptId = input.required<number>();

  private readonly api = inject(ApiService);
  private readonly page = rxResource({
    params: () => this.handle(),
    stream: ({ params }) => this.api.listUserPosts(params, 1),
  });

  protected readonly others = computed(() =>
    (this.page.value()?.items ?? []).filter((post) => post.id !== this.exceptId()).slice(0, 4),
  );
}

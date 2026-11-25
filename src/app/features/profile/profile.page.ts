import { Component, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { excerpt } from '../../core/text';
import { SeoService } from '../../core/seo.service';
import { Pagination } from '../../shared-ui/pagination';
import { PostCard } from '../../shared-ui/post-card';
import type { ProfileData } from './profile.resolver';

@Component({
  selector: 'app-profile-page',
  imports: [PostCard, Pagination, RouterLink],
  template: `
    @if (profile(); as data) {
      <header class="profile">
        <h1>{{ data.user.displayName }}</h1>
        <p class="handle">&#64;{{ data.user.handle }}</p>
        <p>{{ data.user.bio }}</p>
        <p>{{ data.user.postCount }} posts</p>
      </header>
      @for (post of data.posts.items; track post.id) {
        <app-post-card [post]="post" />
      } @empty {
        <p>Nenhum post nesta página.</p>
      }
      <app-pagination [page]="data.posts.page" [totalPages]="data.posts.totalPages" />
    } @else {
      <h1>Perfil não encontrado</h1>
      <a routerLink="/feed">Voltar ao feed</a>
    }
  `,
})
export class ProfilePage {
  readonly profile = input.required<ProfileData | null>();
  private readonly seo = inject(SeoService);

  constructor() {
    effect(() => {
      const data = this.profile();
      if (!data) {
        this.seo.set({
          title: 'Perfil não encontrado',
          description: 'Perfil não encontrado.',
          noindex: true,
        });
        return;
      }
      const { user, posts } = data;
      const base = `/u/${user.handle}`;
      this.seo.set({
        title: `${user.displayName} (@${user.handle})`,
        description: excerpt(user.bio || `Posts de ${user.displayName}.`, 160),
        path: posts.page === 1 ? base : `${base}?page=${posts.page}`,
      });
    });
  }
}

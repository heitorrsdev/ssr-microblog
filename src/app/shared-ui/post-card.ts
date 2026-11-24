import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { PostDto } from '../../shared/dto';

@Component({
  selector: 'app-post-card',
  imports: [RouterLink, DatePipe],
  template: `
    <article class="post-card">
      <header>
        <a class="author" [routerLink]="['/u', post().author.handle]">{{
          post().author.displayName
        }}</a>
        <span class="handle">&#64;{{ post().author.handle }}</span>
      </header>
      <p class="body">{{ post().body }}</p>
      <a class="when" [routerLink]="['/p', post().id]">
        <time [attr.datetime]="post().createdAt">{{
          post().createdAt | date: "dd/MM/yyyy HH:mm 'UTC'" : 'UTC'
        }}</time>
      </a>
    </article>
  `,
})
export class PostCard {
  readonly post = input.required<PostDto>();
}

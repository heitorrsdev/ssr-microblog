import { Routes } from '@angular/router';
import { ErrorPage } from './features/error/error.page';
import { feedResolver } from './features/feed/feed.resolver';
import { postResolver } from './features/post/post.resolver';
import { profileResolver } from './features/profile/profile.resolver';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'sobre',
    loadComponent: () => import('./features/about/about.page').then((m) => m.AboutPage),
  },
  {
    path: 'feed',
    loadComponent: () => import('./features/feed/feed.page').then((m) => m.FeedPage),
    resolve: { feed: feedResolver },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
  },
  {
    path: 'u/:handle',
    loadComponent: () => import('./features/profile/profile.page').then((m) => m.ProfilePage),
    resolve: { profile: profileResolver },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
  },
  {
    path: 'p/:id',
    loadComponent: () => import('./features/post/post.page').then((m) => m.PostPage),
    resolve: { post: postResolver },
  },
  {
    path: 'erro',
    component: ErrorPage,
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];

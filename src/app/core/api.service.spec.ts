import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let api: ApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists posts with the page in the query', () => {
    api.listPosts(2).subscribe();

    const req = http.expectOne((r) => r.url === '/api/posts' && r.params.get('page') === '2');
    req.flush({ items: [], page: 2, limit: 10, total: 0, totalPages: 1 });
  });

  it('fetches a post by id', () => {
    api.getPost(7).subscribe();

    http.expectOne('/api/posts/7').flush({});
  });

  it("fetches the user's profile and posts", () => {
    api.getUser('maria').subscribe();
    api.listUserPosts('maria', 3).subscribe();

    http.expectOne('/api/users/maria').flush({});
    http
      .expectOne((r) => r.url === '/api/users/maria/posts' && r.params.get('page') === '3')
      .flush({});
  });
});

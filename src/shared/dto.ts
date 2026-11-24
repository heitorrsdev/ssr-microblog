export interface AuthorDto {
  handle: string;
  displayName: string;
}

export interface PostDto {
  id: number;
  body: string;
  createdAt: string;
  author: AuthorDto;
}

export interface UserDto {
  handle: string;
  displayName: string;
  bio: string;
  createdAt: string;
  postCount: number;
}

export interface Page<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

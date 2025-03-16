import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  map,
  of,
  switchMap,
} from 'rxjs';
import { BlogPost } from '../models/blog-post';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private apiUrl = 'https://dummyjson.com/posts';
  private refreshTrigger = new BehaviorSubject<void>(undefined);

  constructor(private http: HttpClient) {}

  getPosts() {
    return this.refreshTrigger.pipe(
      debounceTime(300),
      switchMap(() =>
        this.http.get<{ posts: BlogPost[] }>(this.apiUrl).pipe(
          map((response) =>
            response.posts
          .filter((post) => post.reactions.likes > 2 && post.reactions.dislikes > 2)
          .sort((a, b) => b.reactions.likes - a.reactions.likes)
          ),
          catchError(() => of([]))
        )
      )
    );
  }

  refreshPosts() {
    this.refreshTrigger.next();
  }
}

import { Component } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { BlogService } from '../../services/blog.service';
import { BlogPost } from '../../models/blog-post';
import { BlogFilterComponent } from '../blog-filter/blog-filter.component';
import { BlogItemComponent } from '../blog-item/blog-item.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-blog-list',
  imports: [BlogFilterComponent, BlogItemComponent, CommonModule],
  templateUrl: './blog-list.component.html',
  styleUrl: './blog-list.component.css',
})
export class BlogListComponent {
  posts$!: Observable<BlogPost[]>;
  searchTerm = new BehaviorSubject<string>('');

  loading = true;
  error = '';

  constructor(private blogService: BlogService) {}

  ngOnInit() {
    const filteredPosts$ = this.searchTerm.pipe(
      map((search) => search.toLowerCase())
    );
    this.posts$ = combineLatest([
      this.blogService.getPosts(),
      filteredPosts$,
    ]).pipe(
      map(([posts, search]) =>
        posts.filter((post) => post.title.toLowerCase().includes(search))
      )
    );
  }

  refresh() {
    this.blogService.refreshPosts();
  }
  filterPosts(search: string) {
    this.searchTerm.next(search);
  }
}

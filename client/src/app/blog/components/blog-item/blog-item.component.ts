import { Component, Input } from '@angular/core';
import { BlogPost } from '../../models/blog-post';

@Component({
  selector: 'app-blog-item',
  imports: [],
  templateUrl: './blog-item.component.html',
  styleUrl: './blog-item.component.css',
})
export class BlogItemComponent {
  @Input() post!: BlogPost;
  ngOnInit() {
  }
}

import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-blog-filter',
  imports: [ReactiveFormsModule],
  templateUrl: './blog-filter.component.html',
  styleUrl: './blog-filter.component.css',
})
export class BlogFilterComponent {
  searchControl = new FormControl('');
  @Output() search = new EventEmitter<string>();

  constructor() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe((value) => {
        this.search.emit(value ?? '');
      });
  }
}

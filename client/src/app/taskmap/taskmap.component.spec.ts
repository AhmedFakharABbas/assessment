import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskmapComponent } from './taskmap.component';

describe('TaskmapComponent', () => {
  let component: TaskmapComponent;
  let fixture: ComponentFixture<TaskmapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskmapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

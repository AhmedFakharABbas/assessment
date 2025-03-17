import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TaskService } from '../services/task.service';
import { WebSocketService } from '../services/web-socket.service';

@Component({
  selector: 'app-board',
  imports: [DragDropModule, CommonModule, CdkDropList, CdkDrag],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css',
})
export class BoardComponent {
  constructor(private taskService: TaskService,
    private webSocketService: WebSocketService) { }
  todo = ['Get to work', 'Pick up groceries', 'Go home', 'Fall asleep'];
  inProgress = ['Work on Angular project'];
  done = ['Review code'];

  ngOnInit() {
    // Subscribe to WebSocket messages to receive real-time updates
    this.webSocketService.messages.subscribe((message: any) => {
      // Example: update task arrays based on message.action (create/update/delete)
      console.log('WebSocket message:', message);
      // Implement your logic to update tasks
    });
  }
  drop(event: CdkDragDrop<string[]>) {
    console.log('Previous Container:', event.previousContainer.data);
    console.log('Current Container:', event.container.data);
    
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }
  
}

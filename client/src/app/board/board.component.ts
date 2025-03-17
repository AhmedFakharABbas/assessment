import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from "@angular/cdk/drag-drop";
import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { TaskService } from "../services/task.service";
import { WebSocketService } from "../services/web-socket.service";
import { map } from "rxjs";
import { Task } from "../tasks/task.model";
import { RouterModule, RouterOutlet } from "@angular/router";

@Component({
  selector: "app-board",
  imports: [DragDropModule, CommonModule, CdkDropList, CdkDrag, RouterModule],
  templateUrl: "./board.component.html",
  styleUrl: "./board.component.css",
})
export class BoardComponent {
  constructor(
    private taskService: TaskService,
    private webSocketService: WebSocketService
  ) {}
  todo: Task[] = [];
  inProgress: Task[] = [];
  done: Task[] = [];

  ngOnInit() {
    // Subscribe to WebSocket messages to receive real-time updates
    this.webSocketService.messages.subscribe((message: any) => {
      // Example: update task arrays based on message.action (create/update/delete)
      console.log("WebSocket message:", message);
      // Implement your logic to update tasks
    });
    this.taskService
      .getTasks()
      .pipe(
        map((tasks: Task[]) => ({
          todo: tasks.filter((task) => task?.status === "To Do"),
          inProgress: tasks.filter((task) => task.status === "In Progress"),
          done: tasks.filter((task) => task.status === "Completed"),
        }))
      )
      .subscribe((sortedTasks) => {
        this.todo = sortedTasks.todo;
        this.inProgress = sortedTasks.inProgress;
        this.done = sortedTasks.done;
      });
  }
  drop(event: CdkDragDrop<Task[]>) {
    const task = event.previousContainer.data[event.previousIndex];

    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      let newStatus: "To Do" | "In Progress" | "Completed" | "" = "";
      if (event.container.id === "cdk-drop-list-0") {
        newStatus = "To Do";
      } else if (event.container.id === "cdk-drop-list-1") {
        newStatus = "In Progress";
      } else if (event.container.id === "cdk-drop-list-2") {
        newStatus = "Completed";
      }
      if (newStatus && task.status !== newStatus) {
        // Update UI immediately for smooth UX
        task.status = newStatus;
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
        task.status = newStatus;
        // Call API to update status
        this.taskService.updateTaskStatus(task.id, task).subscribe({
          next: (response) => console.log("Task updated:", response),
          error: (error) => console.error("Error updating task:", error),
        });
      }
    }
  }
}

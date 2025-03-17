import { Component } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { TaskService } from "../services/task.service";
import { Task } from "../tasks/task.model";
import { Router, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-create-task",
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: "./create-task.component.html",
  styleUrl: "./create-task.component.css",
})
export class CreateTaskComponent {
  taskForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private router: Router
  ) {
    this.taskForm = this.fb.group({
      name: ["", Validators.required],
      description: [""],
      status: ["In Progress", Validators.required],
      created_by: [1, Validators.required], // Hardcoded for now; replace with logged-in user
      latitude: ["", Validators.required],
      longitude: ["", Validators.required],
    });
  }

  createTask() {
    if (this.taskForm.invalid) return;

    this.isLoading = true;
    const taskData: Task = this.taskForm.value;

    this.taskService.createTask(taskData).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.router.navigate(["/board"]);
        this.taskForm.reset();
        this.taskForm.patchValue({ created_by: 1, status: "In Progress" }); // Reset but keep defaults
      },
      error: (err) => {
        this.isLoading = false;
        console.error("Error creating task", err);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
}

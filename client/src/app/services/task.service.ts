import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Task } from '../tasks/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private apiUrl = 'http://localhost:9070';

  constructor(private http: HttpClient) { }

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/tasks`);
  }

  updateTaskStatus(taskId: number, task: Task): Observable<any> {
    return this.http.put(`${this.apiUrl}/tasks/${taskId}`, task);
  }

  getTasksNearby(lat: number, lng: number, radius: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
  }
  createTask(task: Task): Observable<any> {
    return this.http.post(`${this.apiUrl}/tasks`, task);
  }
}

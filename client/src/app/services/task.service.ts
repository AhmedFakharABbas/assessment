import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private apiUrl = 'http://localhost:9070/tasks'; // update as needed

  constructor(private http: HttpClient) { }

  getTasks(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  updateTaskStatus(taskId: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${taskId}`, { status });
  }

  getTasksNearby(lat: number, lng: number, radius: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
  }
}

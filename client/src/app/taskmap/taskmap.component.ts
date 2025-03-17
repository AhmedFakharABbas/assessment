import { Component } from "@angular/core";

import mapboxgl from "mapbox-gl";
import { CommonModule } from "@angular/common";
import { TaskService } from "../services/task.service";
import { Task } from "../tasks/task.model";

@Component({
  selector: "app-taskmap",
  imports: [CommonModule],
  templateUrl: "./taskmap.component.html",
  styleUrl: "./taskmap.component.css",
})
export class TaskmapComponent {
  private map!: mapboxgl.Map;
  tasks: Task[] = [];
  constructor(private taskService: TaskService) {}

  private mapboxToken =
    "";
  ngOnInit() {
    (mapboxgl as any).accessToken = this.mapboxToken;
  }

  ngAfterViewInit(): void {
    this.taskService.getTasks().subscribe((tasks: Task[]) => {
      this.tasks = tasks;
      this.initializeMap();
    });
  }

  initializeMap(): void {
    this.map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v11",
      center: [0, 0], // Default center (can be adjusted)
      zoom: 2, // Default zoom level
    });

    this.map.addControl(new mapboxgl.NavigationControl(), "top-right");

    this.addTaskMarkers();
  }

  addTaskMarkers(): void {
    if (!this.tasks?.length) return;

    this.tasks.forEach((task) => {
      if (task.latitude && task.longitude) {
        new mapboxgl.Marker()
          .setLngLat([task.longitude, task.latitude])
          .setPopup(new mapboxgl.Popup().setText(task.name))
          .addTo(this.map);
      }
    });

    // Adjust map bounds to fit all markers
    const bounds = new mapboxgl.LngLatBounds();
    this.tasks.forEach((task) => {
      if (task.latitude && task.longitude) {
        bounds.extend([task.longitude, task.latitude]);
      }
    });

    if (this.tasks.length > 0) {
      this.map.fitBounds(bounds, { padding: 50, maxZoom: 12 });
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }
}

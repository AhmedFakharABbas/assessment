import { Component, OnInit } from "@angular/core";
import { Router, RouterOutlet } from "@angular/router";
import { ThemeService } from "./services/theme.service";
import { CommonModule } from "@angular/common";
import { BehaviorSubject } from "rxjs";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, CommonModule],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent implements OnInit {
  title = "advanced-blog-map-assessment";
  errorMessage: string = "";

  constructor(private themeService: ThemeService, private router: Router) {}

  get isDarkMode() {
    return this.themeService.darkModeSignal();
  }
  navigateTo(path: string) {
    this.router.navigate([path]);
  }
  toggleTheme() {
    this.themeService.toggleDarkMode();
  }
  ngOnInit(): void {
    this.detectOfflineMode();
  }
  detectOfflineMode(): void {
    window.addEventListener("offline", () => {
      this.errorMessage = "😞 You are offline. Check your connection.";
    });

    window.addEventListener("online", () => {
      this.errorMessage = "";
    });
  }
  logout() {
    localStorage.removeItem("token"); // Clear stored JWT
    this.router.navigate(["/login"]); // Redirect to login page
  }
}

import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private darkMode = signal<boolean>(false);

  constructor() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    this.darkMode.set(isDark);
    this.updateTheme(isDark);
  }

  get darkModeSignal() {
    return this.darkMode;
  }

  toggleDarkMode() {
    const isDark = !this.darkMode();
    this.darkMode.set(isDark);
    localStorage.setItem('darkMode', JSON.stringify(isDark));
    this.updateTheme(isDark);
  }

  private updateTheme(isDark: boolean) {
    document.documentElement.classList.toggle('dark', isDark);
  }
}

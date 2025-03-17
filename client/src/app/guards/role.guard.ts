// src/app/guards/role.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRole = route.data['expectedRole'];
    // Assuming you decode token and get user details
    const token = this.auth.getToken();
    const userRole = token ? JSON.parse(atob(token.split('.')[1])).role : null;

    if (userRole === expectedRole) {
      return true;
    }
    this.router.navigate(['/unauthorized']);
    return false;
  }
}

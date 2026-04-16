import { Injectable, inject } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class RolesGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const role = this.authService.getUserRole()?.toLowerCase();
    if (role === 'admin') {
      return true;
    }

    if (!route.data || !route.data['role']) {
      return true;
    }

    const requiredRole = route.data['role'];
    if (role && role === requiredRole) {
      return true;
    }

    this.router.navigate(['/access-denied']);
    return false;
  }
}

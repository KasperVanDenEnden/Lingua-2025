import { Injectable, inject } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class RolesGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const role = this.authService.getUserRole()?.toLowerCase();
    if (role === 'admin') {
        return true;
    }
    
    if (!route.data || !route.data['role']) {
        return true;
    }
    console.log('reached')

    const requiredRole = route.data['role'];
    if (role && role === requiredRole) {
      console.log('Toegang verleend aan', role);
      return true;
    }

    this.router.navigate(['/access-denied']);
    return false;
  }
}

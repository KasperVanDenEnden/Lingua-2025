import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { DropdownComponent } from './dropdown/dropdown.component';
import { Subscription } from 'rxjs';
import { ICurrentUser, IUser } from '@lingua/api';
import { AuthService } from '@lingua/services';
import { Router, RouterLink } from '@angular/router';
import { UiModule } from '@lingua/ui';

@Component({
  selector: 'lingua-nav',
  imports: [DropdownComponent, RouterLink, UiModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css',
})
export class NavComponent implements OnInit, OnDestroy {
  auth = inject<AuthService>(AuthService);

  isMobileMenuOpen = false;
  isLocationMenuOpen = false;

  isClassMenuOpen = false;
  isLessonMenuOpen = false;

  userSub!: Subscription;
  currentUser: ICurrentUser | undefined;
  email: string | undefined;
  role: string | undefined;

  isLogoutModalOpen = false;

  ngOnInit(): void {
    this.auth.getUserFromLocalStorage().subscribe(
      (user: IUser | null) => {
        if (user) {
          const { role, email } = user;
          this.role = role;
          this.email = email;
        }
      },
      (error) => {
        console.error(error);
      },
    );

    this.userSub = this.auth.currentUser$.subscribe({
      next: (user) => {
        if (user) {
          this.currentUser = {
            id: (user as any).id.toString(),
            email: user.email,
            role: user.role,
          };
        }
      },
    });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleLocationMenu() {
    this.isLocationMenuOpen = !this.isLocationMenuOpen;
  }

  toggleClassMenu() {
    this.isClassMenuOpen = !this.isClassMenuOpen;
  }

  toggleLessonMenu() {
    this.isLessonMenuOpen = !this.isLessonMenuOpen;
  }

  openLogoutModal() {
    this.isLogoutModalOpen = true;
  }

  closeLogoutModal() {
    this.isLogoutModalOpen = false;
  }

  logout() {
    this.auth.logout();
    this.currentUser = undefined;
  }
}

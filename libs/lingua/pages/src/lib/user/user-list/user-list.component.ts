import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { PagesModule } from '../../pages.module';
import {
  AuthService,
  NotificationService,
  UserService,
} from '@lingua/services';
import { ActivatedRoute } from '@angular/router';
import { IUser, Role } from '@lingua/api';
import { Observable, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'lingua-user-list',
  imports: [PagesModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css',
})
export class UserListComponent implements OnInit, OnDestroy {
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private notify = inject(NotificationService);
  private authService = inject(AuthService);

  users?: IUser[];
  sub!: Subscription;
  currentUserId?: string;
  currentUser?: IUser | null = null;
  friendIds: string[] = [];

  searchQuery = '';
  selectedRole = '';

  userList$?: Observable<IUser[]>;

  isModalOpen = false;
  recordToDelete?: IUser;

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });

    this.loadUsers();
    this.loadCurrentUser();

    this.userService.refresh$.subscribe(() => {
      this.loadUsers();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  loadUsers() {
    this.userList$ = this.userService.getUsers();
    this.sub = this.userService.getUsers().subscribe((results) => {
      this.users = this.currentUser?.role ==='student' ? results.filter((user) => user.role !== 'admin') : results;
    });
  }

  loadCurrentUser() {
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.currentUserId = (user as any).id;
        this.userService
          .getUserById(this.currentUserId!)
          .subscribe((fullUser) => {
            this.friendIds = (fullUser.friends as any[]).map(
              (f) => f._id?.toString() || f.toString(),
            );
          });
      }
    });
  }

  get filteredUsers(): IUser[] {
    if (!this.users) return [];

    return this.users.filter((user) => {
      const fullname = user.firstname + ' ' + user.lastname;

      const matchesSearch = this.searchQuery
        ? fullname.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(this.searchQuery.toLowerCase())
        : true;

      const matchesRole = this.selectedRole
        ? user.role === this.selectedRole
        : true;

      return matchesSearch && matchesRole;
    });
  }

  handleDelete(record: IUser): void {
    this.recordToDelete = record;
    this.isModalOpen = true;
  }

  confirmDelete(): void {
    if (this.recordToDelete) {
      this.userService.delete(this.recordToDelete._id).subscribe({
        next: () => {
          this.loadUsers();
          this.notify.success('Gelukt!');
        },
        error: (error: HttpErrorResponse) => {
          this.notify.error(error.error.message || 'Failed to delete user.');
        },
        complete: () => {
          this.recordToDelete = undefined;
          this.isModalOpen = false;
        },
      });
    }
  }

  isAdmin(): boolean {
    return 'admin' === this.authService.getUserRole();
  }

  isFriend(userId: string): boolean {
    return this.friendIds.includes(userId);
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  isChildRouteActive(): boolean {
    return this.route.children.length > 0;
  }

  addFriend(userId: string): void {
    this.userService.addFriend(userId).subscribe({
      next: () => {
        this.friendIds.push(userId.toString());
        this.notify.success('Added friend successfully!');
      },
      error: (err: HttpErrorResponse) => {
        this.notify.error(
          err.error.message || 'Something went wrong while adding friend.',
        );
      },
    });
  }

  canEdit(): boolean {
    return this.currentUser?._id === this.currentUserId;
  }

  canDelete(user: IUser): boolean {
    if (user.role === Role.Admin) return false
    return this.currentUser?._id === this.currentUserId || this.isAdmin();
  }
}

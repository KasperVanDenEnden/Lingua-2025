import { Component, OnDestroy, OnInit } from '@angular/core';
import { PagesModule } from '../../pages.module';
import { AuthService, NotificationService, UserService } from '@lingua/services';
import { ActivatedRoute } from '@angular/router';
import { IUser } from '@lingua/api';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'lingua-user-list',
  imports: [PagesModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css',
})
export class UserListComponent implements OnInit, OnDestroy {
  users?: IUser[];
  sub!: Subscription;
  currentUserId?: string;
  currentUser?: IUser | null = null;
  friendIds: string[] = [];

  searchQuery = '';
  selectedRole: string = '';

  userList$?: Observable<IUser[]>;

  isModalOpen = false;
  recordToDelete?: IUser;

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private notify: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
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
      this.users = results;
    });
  }

  loadCurrentUser() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUserId = (user as any).id;
        this.userService.getUserById(this.currentUserId!).subscribe(fullUser => {
        this.friendIds = (fullUser.friends as any[]).map(f => f._id?.toString() || f.toString());
        });
      }
    });
  }

  get filteredUsers(): IUser[] {
    if (!this.users) return [];

    return this.users.filter(user => {
      const fullname = user.firstname + ' ' + user.lastname;
      
      const matchesSearch = this.searchQuery
        ? fullname.toLowerCase().includes(this.searchQuery.toLowerCase()) 
          || user.email.toLowerCase().includes(this.searchQuery.toLowerCase())
        : true;
      
      const matchesRole =  this.selectedRole ? user.role === this.selectedRole : true;
      
      return matchesSearch && matchesRole;
    })
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
        error: (error) => {
          this.notify.error(error);
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
      this.notify.success('Vriend toegevoegd!');
    },
    error: () => {
      this.notify.error('Toevoegen mislukt.');
    }
  });
}

  canEdit(): boolean {
    return this.currentUser?._id === this.currentUserId;
  }

  canDelete(): boolean {
    return this.currentUser?._id === this.currentUserId || this.isAdmin();
  }
}

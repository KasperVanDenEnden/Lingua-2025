import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { PagesModule } from '../../pages.module';
import { IUser } from '@lingua/api';
import { Subscription, Observable, BehaviorSubject, map } from 'rxjs';
import { AuthService, NotificationService, UserService } from '@lingua/services';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'lingua-user-detail',
  imports: [PagesModule],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.css',
})
export class UserDetailComponent implements OnInit, OnDestroy {
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private notify = inject(NotificationService);
  private router = inject(Router);
  private authService = inject(AuthService);

  sub!: Subscription;
  user$ = new BehaviorSubject<IUser | null>(null);
  userId?: string | null;
  currentUser?: IUser | null = null;

  isModalOpen = false;
  recordToDelete?: IUser | null;
  isFriendsOpen = false;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);
  
  constructor() {}
  
  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.loadUser();

    this.userService.refresh$.subscribe(() => {
      this.loadUser();
    })
  }
  
  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
  
 loadUser() {
    this.sub = this.route.paramMap.subscribe((params) => {
      this.userId = params.get('id');

      if (this.userId) {
        this.userService.getUserById(this.userId).subscribe(user => {
          this.user$.next(user);
          console.log('user van backend:', user);
          console.log('friends:', user.friends);
        });
      }
    });
  }
  
  handleDelete(): void {
    this.isModalOpen = true;
  }

  confirmDelete(): void
  {
    if(this.recordToDelete) {
      this.userService.delete(this.recordToDelete._id).subscribe({
        next: () => {
          this.notify.success('User succesfully deleted');
          this.router.navigate(['/login']);
        },
        error: (error: HttpErrorResponse) => {
          this.notify.error(error.error.message || 'Failed to delete user.');
        }
      })
    }
  }

  closeModal(): void {
    console.log('close modal');
    this.isModalOpen = false;
  }
  
  isChildRouteActive(): boolean {
    return this.route.children.length > 0;
  }

  get friends$(): Observable<IUser[]> {
    return this.user$.pipe(
      map(user => {
        if (!user?.friends) return [];
        if ((user.friends as IUser[])[0]?.firstname !== undefined) {
          return user.friends as IUser[];
        }
        return []; 
      })
    );
  }

  removeFriend(friendId: string): void {
    this.userService.removeFriend(friendId).subscribe({
      next: () => {
        this.userService.getUserById(this.userId!).subscribe(user => {
          this.user$.next(user); // update bestaande subject
        });
        this.notify.success('Vriend succesvol verwijderd');
      },
      error: (err: HttpErrorResponse) => {
        this.notify.error(err.error.message || 'Er is een fout opgetreden bij het verwijderen van de vriend.');
      }
    });
  }

  canEdit(): boolean {
    return this.currentUser?._id === this.userId;
  }

  canDelete(): boolean {
    return this.currentUser?._id === this.userId || this.currentUser?.role === 'admin';
  }
}

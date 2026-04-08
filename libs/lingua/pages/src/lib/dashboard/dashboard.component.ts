import { Component, inject, OnInit } from '@angular/core';
import { PagesModule } from '../pages.module';
import { AuthService, CourseService } from '@lingua/services';
import { ICourse } from '@lingua/api';
import { switchMap, filter } from 'rxjs/operators';
import { ICurrentUser, Id, IUser } from '@lingua/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'lingua-dashboard',
  imports: [PagesModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private courseService = inject(CourseService);
  private authService = inject(AuthService);

  userId?: Id | undefined;
  rcmndCourses: any[] = [];

  userSub!: Subscription;
  currentUser: ICurrentUser | undefined;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  ngOnInit(): void {
    this.userSub = this.authService.currentUser$.subscribe({
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

    this.courseService
      .getRecomendations(this.currentUser?.id.toString() || '')
      .subscribe({
        next: (courses) => {
          this.rcmndCourses = courses;
        },
      });
  }
}

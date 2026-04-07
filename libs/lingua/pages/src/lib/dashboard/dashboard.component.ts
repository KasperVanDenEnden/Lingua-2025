import { Component } from '@angular/core';
import { PagesModule } from '../pages.module';
import { AuthService, CourseService } from '@lingua/services';
import { ICourse } from 'libs/shared/api/src/lib/models/course.interface';
import { switchMap, filter } from 'rxjs/operators';
import { ICurrentUser, Id, IUser } from '@lingua/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'lingua-dashboard',
  imports: [PagesModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  userId?: Id | undefined;
  rcmndCourses: any[] = [];

  userSub!: Subscription;
  currentUser: ICurrentUser | undefined;

  constructor(
    private courseService: CourseService,
    private authService: AuthService
  ) {}

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

    this.courseService.getRecomendations(this.currentUser?.id.toString() || '').subscribe({
      next: (courses) => {
        this.rcmndCourses = courses;
      }
    });
  }
}

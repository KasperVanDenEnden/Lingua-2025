import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CourseStatus, ICourse, ICurrentUser, IUser, Language } from '@lingua/api';
import {
  AuthService,
  CourseService,
  NotificationService,
  UserService,
} from '@lingua/services';
import { ActivatedRoute } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { PagesModule } from '../../pages.module';
import { Types } from 'mongoose';
import { HttpErrorResponse } from 'node_modules/@angular/common/types/_module-chunk';

@Component({
  selector: 'lingua-course-list',
  imports: [PagesModule],
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.css',
})
export class CourseListComponent implements OnInit, OnDestroy {
  private courseService = inject(CourseService);
  private route = inject(ActivatedRoute);
  private notify = inject(NotificationService);
  private authService = inject(AuthService);

  courses?: ICourse[] | null;
  sub!: Subscription;
  currentUserId?: string;
  currentUser?: ICurrentUser | null = null;

  statuses = Object.values(CourseStatus);
  languages = Object.values(Language);

  searchQuery = '';
  selectedStatus = '';
  selectedLanguage = '';
  onlyMyCourses = false;

  courseList$?: Observable<ICourse[]>;

  isModalOpen = false;
  recordToDelete?: ICourse | null;

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(
    (user) => {
      if (user) {
        this.currentUser = {
          id: (user as any).id.toString(),
          email: user?.email,
          role: user.role
        };
      }
    }
  );

    this.loadCourses();

    this.courseService.refresh$.subscribe(() => {
      this.loadCourses();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  loadCourses() {
    this.courseList$ = this.courseService.getCourses();
    this.sub = this.courseService.getCourses().subscribe((results) => {
      this.courses = results;
    });
  }

  get filteredCourses(): ICourse[] {
    if (!this.courses) return [];
    return this.courses.filter((course) => {
      const matchesQuery = course.title
        .toLowerCase()
        .includes(this.searchQuery.toLowerCase());

      const matchesStatus = this.selectedStatus
        ? course.status === this.selectedStatus
        : true;
      const matchesLanguage = this.selectedLanguage
        ? course.language === this.selectedLanguage
        : true;

      const myCourse = this.onlyMyCourses
        ? course.students.some(s => s === this.currentUser?.id?.toString()) ||
          course.teachers.some(t => t === this.currentUser?.id?.toString())
        : true;

      return matchesQuery && matchesStatus && matchesLanguage && myCourse;
    });
  }

  handleDelete(record: ICourse): void {
    this.recordToDelete = record;
    this.isModalOpen = true;
  }

  confirmDelete(): void {
    if (this.recordToDelete) {
      this.courseService.delete(this.recordToDelete._id).subscribe({
        next: () => {
          this.loadCourses();
          this.notify.success('Course deleted successfully!');
        },
        error: (error: HttpErrorResponse) => {
          this.notify.error(
            error.error?.message || 'Failed to delete course: ' + error.message,
          );
        },
        complete: () => {
          this.recordToDelete = null;
          this.isModalOpen = false;
        },
      });
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  isChildRouteActive(): boolean {
    return this.route.children.length > 0;
  }

  canCreate(): boolean {
    const role = this.authService.getUserRole();
    return role === 'admin' || role === 'teacher';
  }

  canEdit(course: ICourse): boolean {
    if (this.currentUser?.role === 'admin') return true;
    if (!this.currentUser?.id) return false;

    return course.teachers.some(teacher => teacher === this.currentUser!.id.toString());
  }

  canDelete(): boolean {
    return this.currentUser?.role === 'admin';
  }
}

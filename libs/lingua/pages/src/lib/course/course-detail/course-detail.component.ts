import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ICourse, Id, IUser } from '@lingua/api';
import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import { PagesModule } from '../../pages.module';
import {
  CourseService,
  UserService,
  NotificationService,
  AuthService,
} from '@lingua/services';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CreateReviewDto } from '@lingua/dto';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'lingua-course-detail',
  imports: [PagesModule],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.css',
})
export class CourseDetailComponent implements OnInit, OnDestroy {
  course$!: Observable<ICourse | null>;
  students$ = new BehaviorSubject<IUser[]>([]);
  
  private sub!: Subscription;
  courseId?: string | null;

  // teachers / students / available teachers
  teachers: IUser[] = [];
  availableTeachers: IUser[] = [];
  selectedTeacher?: IUser | null;
  
  isModalOpen = false;
  recordToDelete?: ICourse | null;

  reviewForm: FormGroup = new FormGroup({
    rating: new FormControl(null, [Validators.required, Validators.min(0), Validators.max(5)]),
    comment: new FormControl(null, Validators.required)
  });

  currentUser?: any | null = null;

  constructor(
    private courseService: CourseService,
    private route: ActivatedRoute,
    private userService: UserService,
    private notify: NotificationService,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => this.currentUser = user);  
    
    this.loadCourse();
    // subscribe to service refresh events
    this.courseService.refresh$.subscribe(() => {
      if (this.courseId) this.loadCourse();
    });
}

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  // -----------------------------
  // Load course and initialize arrays
  // -----------------------------
  loadCourse(): void {
    this.sub = this.route.paramMap.subscribe(params => {
      this.courseId = params.get('id');
      if (!this.courseId) return;
      
      this.courseService.getCourseById(this.courseId).subscribe(course => {
        this.course$ = new BehaviorSubject<ICourse | null>(course).asObservable();
        this.teachers = course.teachers as IUser[] || [];
        this.students$.next(course.students as IUser[] || []);
        this.recordToDelete = course;


        this.userService.getUsers().subscribe(users => {
          const allTeachers = users.filter(u => u.role === 'teacher');
          const assignedIds = new Set(this.teachers.map(t => t._id));
          this.availableTeachers = allTeachers.filter(t => !assignedIds.has(t._id));
        });
      });
    });
  }

  // -----------------------------
  // Delete course
  // -----------------------------
  handleDelete(): void {
    this.isModalOpen = true;
  }

  confirmDelete(): void {
    if (!this.recordToDelete) return;

    this.courseService.delete(this.recordToDelete._id).subscribe({
      next: () => {
        this.notify.success('Course deleted successfully!');
        this.router.navigate(['/courses']);
      },
      error: (error: HttpErrorResponse) => {
        this.notify.error(error.error?.message || 'Failed to delete course: ' + error.message);
      },
    });
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  // -----------------------------
  // Check for child route
  // -----------------------------
  isChildRouteActive(): boolean {
    return this.route.children.length > 0;
  }

  // -----------------------------
  // Assign or remove teacher
  // -----------------------------
  assignTeacher(teacher: IUser): void {
    if (!teacher || !this.courseId) return;

    this.courseService.assignTeacher(this.courseId, teacher._id).subscribe({
      next: () => {
        const assignedIds = new Set(this.teachers.map(t => t._id));
        this.availableTeachers = this.availableTeachers?.filter(t => !assignedIds.has(t._id)) || [];
        this.courseService.triggerRefresh();
        this.notify.success(`${teacher.firstname} is assigned to the course.`);
      },
      error: (err: HttpErrorResponse) => this.notify.error(err.error?.message || 'Failed to assign teacher: ' + err.message)
    });
  }

  removeTeacher(teacher: IUser): void {
    if (!teacher || !this.courseId) return;

    this.courseService.removeTeacher(this.courseId, teacher._id).subscribe({
      next: () => {
        const assignedIds = new Set(this.teachers.map(t => t._id));
        this.availableTeachers = this.availableTeachers?.filter(t => !assignedIds.has(t._id)) || [];
        if (!this.availableTeachers.find(t => t._id === teacher._id)) {
          this.availableTeachers.push(teacher);
        }
        this.courseService.triggerRefresh();
        this.notify.success(`${teacher.firstname} is removed from the course.`);
      },
      error: (err: HttpErrorResponse) => this.notify.error(err.error?.message || 'Failed to remove teacher: ' + err.message)
    });
  }

  // -----------------------------
  // Student enroll / unenroll
  // -----------------------------
  enroll(): void {
    if (!this.courseId || !this.currentUser) return;

    this.courseService.enroll(this.courseId).subscribe({
      next: () => {
        this.notify.success('Enrolled successfully!');
        const currentStudents = this.students$.value;
        if (!currentStudents.some(s => s._id.toString() === this.currentUser.id.toString())) {
          this.userService.getUserById(this.currentUser.id).subscribe(user => {
            this.students$.next([...currentStudents, user]);
          });
        }
      },
      error: (err: HttpErrorResponse) => this.notify.error(err.error?.message || 'Failed to enroll: ' + err.message)
    });
  }

  unenroll(): void {
    if (!this.courseId || !this.currentUser) return;

    this.courseService.unenroll(this.courseId).subscribe({
      next: () => {
        this.notify.success('Unenrolled successfully!');
        this.students$.next(
          this.students$.value.filter(s => s._id.toString() !== this.currentUser.id.toString())
        );
      },
      error: (err: HttpErrorResponse) => this.notify.error(err.error?.message || 'Failed to unenroll: ' + err.message)
    });
  }

  // -----------------------------
  // Post review
  // -----------------------------
  submitReview(): void {
    const review: CreateReviewDto = {
      rating: parseInt(this.reviewForm.value.rating, 10),
      comment: this.reviewForm.value.comment
    }

    this.courseService.postReview(this.courseId!,review).subscribe({
      next: () => {
        this.notify.success('Review submitted successfully!');  
        this.courseService.triggerRefresh();

        this.reviewForm.reset();
      },
      error: (err: HttpErrorResponse) => this.notify.error(err.error?.message || 'Failed to submit review: ' + err.message)
    });
  }

  // -----------------------------
  // Helper functions
  // -----------------------------
  getStars(rating: number): string {
    const full = Math.round(rating ?? 0);
    const empty = 5 - full;
    return '★'.repeat(full) + '☆'.repeat(empty);
  }

  isUser(obj: Id | IUser): obj is IUser {
    return typeof obj !== 'string';
  }
  
  isStudentEnrolled(): boolean {
    const students = this.students$.value;
    return !!this.currentUser && students.some(s => s._id.toString() === this.currentUser.id.toString());
  }

  canEdit():boolean {
    return this.currentUser?.role !== 'student';
  }
}
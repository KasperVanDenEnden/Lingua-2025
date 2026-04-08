import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ICourse, ILesson, IUser } from '@lingua/api';
import { Subscription, Observable } from 'rxjs';
import { AuthService, LessonService, NotificationService } from '@lingua/services';
import { PagesModule } from '../../pages.module';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'lingua-lesson-detail',
  imports: [PagesModule],
  templateUrl: './lesson-detail.component.html',
  styleUrl: './lesson-detail.component.css',
})
export class LessonDetailComponent implements OnInit, OnDestroy {

  lesson$!: Observable<ILesson>;
  lessonId?: string | null;

  course?: ICourse | null;
  teacher?: IUser | null;
  students: IUser[] = [];

  isModalOpen = false;
  recordToDelete?: ILesson | null;

  userSubscription!: Subscription;
  currentUser: IUser | undefined = undefined;

  private routeSub!: Subscription;
  private lessonSub!: Subscription;
  private refreshSub!: Subscription;

  constructor(
    private lessonService: LessonService,
    private route: ActivatedRoute,
    private router: Router,
    private notify: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadLesson();

    this.refreshSub = this.lessonService.refresh$.subscribe(() => {
      this.loadLesson();
    });

    this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
      });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.lessonSub?.unsubscribe();
    this.refreshSub?.unsubscribe();
  }

  loadLesson(): void {
    // cleanup oude subscriptions
    this.routeSub?.unsubscribe();
    this.lessonSub?.unsubscribe();

    this.routeSub = this.route.paramMap.subscribe(params => {
      this.lessonId = params.get('id');
      if (!this.lessonId) return;

      this.lesson$ = this.lessonService.getLessonById(this.lessonId);

      this.lessonSub = this.lesson$.subscribe(lesson => {
        this.course = lesson.course as ICourse;
        this.teacher = lesson.teacher as IUser;
        this.recordToDelete = lesson;

        // veilige cast
        this.students = Array.isArray(lesson.students)
          ? lesson.students as IUser[]
          : [];
      });
    });
  }

  getTeacher(): string {
    if (!this.teacher) return '—';
    return `${this.teacher.firstname} ${this.teacher.lastname} (${this.teacher.email})`;
  }

  getClass(): string {
    if (!this.course) return '—';
    return `${this.course.title}: ${this.course.description}`;
  }

  handleDelete(): void {
    this.isModalOpen = true;
  }

  confirmDelete(): void {
    if (!this.recordToDelete) return;

    this.lessonService.delete(this.recordToDelete._id).subscribe({
      next: () => {
        this.notify.success('Les succesvol verwijderd');
        this.router.navigate(['/lessons']);
      },
      error: (error) => {
        console.error('Error deleting lesson:', error);
      },
    });
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  isChildRouteActive(): boolean {
    return this.route.children.length > 0;
  }

  attend(): void {
    this.lessonService.attend(this.lessonId!).subscribe({
      next: () => {
        this.notify.success('Je bent succesvol ingeschreven voor deze les!');
        this.loadLesson();
      },
     error: (error: HttpErrorResponse) => {
        this.notify.error(error.error?.message || 
          'Something went wrong while attending the lesson'
        );
      }
    });
  }

  unattend(): void {
      this.lessonService.unattend(this.lessonId!).subscribe({
        next: () => {
          this.notify.success('Je bent succesvol uitgeschreven voor deze les!');
          this.loadLesson();
        },
        error: (error: HttpErrorResponse) => {
          this.notify.error(
            error.error?.message || 'Something went wrong while unattending the lesson'
          );
        }
      });
  }

  isAttending(): boolean {  
    if (!this.currentUser) return false;
    return this.students.some(student => student._id === this.currentUser?._id);
  }
}
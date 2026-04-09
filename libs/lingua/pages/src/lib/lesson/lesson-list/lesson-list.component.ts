import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ICourse, ILesson, IUser, LessonStatus } from '@lingua/api';
import {
  AuthService,
  LessonService,
  NotificationService,
} from '@lingua/services';
import { ActivatedRoute } from '@angular/router';
import { PagesModule } from '../../pages.module';
import { HttpErrorResponse } from 'node_modules/@angular/common/types/_module-chunk';

@Component({
  selector: 'lingua-lesson-list',
  imports: [PagesModule],
  templateUrl: './lesson-list.component.html',
  styleUrl: './lesson-list.component.css',
})
export class LessonListComponent implements OnInit, OnDestroy {
  private lessonService = inject(LessonService);
  private route = inject(ActivatedRoute);
  private notify = inject(NotificationService);
  private authService = inject(AuthService);

  lessons!: ILesson[] | null;
  sub!: Subscription;
  statuses = Object.values(LessonStatus);

  lessonList$?: Observable<ILesson[]>;

  searchQuery = '';
  selectedStatus = '';

  isModalOpen = false;
  recordToDelete?: ILesson | null;

  ngOnInit(): void {
    this.loadLessons();

    this.lessonService.refresh$.subscribe(() => {
      this.loadLessons();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  loadLessons() {
    this.lessonList$ = this.lessonService.getLessons();
    this.sub = this.lessonService.getLessons().subscribe((results) => {
      this.lessons = results;
    });
  }

  get filteredLessons(): ILesson[] {
    if (!this.lessons) return [];
    return this.lessons.filter((lesson) => {
      const matchesQuery = lesson.title
        .toLowerCase()
        .includes(this.searchQuery.toLowerCase());

      const matchesStatus = this.selectedStatus
        ? lesson.status === this.selectedStatus
        : true;

      return matchesQuery && matchesStatus;
    });
  }

  getClass(lesson: ILesson) {
    return (lesson.course as ICourse)?.title || '';
  }

  getTeacher(lesson: ILesson): string {
    const teacher = lesson.teacher as IUser;
    if (!teacher) return '';
    return `${teacher.firstname || ''} ${teacher.lastname || ''}`.trim();
  }

  getStatusStyle(status: LessonStatus | undefined): string {
    switch (status) {
      case 'Concept':
        return 'text-gray-500 border-gray-300';
      case 'Open':
        return 'text-green-500 border-green-500';
      case 'Full':
        return 'text-amber-600 border-amber-500';
      case 'Canceled':
        return 'text-primary-dark border-primary-dark';
      default:
        return 'text-gray-500 border-gray-500';
    }
  }

  handleDelete(record: ILesson): void {
    console.log(record, 'record');
    this.recordToDelete = record;
    this.isModalOpen = true;
  }

  confirmDelete(): void {
    console.log('confirmed deletion');
    if (this.recordToDelete) {
      console.log('recordToDeleteIsSet', this.recordToDelete._id);
      this.lessonService.delete(this.recordToDelete._id).subscribe({
        next: () => {
          // Reload the list after successful deletion
          this.loadLessons();
          // Show success message (optional)
          this.notify.success('Deleted successfully!');
        },
        error: (error: HttpErrorResponse) => {
          this.notify.error(
            error.error?.message || 'Failed to delete lesson: ' + error.message,
          );
        },
        complete: () => {
          // Reset the recordToDelete and close modal
          this.recordToDelete = null;
          this.isModalOpen = false;
        },
      });
    }
  }

  closeModal(): void {
    console.log('close modal');
    this.isModalOpen = false;
  }

  isChildRouteActive(): boolean {
    return this.route.children.length > 0;
  }

  canCreate(): boolean {
    const role = this.authService.getUserRole();
    return role === 'admin' || role === 'teacher';
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ICourse, IUser } from '@lingua/api';
import { Subscription, Observable } from 'rxjs';
import { PagesModule } from '../../pages.module';
import {
  CourseService,
  CourseAssistantService,
  UserService,
  NotificationService,
} from '@lingua/services';

@Component({
  selector: 'lingua-course-detail',
  imports: [PagesModule],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.css',
})
export class CourseDetailComponent implements OnInit, OnDestroy {
  sub!: Subscription;
  course$!: Observable<ICourse>;
  courseId?: string | null;

  teachers?: IUser[] | null;
  students?: IUser[] | null;
  availableTeachers?: IUser[] | null;
  selectedTeacher?: IUser | null;

  isModalOpen = false;
  recordToDelete?: ICourse | null;

  constructor(
    private courseService: CourseService,
    private courseAssistantService: CourseAssistantService,
    private route: ActivatedRoute,
    private userService: UserService,
    private notify: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCourse();

    this.courseService.refresh$.subscribe(() => {
      this.loadCourse();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  loadCourse() {
    this.sub = this.route.paramMap.subscribe((params) => {
      this.courseId = params.get('id');

      if (this.courseId) {
        this.course$ = this.courseService.getCourseById(this.courseId);
        this.course$.subscribe((course) => {
          this.teachers = course.teachers as IUser[];
          this.recordToDelete = course;

          this.userService.getUsers().subscribe((users) => {
            const allTeachers = users.filter((user) => user.role === 'teacher');

            this.availableTeachers = allTeachers.filter((teacher) => {
              // const isNotCurrentTeacher = teacher._id !== this.teacher?._id;
              // const isNotAssistant = !this.assistants?.some(
              //   (assistant) => assistant?._id === teacher?._id
              // );
              // return isNotCurrentTeacher && isNotAssistant;
            });
          });
        });
      }
    });
  }

  handleDelete(): void {
    this.isModalOpen = true;
  }

  confirmDelete(): void {
    if (this.recordToDelete) {
      this.courseService.delete(this.recordToDelete._id).subscribe({
        next: () => {
          this.notify.success('Gelukt!');
          this.router.navigate(['/courses']);
        },
        error: (error) => {
          this.notify.error(error);
        },
      });
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  isChildRouteActive(): boolean {
    return this.route.children.length > 0; // Checkt of er een child actief is
  }

  assignAssistant(teacher: IUser) {
    if (!teacher) {
      console.log('No teacher selected.');
      return;
    }

    if (this.courseId) {
      this.courseAssistantService
        .addAssistant(teacher._id, this.courseId)
        .subscribe({
          next: () => {
            this.notify.success('Assistant successfully assigned.');
            this.courseService.triggerRefresh();
          },
          error: () => {
            this.notify.error('Failed to assign assistant.');
          },
        });
    }
  }

  removeAssistant(teacher: IUser) {
    if (!teacher) {
      this.notify.warning('No teacher selected.');
      return;
    }

    if (this.courseId) {
      this.courseAssistantService
        .removeAssistant(teacher._id, this.courseId)
        .subscribe({
          next: () => {
            this.notify.success('Assistant successfully removed.');
            this.courseService.triggerRefresh();
          },
          error: () => {
            this.notify.error('Failed to remove assistant.');
          },
        });
    }
  }
}

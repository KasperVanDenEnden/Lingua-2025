import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { formatDate } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin, Subscription, take } from 'rxjs';
import { ICourse, ICreateLesson, ICurrentUser, Id, ILesson, IUser } from '@lingua/api';
import { Router, ActivatedRoute } from '@angular/router';
import {
  LessonService,
  UserService,
  CourseService,
  NotificationService,
  AuthService,
} from '@lingua/services';
import { PagesModule } from '../../pages.module';
import { HttpErrorResponse } from 'node_modules/@angular/common/types/_module-chunk';

@Component({
  selector: 'lingua-lesson-form',
  imports: [PagesModule],
  templateUrl: './lesson-form.component.html',
  styleUrl: './lesson-form.component.css',
})
export class LessonFormComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private lessonService = inject(LessonService);
  private userService = inject(UserService);
  private courseService = inject(CourseService);
  private notify = inject(NotificationService);
  private authService = inject(AuthService);


  formSub?: Subscription;
  isEditMode?: boolean;
  existId!: Id;
  
  courses?: ICourse[] | null;
  teachers?: IUser[] | null;
  filteredTeachers: IUser[] = [];
  currentUser?: ICurrentUser | null = null;

  lessonForm: FormGroup = new FormGroup({
    teacher: new FormControl(null, Validators.required),
    course: new FormControl(null, Validators.required),
    status: new FormControl(null, Validators.required),
    type: new FormControl(null, Validators.required),
    title: new FormControl(null, [
      Validators.required,
      Validators.minLength(3),
    ]),
    isWorkshop: new FormControl(false),
    day: new FormControl(null, Validators.required),
    startTime: new FormControl(null, [
      Validators.required,
      Validators.pattern('^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'),
    ]),
    endTime: new FormControl(null, [
      Validators.required,
      Validators.pattern('^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'),
    ]),
  });

  ngOnInit(): void {
    forkJoin({
        teachers: this.userService.getUsers(),
        courses: this.courseService.getCourses(),
        currentUser: this.authService.currentUser$.pipe(take(1)),
    }).subscribe({
        next: (results) => {
            this.currentUser = {
                id: (results.currentUser as any).id.toString(),
                email: results.currentUser!.email,
                role: results.currentUser!.role,
            };

            this.teachers = results.teachers.filter(
                (user) => user.role === 'teacher',
            );
            this.courses = results.courses.filter(
                (course) =>
                    course.status !== 'Archived' &&
                    (course.teachers as Id[]).some(
                        (t) => t.toString() === this.currentUser?.id
                    )
            );

            this.route.parent?.paramMap.subscribe((params) => {
                const id = params.get('id');
                if (id) {
                    this.isEditMode = true;
                    this.existId = id;
                    this.loadLessonData(id);
                } else {
                    this.lessonForm.reset();
                    this.isEditMode = false;
                }
            });

            this.lessonForm.get('course')?.valueChanges.subscribe(() => {
                this.updateTeacherOptions();
            });
        },
        error: (err: HttpErrorResponse) => {
            this.notify.error(
                err.error?.message || 'Failed to load initial data: ' + err.message,
            );
        },
    });
}

  ngOnDestroy(): void {
    this.formSub?.unsubscribe();
  }

  loadLessonData(id: string) {
    this.formSub = this.lessonService.getLessonById(id).subscribe({
      next: (lesson: ILesson) => {
        // Update de form-waarden
        this.lessonForm.patchValue({
          teacher: (lesson.teacher as IUser)._id,
          course: (lesson.course as ICourse)._id,
          status: lesson.status,
          type: lesson.type,
          title: lesson.title,
          isWorkshop: lesson.isWorkshop,
          day: formatDate(lesson.day, 'yyyy-MM-dd', 'en'),
          startTime: formatDate(lesson.startTime, 'HH:mm', 'en'),
          endTime: formatDate(lesson.endTime, 'HH:mm', 'en'),
        });

        // Update de leraar-opties nadat de formulierwaarden zijn gepatcht
        this.updateTeacherOptions();

        // Selecteer de juiste leraar in de dropdown
        this.lessonForm.get('teacher')?.setValue((lesson.teacher as IUser)._id);
      },
      error: (err: HttpErrorResponse) => {
        this.notify.error(
          err.error?.message || 'Failed to load lesson data: ' + err.message,
        );
      },
    });
  }

  updateTeacherOptions() {
    const selectedCourseId = this.lessonForm.get('course')?.value;
    if (!selectedCourseId || !this.courses || !this.teachers) {
      this.filteredTeachers = [];
      return;
    }

    const selectedCourse = this.courses.find(
      (courses) => courses._id === selectedCourseId,
    );
    if (selectedCourse) {

      const assignedTeacherIds = [
        selectedCourse.teachers, // Hoofdleraar ID (direct toegevoegd)
      ].filter((id) => id);

      // 3. Filter leraren zodat ALLEEN de reeds toegewezen leraren in de dropdown blijven
      this.filteredTeachers = this.teachers.filter((teacher) =>
        (selectedCourse.teachers as Id[]).includes(teacher._id),
      );
    } else {
      this.filteredTeachers = [];
    }

    const currentTeacher = this.lessonForm.get('teacher')?.value;
    if (
      currentTeacher !== null &&
      !this.filteredTeachers.includes(currentTeacher)
    ) {
      this.lessonForm.get('teacher')?.setValue(null);
    }
  }

  onSubmit(): void {
    const data: ICreateLesson = {
      teacher: this.lessonForm.value.teacher,
      course: this.lessonForm.value.course,
      status: this.lessonForm.value.status,
      title: this.lessonForm.value.title,
      type: this.lessonForm.value.type,
      day: this.lessonForm.value.day,
      startTime: this.convertTimeStringToDate(this.lessonForm.value.startTime),
      endTime: this.convertTimeStringToDate(this.lessonForm.value.endTime),
      isWorkshop: this.lessonForm.value.isWorkshop || false,
    };

    if (this.isEditMode) {
      this.lessonService
        .update(data, this.existId)
        .subscribe((updatedLesson) => {
          this.lessonService.triggerRefresh();
          this.router.navigate(['lessons', updatedLesson._id]);
        });
    } else {
      this.lessonService.create(data).subscribe(() => {
        this.lessonService.triggerRefresh();
        this.router.navigate(['/lessons']);
      });
    }
  }

  closeForm() {
    const currentUrl = this.router.url.split('/');
    currentUrl.pop();
    this.router.navigate([currentUrl.join('/')]);
  }

  convertTimeStringToDate(timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }
}

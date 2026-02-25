import { Component, OnDestroy, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin, Subscription } from 'rxjs';
import {
  ICourse,
  ICreateLesson,
  Id,
  ILesson,
  IUser,
} from '@lingua/api';
import { Router, ActivatedRoute } from '@angular/router';
import { Types } from 'mongoose';
import {
  LessonService,
  UserService,
  CourseService,
} from '@lingua/services';
import { PagesModule } from '../../pages.module';

@Component({
  selector: 'lingua-lesson-form',
  imports: [PagesModule],
  templateUrl: './lesson-form.component.html',
  styleUrl: './lesson-form.component.css',
})
export class LessonFormComponent implements OnInit, OnDestroy {
  formSub?: Subscription;
  isEditMode?: boolean;
  existId!: Id;

  courses?: ICourse[] | null;
  teachers?: IUser[] | null;
  filteredTeachers: IUser[] = [];

  lessonForm: FormGroup = new FormGroup({
    teacher: new FormControl(null, Validators.required),
    course: new FormControl(null, Validators.required),
    room: new FormControl(null, Validators.required),
    status: new FormControl(null, Validators.required),
    title: new FormControl(null, Validators.required),
    description: new FormControl(null, Validators.required),
    day: new FormControl(null, Validators.required),
    startTime: new FormControl(null, Validators.required),
    endTime: new FormControl(null, Validators.required),
  });

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private lessonService: LessonService,
    private userService: UserService,
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    // Laad de docenten, kamers en klassen tegelijk
    forkJoin({
      teachers: this.userService.getUsers(),
      courses: this.courseService.getCourses(),
    }).subscribe({
      next: (results) => {
        this.teachers = results.teachers.filter(
          (user) => user.role === 'teacher'
        );
        this.courses = results.courses.filter(
          (course) => course.status !== 'Archived'
        );

        // Nadat de gegevens geladen zijn, laad je de lesgegevens (indien bewerken)
        this.route.parent?.paramMap.subscribe((params) => {
          const id = params.get('id');
          if (id) {
            this.isEditMode = true;
            this.existId = new Types.ObjectId(id);
            this.loadLessonData(id); // Laad les na het ophalen van docenten
          } else {
            this.lessonForm.reset();
            this.isEditMode = false;
          }
        });

        this.lessonForm.get('course')?.valueChanges.subscribe(() => {
          this.updateTeacherOptions();
        });
      },
      error: (err) => {
        console.error('Fout bij het ophalen van gegevens:', err);
      },
    });
  }

  ngOnDestroy(): void {
    this.formSub?.unsubscribe();
  }

  loadLessonData(id: string) {
    this.formSub = this.lessonService.getLessonById(id).subscribe({
      next: (lesson: ILesson) => {
        console.log(lesson);
        // Update de form-waarden
        this.lessonForm.patchValue({
          teacher: lesson.teacher._id,
          course: lesson.course._id,
          status: lesson.status,
          title: lesson.title,
          type: lesson.type,
          day: formatDate(lesson.day, 'yyyy-MM-dd', 'en'),
          startTime: formatDate(lesson.startTime, 'HH:mm', 'en'),
          endTime: formatDate(lesson.endTime, 'HH:mm', 'en'),
        });

        // Update de leraar-opties nadat de formulierwaarden zijn gepatcht
        this.updateTeacherOptions();

        // Selecteer de juiste leraar in de dropdown
        this.lessonForm.get('teacher')?.setValue(lesson.teacher._id);
      },
      error: (err) => {
        console.error('Fout bij ophalen lesgegevens:', err);
      },
    });
  }

  updateTeacherOptions() {
    console.log('updating teachers dropdown');
    const selectedCourseId = this.lessonForm.get('course')?.value;
    if (!selectedCourseId || !this.courses || !this.teachers) {
      this.filteredTeachers = [];
      return;
    }

    const selectedCourse = this.courses.find(
      (courses) => courses._id === selectedCourseId
    );
    if (selectedCourse) {
      // console.log('Filtering gestart');

      // const assignedTeacherIds = [
      //   selectedCourse.teacher, // Hoofdleraar ID (direct toegevoegd)
      //   ...(Array.isArray(selectedCourse.assistants)
      //     ? selectedCourse.assistants
      //     : []), // Assistants IDs (al als IDs)
      // ].filter((id) => id);

      // console.log('Toegewezen leraren:', assignedTeacherIds);

      // // 3. Filter leraren zodat ALLEEN de reeds toegewezen leraren in de dropdown blijven
      // this.filteredTeachers = this.teachers.filter((teacher) =>
      //   assignedTeacherIds.includes(teacher._id)
      // );
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

import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ICourse, ICreateCourse, Id, IUser, Language, Level } from '@lingua/api';
import {
  FormGroup,
  FormControl,
  Validators,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CourseService, NotificationService } from '@lingua/services';
import { PagesModule } from '../../pages.module';
import { HttpErrorResponse } from 'node_modules/@angular/common/types/_module-chunk';

@Component({
  selector: 'lingua-course-form',
  imports: [PagesModule],
  templateUrl: './course-form.component.html',
  styleUrl: './course-form.component.css',
})
export class CourseFormComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private courseService = inject(CourseService);
  private notify = inject(NotificationService);

  formSub?: Subscription;
  isEditMode?: boolean;
  existId!: Id;
  languages = Object.values(Language);
  levels = Object.values(Level);

  courseForm: FormGroup = new FormGroup({
    title: new FormControl(null, Validators.required),
    description: new FormControl(null, Validators.required),
    price: new FormControl(null, [Validators.required, Validators.min(0)]),
    maxStudents: new FormControl(null, [
      Validators.required,
      Validators.min(1),
      Validators.max(20)
    ]),
    language: new FormControl(null, Validators.required),
    level: new FormControl('', Validators.required),
    status: new FormControl('', Validators.required),
    starts: new FormControl(null, Validators.required),
    ends: new FormControl(null, ),
  }, { validators: this.dateRangeValidator() });

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadCourseData(id);
        this.isEditMode = true;
        this.existId = id;
      } else {
        this.initializeNewCourse();

        this.isEditMode = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.formSub?.unsubscribe();
  }

  initializeNewCourse() {
    this.courseForm.reset();
    this.courseForm.patchValue({ status: 'Active' });
  }

  loadCourseData(id: string) {
    this.formSub = this.courseService.getCourseById(id).subscribe({
      next: (courseData: ICourse) => {
        this.courseForm.patchValue({
          status: courseData.status,
          title: courseData.title,
          description: courseData.description,
          price: courseData.price,
          maxStudents: courseData.maxStudents,
          language: courseData.language,
          level: courseData.level,
          starts: this.formatDate(courseData.starts),
          ends: this.formatDate(courseData.ends?.toString()),
        });
      },
      error: (err: HttpErrorResponse) => {
        this.notify.error(
          err.error?.message || 'Failed to load course data: ' + err.message,
        );
      },
    });
  }

  onSubmit(): void {
    const data: ICreateCourse = {
      status: this.courseForm.value.status,
      title: this.courseForm.value.title,
      description: this.courseForm.value.description,
      language: this.courseForm.value.language,
      level: this.courseForm.value.level,
      price: this.courseForm.value.price,
      maxStudents: this.courseForm.value.maxStudents,
      starts: this.courseForm.value.starts,
      ends: this.courseForm.value.ends || null,
    };

    if (this.isEditMode) {
      this.courseService
        .update(data, this.existId)
        .subscribe((updatedCourse) => {
          this.courseService.triggerRefresh();
          this.notify.success('Course updated successfully');
        });
    } else {
      this.courseService.create(data).subscribe((result) => {
        this.courseService.triggerRefresh();
        this.notify.success('Course created successfully');
      });
    }
  }

  closeForm() {
    const currentUrl = this.router.url.split('/');
    currentUrl.pop();
    this.router.navigate([currentUrl.join('/')]);
  }

  notInPastValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) return null;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const selected = new Date(control.value);

      if (selected < today) {
        return { pastDate: true };
      }

      return null;
    };
  }

  dateRangeValidator(): ValidatorFn {
    return (group: AbstractControl) => {
      const start = group.get('starts')?.value;
      const end = group.get('ends')?.value;

      if (!start || !end) return null;

      const startDate = new Date(start);
      const endDate = new Date(end);

      if (endDate < startDate) {
        return { endBeforeStart: true };
      }

      return null;
    };
  }

  formatDate(date: string | Date | undefined): string | null {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2); // maand is 0-indexed
    const day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }
}

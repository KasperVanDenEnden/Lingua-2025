import { Component, OnDestroy, OnInit } from '@angular/core';
import { ICourse, ICreateCourse, Id, IUser, Level } from '@lingua/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserService, CourseService } from '@lingua/services';
import { PagesModule } from '../../pages.module';

@Component({
  selector: 'lingua-course-form',
  imports: [PagesModule],
  templateUrl: './course-form.component.html',
  styleUrl: './course-form.component.css',
})
export class CourseFormComponent implements OnInit, OnDestroy{
   formSub?: Subscription;
    isEditMode?: boolean;
    existId!: Id;
  
    teachers: IUser[] = [];
  
    courseForm: FormGroup = new FormGroup({
      title: new FormControl(null, Validators.required),
      description: new FormControl(null, Validators.required),
      price: new FormControl(null, Validators.required),
      maxStudents: new FormControl(null, Validators.required),
      language: new FormControl(null, Validators.required),
      teacher: new FormControl(null, Validators.required),
      status: new FormControl(null, Validators.required),
      starts: new FormControl(null, Validators.required),
      ends: new FormControl(null, Validators.required),
    });
  
    constructor(
      private router: Router,
      private route: ActivatedRoute,
      private courseService: CourseService,
      private userService: UserService
    ) {}
  
    ngOnInit(): void {
      this.loadTeachers();
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
  
    loadTeachers() {
      this.userService.getUsers().subscribe((results) => {
        this.teachers = results.filter((user) => user.role === 'teacher');
      });
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
            teachers: courseData.teachers.map((teacher) => (teacher as IUser)._id),
            starts: courseData.starts,
            ends: courseData.ends,
          });
        },
        error: (err) => {
          console.error('Fout bij ophalen kamergegevens:', err);
        },
      });
    }
  
    onSubmit(): void {
      const data: ICreateCourse = {
        status: this.courseForm.value.status,
        teachers: [this.courseForm.value.teacher],
        title: this.courseForm.value.title,
        description: this.courseForm.value.description,
        language: this.courseForm.value.language,
        level: Level.A1,
        price: this.courseForm.value.price,
        maxStudents: this.courseForm.value.maxStudents,
        starts: this.courseForm.value.starts,
        ends: this.courseForm.value.ends || null,
      };
  
      if (this.isEditMode) {
        this.courseService.update(data, this.existId).subscribe((updatedCourse) => {
          this.courseService.triggerRefresh();
          this.router.navigate(['courses', updatedCourse._id]);
        });
      } else {
        this.courseService.create(data).subscribe((result) => {
          this.courseService.triggerRefresh();
          this.router.navigate(['/courses']);
        });
      }
    }
  
    closeForm() {
      const currentUrl = this.router.url.split('/');
      currentUrl.pop();
      this.router.navigate([currentUrl.join('/')]);
    }
}

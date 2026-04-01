import { Component, OnDestroy, OnInit } from '@angular/core';
import { CourseStatus, ICourse, Language } from '@lingua/api';
import { AuthService, CourseService, NotificationService, UserService } from '@lingua/services';
import { ActivatedRoute } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { PagesModule } from '../../pages.module';
import { Types } from 'mongoose';

@Component({
  selector: 'lingua-course-list',
  imports: [PagesModule],
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.css',
})
export class CourseListComponent implements OnInit, OnDestroy {
  courses?: ICourse[] | null;
  sub!: Subscription;
  currentUserId?: string;
  statuses = Object.values(CourseStatus); 
  languages = Object.values(Language); 

  searchQuery = '';
  selectedStatus: string = '';
  selectedLanguage: string = '';

  courseList$?: Observable<ICourse[]>;

  isModalOpen = false;
  recordToDelete?: ICourse | null;

  constructor(
    private courseService: CourseService,
    private route: ActivatedRoute,
    private notify: NotificationService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
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
    return this.courses.filter(course => {
      const matchesQuery = course.title.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchesStatus =  this.selectedStatus ? course.status === this.selectedStatus : true;
      const matchesLanguage = this.selectedLanguage ? course.language === this.selectedLanguage : true; 

      return matchesQuery && matchesStatus && matchesLanguage;
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
          this.notify.success('Gelukt!');
        },
        error: (error) => {
          this.notify.error(error);
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
    const role = this.authService.getUserRole();
    if (role === 'admin') return true;
    if (role === 'teacher') {
      const userId = this.authService.getUserId();
      if (!userId) return false;
      return course.teachers.some(t => t.toString() === userId);
    }
    return false;
  }
}

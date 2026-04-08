import { ICourse, Id, IUpdateCourseAssistant } from '@lingua/api';
import { environment } from '@lingua/util-env';
import { AuthService } from './auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CourseAssistantService {
  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  addAssistant(assistant: Id, courseId: string): Observable<ICourse> {
    const data: IUpdateCourseAssistant = {
      assistant: assistant,
      course: courseId,
    };

    return this.http.post<ICourse>(
      `${environment.dataApiUrl}/assistant/add`,
      data,
      this.auth.getHttpOptions(),
    );
  }

  removeAssistant(assistant: Id, courseId: string): Observable<ICourse> {
    const data: IUpdateCourseAssistant = {
      assistant: assistant,
      course: courseId,
    };

    return this.http.post<ICourse>(
      `${environment.dataApiUrl}/assistant/remove`,
      data,
      this.auth.getHttpOptions(),
    );
  }
}

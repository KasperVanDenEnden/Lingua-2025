import { Id, ICourse, IUpdateCourse, ICreateCourse } from "@lingua/api";
import { BehaviorSubject, Observable } from "rxjs";
import { environment } from "@lingua/util-env";
import { AuthService } from "./auth/auth.service";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CreateReviewDto } from "@lingua/dto";

@Injectable({
    providedIn: 'root'
})
export class CourseService {
    private refreshSubject = new BehaviorSubject<boolean>(false);
    refresh$ = this.refreshSubject.asObservable();

    constructor(private http: HttpClient, private auth:AuthService) {}

    triggerRefresh() {
        this.refreshSubject.next(true)
    }

    getCourses(): Observable<ICourse[]> {
        return this.http
            .get<ICourse[]>(`${environment.dataApiUrl}/course`, this.auth.getHttpOptions());
    }

    getCourseById(id: string): Observable<ICourse> {
        return this.http
            .get<ICourse>(`${environment.dataApiUrl}/course/${id}`, this.auth.getHttpOptions());
    }

    update(data: IUpdateCourse, id: Id) {
        return this.http
            .put<ICourse>(`${environment.dataApiUrl}/course/${id}`, data, this.auth.getHttpOptions());
    }

    create(data: ICreateCourse) {
        return this.http
            .post<ICourse>(`${environment.dataApiUrl}/course`, data, this.auth.getHttpOptions());
    }

    delete(id: Id) {
        return this.http
            .delete<ICourse>(`${environment.dataApiUrl}/course/${id}`, this.auth.getHttpOptions());
    }

  
    assignTeacher(courseId: Id, teacherId: Id) {
        return this.http.put(`${environment.dataApiUrl}/course/${courseId}/assign`, { teacherId }, this.auth.getHttpOptions());
    }

    removeTeacher(courseId: Id, teacherId: Id) {
        return this.http.put(`${environment.dataApiUrl}/course/${courseId}/remove`, { teacherId }, this.auth.getHttpOptions());
    }

    postReview(courseId: Id, dto: CreateReviewDto) {
      return this.http.post(`${environment.dataApiUrl}/course/${courseId}/review`, dto, this.auth.getHttpOptions());    
    }

    enroll(courseId: Id,) {
        return this.http.post(`${environment.dataApiUrl}/course/${courseId}/enroll`, {}, this.auth.getHttpOptions());
    }

    unenroll(courseId: Id,) {
        return this.http.post(`${environment.dataApiUrl}/course/${courseId}/unenroll`, {}, this.auth.getHttpOptions());
    }

    getRecomendations(userId: String) {
      return this.http.get<ICourse[]>(`${environment.rcmndApiUrl}/neo4j/user/${userId}/rcmnd`, this.auth.getHttpOptions());
    }
}
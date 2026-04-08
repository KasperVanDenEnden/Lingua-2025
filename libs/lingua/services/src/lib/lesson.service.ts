import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ICreateLesson, Id, ILesson, IUpdateLesson } from "@lingua/api";
import { BehaviorSubject, Observable } from "rxjs";
import { environment } from "@lingua/util-env";
import { AuthService } from "./auth/auth.service";

@Injectable({
    providedIn: 'root'
})
export class LessonService {
    
    private refreshSubject = new BehaviorSubject<boolean>(false);
    refresh$ = this.refreshSubject.asObservable();

    constructor(private http: HttpClient, private auth:AuthService) {}

    triggerRefresh() {
        this.refreshSubject.next(true)
    }

    getLessons(): Observable<ILesson[]> {
        return this.http
            .get<ILesson[]>(`${environment.dataApiUrl}/lesson`, this.auth.getHttpOptions());
    }

    getLessonById(id: string): Observable<ILesson> {
        return this.http
            .get<ILesson>(`${environment.dataApiUrl}/lesson/${id}`, this.auth.getHttpOptions());
    }

    update(data: IUpdateLesson, id: Id) {
        return this.http
            .put<ILesson>(`${environment.dataApiUrl}/lesson/${id}`, data, this.auth.getHttpOptions());
    }

    create(data: ICreateLesson) {
        return this.http
            .post<ILesson>(`${environment.dataApiUrl}/lesson`, data, this.auth.getHttpOptions());
    }

    delete(id: Id) {
        return this.http
            .delete<ILesson>(`${environment.dataApiUrl}/lesson/${id}`, this.auth.getHttpOptions());
    }

    attend(lessonId: string, ) {
        return this.http
            .post<ILesson>(`${environment.dataApiUrl}/lesson/${lessonId}/attend`, {}, this.auth.getHttpOptions());
    }

    unattend(lessonId: string) {
      return this.http
            .post<ILesson>(`${environment.dataApiUrl}/lesson/${lessonId}/unattend`, {}, this.auth.getHttpOptions());
    }
    
}
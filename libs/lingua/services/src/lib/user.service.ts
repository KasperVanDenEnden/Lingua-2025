import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ICreateUser, Id, IUser, IUpdateUser } from "@lingua/api";
import { BehaviorSubject, Observable } from "rxjs";
import { environment } from "@lingua/util-env";
import { AuthService } from "./auth/auth.service";

@Injectable({
    providedIn: 'root'
})
export class UserService {
    
   
    private refreshSubject = new BehaviorSubject<boolean>(false);
    refresh$ = this.refreshSubject.asObservable();

    constructor(private http: HttpClient, private auth:AuthService) {}

    triggerRefresh() {
        this.refreshSubject.next(true)
    }

    getUsers(): Observable<IUser[]> {
        return this.http
            .get<IUser[]>(`${environment.dataApiUrl}/user`, this.auth.getHttpOptions());
    }

    getUserById(id: string): Observable<IUser> {
        return this.http
            .get<IUser>(`${environment.dataApiUrl}/user/${id}`, this.auth.getHttpOptions());
    }

    update(data: IUpdateUser, id: Id) {
        return this.http
            .put<IUser>(`${environment.dataApiUrl}/user/${id}`, data, this.auth.getHttpOptions());
    }

    create(data: ICreateUser) {
        return this.http
            .post<IUser>(`${environment.dataApiUrl}/user`, data, this.auth.getHttpOptions());
    }

    delete(id: Id) {
        return this.http
            .delete<IUser>(`${environment.dataApiUrl}/user/${id}`, this.auth.getHttpOptions());
    }

    removeFriend(friendId: string) {
      return this.http
            .post<IUser>(`${environment.dataApiUrl}/user/${friendId}/unfollow`, {}, this.auth.getHttpOptions());
    }

    addFriend(friendId: string) {
      return this.http
            .post<IUser>(`${environment.dataApiUrl}/user/${friendId}/follow`, {}, this.auth.getHttpOptions());
    }
}
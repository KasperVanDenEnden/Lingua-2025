import { Route, RouterModule } from '@angular/router';
import {
  CourseDetailComponent,
  CourseFormComponent,
  CourseListComponent,
  DashboardComponent,
  LessonDetailComponent,
  LessonFormComponent,
  LessonListComponent,
  LoginComponent,
  PagesComponent,
  PasswordChangeComponent,
  RegisterComponent,
  UserDetailComponent,
  UserFormComponent,
  UserListComponent,
} from '@lingua/pages';
import { NgModule } from '@angular/core';
import { AuthGuard, RolesGuard } from '@lingua/services';
import { CommonComponent } from '@lingua/common';

export const appRoutes: Route[] = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard, RolesGuard] },
  {
    path: 'courses',
    component: CourseListComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'new', pathMatch: 'full', component: CourseFormComponent, canActivate: [RolesGuard], data: { role: 'teacher' } }
    ]
  },
  {
    path: 'courses/:id',
    canActivate: [AuthGuard],
    component: CourseDetailComponent,
    children: [
      { path: 'edit', pathMatch: 'full', component: CourseFormComponent, canActivate: [RolesGuard], data: { role: 'teacher' } }
    ]
  },
  {
    path: 'lessons',
    component: LessonListComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'new', pathMatch: 'full', component: LessonFormComponent, canActivate: [RolesGuard], data: { role: 'teacher' } }
    ]
  },
  {
    path: 'lessons/:id',
    canActivate: [AuthGuard],
    component: LessonDetailComponent,
    children: [
    { path: 'edit', pathMatch: 'full', component: LessonFormComponent, canActivate: [RolesGuard], data: { role: 'teacher' } }
    ]
  },
  {
    path: 'users',
    canActivate: [AuthGuard],
    component: UserListComponent,
    children: [
      { path: 'new', pathMatch: 'full', component: UserFormComponent, canActivate: [RolesGuard] , data: { role: 'admin' } },
    ]
  },
  
  {
    path: 'users/:id',
    canActivate: [AuthGuard, RolesGuard],
    data: { role: 'admin'},
    component: UserDetailComponent,
    children: [
      { path: 'edit', pathMatch: 'full', component: UserFormComponent},
    ]
  },
  {
    path: 'user/:id',
    canActivate: [AuthGuard],
    component: UserDetailComponent,
    children: [
      { path: 'edit', pathMatch: 'full', component: UserFormComponent },
      { path: 'change-password', pathMatch: 'full', component: PasswordChangeComponent }
    ]
  },
  { path: 'pages', component: PagesComponent },
  { path: 'access-denied', component: CommonComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

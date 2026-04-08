import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription, switchMap } from 'rxjs';
import { AuthService, NotificationService } from '@lingua/services';
import { Router } from '@angular/router';
import { ICreateUser } from '@lingua/api';
import { PagesModule } from '../../pages.module';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'lingua-register',
  imports: [PagesModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private notify = inject(NotificationService);

  registerForm!: FormGroup;
  subs: Subscription = new Subscription();

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  ngOnInit(): void {
    this.registerForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      firstname: new FormControl(null, [Validators.required]),
      lastname: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [Validators.required]),
      // pwdRepeat: new FormControl(null, [Validators.required]),
      role: new FormControl('student', [Validators.required]),
    });
  }
  ngOnDestroy(): void {
    this.subs?.unsubscribe();
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const data: ICreateUser = {
        email: this.registerForm.value.email,
        firstname: this.registerForm.value.firstname,
        lastname: this.registerForm.value.lastname,
        password: this.registerForm.value.password,
        role: this.registerForm.value.role,
      };
      console.log(data);

      this.authService
        .register(data)
        .pipe(
          switchMap((user) => {
            if (user) {
              return this.authService.login(
                this.registerForm.value.email,
                this.registerForm.value.password,
              );
            } else {
              throw new Error('Registration failed');
            }
          }),
        )
        .subscribe({
          next: () => {
            console.log('Successfully registered and logged in');
            this.router.navigate(['/dashboard']);
          },
          error: (err: HttpErrorResponse) => {
            console.log('ERROR:', err);
            const message =
              err?.error?.message || 'Registration failed: ' + err.message;
            this.notify.error(message);
          },
        });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}

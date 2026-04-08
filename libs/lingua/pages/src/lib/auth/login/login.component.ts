import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService, NotificationService } from '@lingua/services';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PagesModule } from '../../pages.module';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'lingua-login',
  imports: [PagesModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notify = inject(NotificationService);

  loginForm!: FormGroup;
  subs: Subscription = new Subscription();

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required]),
    });
  }

  ngOnDestroy(): void {
    this.subs?.unsubscribe();
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.subs = this.authService
        .login(this.loginForm.value.email, this.loginForm.value.password)
        .subscribe({
          next: (success) => {
            if (success) {
              const returnUrl =
                this.route.snapshot.queryParamMap.get('returnUrl') || '/';
              this.router.navigate([returnUrl]);
            }
          },
          error: (err: HttpErrorResponse) => {
            const message = err?.error?.message || 'Login failed: ' + err.message;
            this.notify.error(message);
          }
        });
    } else {
      this.loginForm.markAllAsTouched();
    }

  }
}

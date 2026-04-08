import { Component, OnDestroy, OnInit, inject } from '@angular/core';

import {
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService, NotificationService } from '@lingua/services';
import { ActivatedRoute, Router } from '@angular/router';
import { PagesModule } from '../../pages.module';
import { ChangePasswordDto } from '@lingua/dto';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'lingua-password-change',
  imports: [PagesModule],
  templateUrl: './password-change.component.html',
  styleUrl: './password-change.component.css',
})
export class PasswordChangeComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notify = inject(NotificationService);

  formSub?: Subscription;
  userId?: string;

  changePasswordForm: FormGroup = new FormGroup(
    {
      oldPassword: new FormControl(null, Validators.required),
      newPassword: new FormControl(null, Validators.required),
      repeatPassword: new FormControl(null, Validators.required),
    },
    { validators: passwordMatchValidator() },
  );

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      const id = params.get('id');

      if (id) this.userId = id;
    });
  }

  ngOnDestroy(): void {
    this.formSub?.unsubscribe();
  }

  closeForm() {
    const currentUrl = this.router.url.split('/');
    currentUrl.pop();
    this.router.navigate([currentUrl.join('/')]);
  }

  onSubmit() {
    const data: ChangePasswordDto = {
      oldPassword: this.changePasswordForm.value.oldPassword,
      newPassword: this.changePasswordForm.value.newPassword,
    };

    console.log(data, this.userId);
    if (this.userId) {
      this.authService.changePassword(data, this.userId).subscribe({
        next: () => {
          this.notify.success('Password updated successfully!');
        },
        error: (error: HttpErrorResponse) => {
          this.notify.error(
            error.error.message || 'Failed to update password.',
          );
        },
        complete: () => {
          this.router.navigate(['/user', this.userId]);
        },
      });
    }
  }
}

function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const oldPassword = control.get('oldPassword')?.value;
    const newPassword = control.get('newPassword')?.value;
    const repeatPassword = control.get('repeatPassword')?.value;

    if (!newPassword || !repeatPassword) return null;

    const errors: ValidationErrors = {};

    if (newPassword !== repeatPassword) {
      errors['passwordMismatch'] = true;
    }

    if (oldPassword && newPassword === oldPassword) {
      errors['passwordSameAsOld'] = true;
    }

    return Object.keys(errors).length ? errors : null;
  };
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { NotificationService, UserService } from '@lingua/services';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PagesModule } from '../../pages.module';
import { ActivatedRoute, Router } from '@angular/router';
import { ICreateUser, Id, IUpdateUser, IUser } from '@lingua/api';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'lingua-user-form',
  imports: [PagesModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css',
})
export class UserFormComponent implements OnInit, OnDestroy {
  formSub?: Subscription;
  isEditMode?:boolean;
  existId!: Id;

  userForm: FormGroup = new FormGroup({
    firstname: new FormControl(null, Validators.required),
    lastname: new FormControl(null, Validators.required)
  })

  constructor(
    private userService: UserService,
    private router:Router,
    private route: ActivatedRoute,
    private notify: NotificationService
  ) {}
  
  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      const id = params.get('id');

      if(id) {
        this.loadUserData(id);
        this.isEditMode = true;
        this.existId = id;
      } else {
        this.initializeNewUser();
        this.isEditMode = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.formSub?.unsubscribe();
  }

  initializeNewUser(): void {
    this.userForm.reset();

    this.userForm.addControl('role', new FormControl(null, Validators.required));
    this.userForm.addControl('email', new FormControl(null, Validators.required));
  }

  loadUserData(id: string): void {
    this.formSub = this.userService.getUserById(id).subscribe({
      next: (user: IUser) => {
        this.userForm.patchValue({
          firstname: user.firstname,
          lastname: user.lastname
        });
      },
      error: (err) => {
        console.error('Fout bij ophalen gebruikergegevens:', err)
      }
    })
  }

  onSubmit(): void {
    if (this.isEditMode) {
      const data: IUpdateUser = {
        firstname: this.userForm.value.firstname,
        lastname: this.userForm.value.lastname,
      }

      this.userService.update(data, this.existId).subscribe((updatedUser) => {
        this.userService.triggerRefresh();
        this.router.navigate(['/user', updatedUser._id]);
      })
    } else {
      const newPassword = uuidv4().slice(0,8);

      const data: ICreateUser = {
        firstname: this.userForm.value.firstname,
        lastname: this.userForm.value.lastname,
        role: this.userForm.value.role,
        email: this.userForm.value.email,
        password: newPassword
      }  

      this.userService.create(data).subscribe(() => {
        this.userService.triggerRefresh();

        this.notify.copyToClipboard('Generated Password', newPassword);
        this.router.navigate(['/user'])
      })
    }
  }

  closeForm() {
    const currentUrl = this.router.url.split('/');
    currentUrl.pop();
    this.router.navigate([currentUrl.join('/')]);
  }
}

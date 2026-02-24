import { Component, Input, OnInit } from '@angular/core';

import { IUser } from '@lingua/api';
import { AuthService } from '@lingua/services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'lingua-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  @Input() pageTitle!: string;
  userSubscription!: Subscription;
  currentUser: IUser | undefined = undefined;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
      });
  }
}

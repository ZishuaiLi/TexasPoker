import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';


import {AuthService} from '../_services/auth.service';
import {Router} from '@angular/router';
import {NotificationService} from '../_services/notification.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';


@Component({ templateUrl: 'login.component.html' ,
  styleUrls: ['login.component.css']})
export class LoginComponent {
 // loginForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  loginForm: FormGroup;


  constructor(
     private formBuilder: FormBuilder,
     private router: Router,
     private authService: AuthService,
     private notif: NotificationService
  ) {
    // redirect to home if already logged in
    if (this.authService.currentUserValue) {
   //   this.router.navigate(['/']);
    }
  }


  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    this.authService.login(this.loginForm.value.username, this.loginForm.value.password)
      .pipe(first())
      .subscribe(
        data => {
          this.router.navigate(['']);

          this.notif.showNotif('Logged in as: ' + this.loginForm.value.username, 'confirmation');
        },
        error => {
          this.error = error;
          this.loading = false;
          // show a snackbar to user
          this.notif.showNotif(this.error, 'dismiss');
          console.log('Error', error);
        });
  }
}



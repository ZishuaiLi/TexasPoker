import {Component} from '@angular/core';
import {AuthService} from './_services/auth.service';
import {Router} from '@angular/router';
import {NotificationService} from './_services/notification.service';
import {User} from './_models/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Texas Poker';
  currentUser: User;


  constructor(  private router: Router,
                private authService: AuthService,
                private notifService: NotificationService
  ) {
    this.authService.currentUser.subscribe(x => this.currentUser = x);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  notImplemented(message) {
    this.notifService.notImplementedWarning(message);
  }

}

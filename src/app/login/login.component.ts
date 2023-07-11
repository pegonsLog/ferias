import { Component, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subscription, map } from 'rxjs';
import { User } from '../shared/models/user';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnDestroy {
  username: string = '';
  password: string = '';

  subscription = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private router: Router
  ) {}

  authentication(username: string, password: string) {
    if (username !== '' || password !== '') {
      this.subscription = this.authService
        .list()
        .pipe(
          map((users: User[]) =>
            users.filter(
              (data) => data.username === username && data.password === password
            )
          )
        )
        .subscribe((users: User[]) => {
          for(let u of users){
          if (u.username === username) {
            this.router.navigate(['/home']);
            this.authService.userLogged(u.name!)
            this.authService.genderLogged(u.gender!)
            this.authService.toAuth();
          } else {
            this.onError();
            this.authService.toUnlogin();
          }
        }});
    } else {
      this.onError();
      this.authService.toUnlogin();
    }
  }

  onError() {
    this.snackBar.open('Usuário ou senha inválidos!', 'X', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

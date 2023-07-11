import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../login/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  menu: any = false;

  @Output() closeSidenav: EventEmitter<boolean> = new EventEmitter();

  constructor(private authService: AuthService, private router: Router) {}

  onOpened() {
    this.closeSidenav.emit();
  }

  toUnLogin() {
    this.authService.toUnlogin();
    this.router.navigate(['/login']);
  }
}

import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { Observable, Subscription, map } from 'rxjs';
import { UserService } from '../user.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/shared/dialogs/confirmation/confirmation.component';
import { User } from 'src/app/shared/models/user';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnDestroy {
  userCreate: string = 'userCreate';
  userUpdate: string = 'userUpdate';

  subscription: Subscription = new Subscription();

  user: User = {
    id: '',
    username: '',
    name: '',
    password: '',
    gender: '',
  };

  @Output() type: EventEmitter<string> = new EventEmitter<string>();
  @Output() userEmit: EventEmitter<any> = new EventEmitter<string>();

  dataSource$: Observable<any>;
  displayedColumns: string[] = ['username', 'name', 'password', 'actions'];

  constructor(private userService: UserService, public dialog: MatDialog) {
    this.dataSource$ = this.userService
      .list()
      .pipe(
        map((result) => result.sort((a, b) => a.name!.localeCompare(b.name!)))
      );
  }

  onCreateUser() {
    this.type.emit(this.userCreate);
  }
  onUpdateUser(id: string) {
    this.subscription = this.userService
      .findOne(id)
      .subscribe((result: User) => {
        this.userEmit.emit(result), this.type.emit(this.userUpdate);
      });
  }

  onDeleteUser(id: string) {
    const dialogReference = this.dialog.open(ConfirmationDialogComponent);
    this.subscription = dialogReference
      .afterClosed()
      .subscribe((result: any) => {
        if (result) {
          this.userService.delete(id).then();
        }
      });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { UserService } from '../user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DialogUpdatedComponent } from 'src/app/shared/dialogs/dialog-updated/dialog-updated.component';
import { User } from 'src/app/shared/models/user';

@Component({
  selector: 'app-user-update',
  templateUrl: './user-update.component.html',
  styleUrls: ['./user-update.component.scss'],
})
export class UserUpdateComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  subscription: Subscription = new Subscription();

  user: User = {
    id: '',
    username: '',
    name: '',
    password: '',
    gender: '',
  };
  
  @Input() userUpdate: User = {
    id: '',
    username: '',
    name: '',
    password: '',
    gender: '',
  };

  @Output() typeList: EventEmitter<string> = new EventEmitter<string>();
  main: string = 'main';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    public dialog: MatDialog
  ) {}

  async update() {

    this.user.username = this.form.value.username;
    this.user.name = this.form.value.name;
    this.user.password = this.form.value.password;
    this.user.gender = this.form.value.gender;
     return this.userService
      .update(this.user, this.userUpdate.id)
      .then(() => {
        const dialogReference = this.dialog.open(DialogUpdatedComponent);
        this.subscription = dialogReference.afterClosed().subscribe();
        this.typeList.emit(this.main);
      })
      .catch(() => console.log('Deu erro'));
  }

  ngOnInit(): void {
    console.log(this.form)
    this.form = this.fb.group({
      id: [this.userUpdate.id],
      username: [this.userUpdate.username, Validators.required],
      name: [this.userUpdate.name, Validators.required],
      password: [this.userUpdate.password, Validators.required],
      gender: [this.userUpdate.gender, Validators.required],
    });
  }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { createMask } from '@ngneat/input-mask';
import { Subscription } from 'rxjs';
import { DialogCreatedComponent } from 'src/app/shared/dialogs/dialog-created/dialog-created.component';
import { EmployeesService } from '../employees.service';
import { Employee } from 'src/app/shared/models/employee';

@Component({
  selector: 'app-employees-create',
  templateUrl: './employees-create.component.html',
  styleUrls: ['./employees-create.component.scss']
})
export class EmployeesCreateComponent {
  form: FormGroup;

  employee: Employee = {
    id: '',
    registration: '',
    name: '',
    birthday: ''
  };

  dateInputMask = createMask<Date>({
    alias: 'datetime',
    inputFormat: 'dd/mm',
    formatter: (value: string) => {
      const values = value.split('/');
      const month = +values[1] - 1;
      const date = +values[0];
      return new Date(month, date);
    },
  });

  subscription: Subscription = new Subscription();
  @Output() typeList: EventEmitter<string> = new EventEmitter<string>();
  main: string = 'main';

  constructor(
    private fb: FormBuilder,
    private employeesService: EmployeesService,
    public dialog: MatDialog
  ) {
    this.form = this.fb.group({
      registration: ['', Validators.required],
      name: ['', Validators.required],
      birthday: [''],
    });
  }

  onClear() {
    this.form.reset();
  }

  employeeAdd() {
    this.employee.registration = this.form.value.registration;
    this.employee.name = this.form.value.name;
    this.employee.birthday = this.form.value.birthday;

    return this.employeesService
      .employeeAdd(this.employee)
      .then(() => {
        const dialogReference = this.dialog.open(DialogCreatedComponent);
        this.subscription = dialogReference.afterClosed().subscribe();
        this.typeList.emit(this.main);
      })
      .catch(() => console.log('Deu erro'));
  }
}

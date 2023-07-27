import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { createMask } from '@ngneat/input-mask';
import { Subscription } from 'rxjs';
import { DialogCreatedComponent } from 'src/app/shared/dialogs/dialog-created/dialog-created.component';
import { EmployeesService } from '../employees.service';
import { Employee } from 'src/app/shared/models/employee';
import { formatDate } from '@angular/common';

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
    office: '',
    shift: '',
    admission: '',
    admission2: ''
  };

  dateInputMask = createMask<Date>({
    alias: 'datetime',
    inputFormat: 'dd/mm/yyyy',
    formatter: (value: string) => {
      const values = value.split('-');
      const date = +values[2];
      const month = +values[1] - 1;
      const year = +values[0];
      return formatDate(new Date(year, month, date), 'dd/MM/yyyy', 'en-US');
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
      office: ['', Validators.required],
      shift: ['', Validators.required],
      admission: ['', Validators.required],
      admission2: [''],
    });
  }

  employeeAdd() {
    this.employee.registration = this.form.value.registration;
    this.employee.name = this.form.value.name;
    this.employee.office = this.form.value.office;
    this.employee.shift = this.form.value.shift;
    this.employee.admission = this.form.value.admission;
    this.employee.admission2 = this.form.value.admission2;

    return this.employeesService
      .employeeAdd(this.employee)
      .then(() => {
        const dialogReference = this.dialog.open(DialogCreatedComponent);
        this.subscription = dialogReference.afterClosed().subscribe();
        this.typeList.emit(this.main);
      })
      .catch(() => console.log('Deu erro'));
  }
  onClear(){
    this.form.reset()
  }
}

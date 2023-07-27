import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeesService } from '../employees.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogUpdatedComponent } from 'src/app/shared/dialogs/dialog-updated/dialog-updated.component';
import { Subscription } from 'rxjs';
import { Employee } from 'src/app/shared/models/employee';

@Component({
  selector: 'app-employees-update',
  templateUrl: './employees-update.component.html',
  styleUrls: ['./employees-update.component.scss'],
})
export class EmployeesUpdateComponent implements OnInit {
  form!: FormGroup;
  subscription: Subscription = new Subscription();

  employee: Employee = {
    id: '',
    registration: '',
    name: '',
    shift: '',
    office: '',
    admission: '',
    admission2: '',
  };

  @Input() employeeUpdate: Employee = {
    id: '',
    registration: '',
    name: '',
    shift: '',
    office: '',
    admission: '',
    admission2: '',
  };

  @Output() typeList: EventEmitter<string> = new EventEmitter<string>();
  main: string = 'main';

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeesService,
    public dialog: MatDialog
  ) {}

  onUpdate() {
    this.employee.registration = this.form.value.registration;
    this.employee.name = this.form.value.name;
    this.employee.shift = this.form.value.shift;
    this.employee.office = this.form.value.office;
    this.employee.admission = this.form.value.admission;
    this.employee.admission2 = this.form.value.admission2;
    return this.employeeService
      .update(this.employee, this.employeeUpdate.id)
      .then(() => {
        const dialogReference = this.dialog.open(DialogUpdatedComponent);
        this.subscription = dialogReference.afterClosed().subscribe();
        this.typeList.emit(this.main);
      })
      .catch(() => console.log('Deu erro'));
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [this.employeeUpdate.id],
      registration: [this.employeeUpdate.registration, Validators.required],
      name: [this.employeeUpdate.name, Validators.required],
      office: [this.employeeUpdate.office, Validators.required],
      shift: [this.employeeUpdate.shift, Validators.required],
      admission: [this.employeeUpdate.admission, Validators.required],
      admission2: [this.employeeUpdate.admission2, Validators.required],
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

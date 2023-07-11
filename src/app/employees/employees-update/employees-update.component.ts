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
export class EmployeesUpdateComponent implements OnInit{
  form!: FormGroup;
  subscription: Subscription = new Subscription();

  employee: Employee = {
    id: '',
    registration: '',
    name: '',
    birthday: '',
  };

  @Input() employeeUpdate: Employee = {
    id: '',
    registration: '',
    name: '',
    birthday: '',
  };

  @Output() typeList: EventEmitter<string> = new EventEmitter<string>();
  employeeList: string = 'employeeList';

  constructor(
    private fb: FormBuilder,
    private employeesService: EmployeesService,
    public dialog: MatDialog
  ) {}

  onUpdate() {
    this.employee = this.form.getRawValue();
    this.employeesService.update(this.employee, this.employee.id).then();
    this.typeList.emit(this.employeeList);

    const dialogReference = this.dialog.open(DialogUpdatedComponent);
    this.subscription = dialogReference.afterClosed().subscribe();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [this.employeeUpdate.id],
      registration: [this.employeeUpdate.registration, Validators.required],
      name: [this.employeeUpdate.name, Validators.required],
      birthday: [this.employeeUpdate.birthday],
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

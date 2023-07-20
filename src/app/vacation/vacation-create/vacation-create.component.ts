import { formatDate } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { createMask } from '@ngneat/input-mask';
import { Subscription, map } from 'rxjs';
import { EmployeesService } from 'src/app/employees/employees.service';
import { DialogCreatedComponent } from 'src/app/shared/dialogs/dialog-created/dialog-created.component';
import { VacationService } from '../vacation.service';
import { Employee } from 'src/app/shared/models/employee';
import { Vacation } from 'src/app/shared/models/vacation';

@Component({
  selector: 'app-vacation-create',
  templateUrl: './vacation-create.component.html',
  styleUrls: ['./vacation-create.component.scss']
})
export class VacationCreateComponent {
  form: FormGroup;

  registrations: Employee[] = [];
  subscription: Subscription = new Subscription();
  @Output() typeList: EventEmitter<string> = new EventEmitter<string>();
  main: string = 'main';

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

  dateInput: number = 0;

  vacation: Vacation = {
    id: '',
    registration: '',
    startVacation: '',
    endVacation: '',
    limit: '',
    period: '',
    intprop: '',
    sell: '',
    observation: ''
  };

  constructor(
    private fb: FormBuilder,
    private vacationService: VacationService,
    private employeesService: EmployeesService,
    public dialog: MatDialog
  ) {
    this.subscription = this.employeesService
      .list()
      .pipe(
        map((result) => result.sort((a, b) => a.name!.localeCompare(b.name!)))
      )
      .subscribe((data: Employee[]) => (this.registrations = data));
    this.form = this.fb.group({
      registration: ['', Validators.required],
      startVacation: ['', Validators.required],
      endVacation: ['', Validators.required],
      limit: [''],
      period: ['', Validators.required],
      intprop: ['', Validators.required],
      sell: ['', Validators.required],
      observation: ['', Validators.required]
    });
  }

  onClear() {
    this.form.reset();
  }

  vacationAdd() {
    this.dateInput = new Date(this.form.value.startDay).getFullYear();

    this.vacation.registration = this.form.value.registration;
    this.vacation.startVacation = this.form.value.startDay;
    this.vacation.endVacation = this.form.value.endDay;
    this.vacation.limit = this.form.value.limit;
    this.vacation.period = this.form.value.period;
    this.vacation.intprop = this.form.value.intprop;
    this.vacation.sell = this.form.value.sell;
    this.vacation.observation = this.form.value.observation;
    return this.vacationService
      .vacationAdd(this.vacation)
      .then(() => {
        const dialogReference = this.dialog.open(DialogCreatedComponent);
        this.subscription = dialogReference.afterClosed().subscribe();
        this.typeList.emit(this.main);
      })
      .catch(() => console.log('Deu erro'));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

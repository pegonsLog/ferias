import { formatDate } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { createMask } from '@ngneat/input-mask';
import { Subscription, map } from 'rxjs';
import { EmployeesService } from 'src/app/employees/employees.service';
import { DialogUpdatedComponent } from 'src/app/shared/dialogs/dialog-updated/dialog-updated.component';
import { Employee } from 'src/app/shared/models/employee';
import { Vacation } from 'src/app/shared/models/vacation';
import { VacationService } from '../vacation.service';

@Component({
  selector: 'app-vacation-update',
  templateUrl: './vacation-update.component.html',
  styleUrls: ['./vacation-update.component.scss'],
})
export class VacationUpdateComponent implements OnInit {
  form!: FormGroup;

  registrations: Employee[] = [];
  name: string = '';
  office: string = '';
  admission: string = '';
  subscription: Subscription = new Subscription();
  subscription2: Subscription = new Subscription();
  @Output() typeList: EventEmitter<string> = new EventEmitter<string>();
  vacationList: string = 'vacationList';

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
    name: '',
    office: '',
    admission: '',
    startVacation: new Date(),
    endVacation: new Date(),
    days: 0,
    limit: new Date(),
    period: '',
    purchasing: '',
    intprop: '',
    sell: '',
    observation: '',
  };

  @Input() vacationUpdate: Vacation = {
    id: '',
    registration: '',
    name: '',
    office: '',
    admission: '',
    startVacation: new Date(),
    endVacation: new Date(),
    days: 0,
    limit: new Date(),
    period: '',
    purchasing: '',
    intprop: '',
    sell: '',
    observation: '',
  };

  @Output() searchTypeName: EventEmitter<string[]> = new EventEmitter<
    string[]
  >();

  constructor(
    private fb: FormBuilder,
    private vacationService: VacationService,
    private employeesService: EmployeesService,
    public dialog: MatDialog
  ) {
    this.subscription = this.employeesService
      .list()
      .pipe(
        map((result: any) =>
          result.sort((a: any, b: any) => a.name!.localeCompare(b.name!))
        )
      )
      .subscribe((data: Employee[]) => (this.registrations = data));
  }

  async update() {
    if (this.form.valid) {
      this.subscription2 = this.employeesService
        .findOneForRegistration(this.form.value.registration)
        .pipe(
          map((data) =>
            data.filter((employee: Employee) => {
              this.office = employee.office;
              this.name = employee.name;
              this.admission = employee.admission;
            })
          )
        )
        .subscribe(async () => {
          const initialDate = this.stringToDate(this.form.value.startVacation);
          const finalDate = this.stringToDate(this.form.value.endVacation);

          const days = this.diffInDays(initialDate, finalDate);

          this.vacation.registration = this.form.value.registration;
          this.vacation.name = this.name;
          this.vacation.office = this.office;
          this.vacation.admission = this.admission;
          this.vacation.startVacation = this.form.value.startVacation;
          this.vacation.endVacation = this.form.value.endVacation;
          this.vacation.purchasing = this.form.value.purchasing;
          this.vacation.days = days;
          this.vacation.limit = this.form.value.limit;
          this.vacation.period = this.form.value.period;
          this.vacation.intprop = this.form.value.intprop;
          this.vacation.sell = this.form.value.sell;
          this.vacation.observation = this.form.value.observation;
          return this.vacationService
            .update(this.vacation, this.vacationUpdate.id)
            .then(() => {
              const dialogReference = this.dialog.open(DialogUpdatedComponent);
              this.subscription = dialogReference.afterClosed().subscribe();
              this.searchTypeName.emit([
                this.form.value.registration,
                '8',
                '2023',
                this.vacationList,
              ]);
            })
            .catch(() => console.log('Deu erro'));
        });
    }
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [this.vacationUpdate.id],
      registration: [this.vacationUpdate.registration, Validators.required],
      admission: [this.vacationUpdate.admission],
      startVacation: [this.vacationUpdate.startVacation, Validators.required],
      endVacation: [this.vacationUpdate.endVacation, Validators.required],
      purchasing: [this.vacationUpdate.purchasing, Validators.required],
      limit: [this.vacationUpdate.limit],
      period: [this.vacationUpdate.period, Validators.required],
      intprop: [this.vacationUpdate.intprop, Validators.required],
      sell: [this.vacationUpdate.sell],
      observation: [this.vacationUpdate.observation],
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.subscription2.unsubscribe();
  }

  stringToDate(dateString: string): Date {
    const dateParts = dateString.split('/');

    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const year = parseInt(dateParts[2], 10);

    const date = new Date(year, month, day);

    return date;
  }

  diffInDays(initialDate: Date, finalDate: Date): number {
    const time1 = initialDate.getTime();
    const time2 = finalDate.getTime();

    const diffInMilliseconds = Math.abs(time2 - time1);

    const millisecondsInADay = 1000 * 60 * 60 * 24;
    const diffInDays = Math.floor(diffInMilliseconds / millisecondsInADay);

    return diffInDays + 1;
  }
}

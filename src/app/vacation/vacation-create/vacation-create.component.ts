import { formatDate } from '@angular/common';
import {
  Component,
  ComponentFactoryResolver,
  EventEmitter,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { createMask } from '@ngneat/input-mask';
import { Observable, Subscription, first, map, of } from 'rxjs';
import { EmployeesService } from 'src/app/employees/employees.service';
import { DialogCreatedComponent } from 'src/app/shared/dialogs/dialog-created/dialog-created.component';
import { VacationService } from '../vacation.service';
import { Employee } from 'src/app/shared/models/employee';
import { Vacation } from 'src/app/shared/models/vacation';
import { ThisReceiver } from '@angular/compiler';
import { ListKeyManager } from '@angular/cdk/a11y';

@Component({
  selector: 'app-vacation-create',
  templateUrl: './vacation-create.component.html',
  styleUrls: ['./vacation-create.component.scss'],
})
export class VacationCreateComponent {
  form: FormGroup;

  registrations: Employee[] = [];
  name: string = '';
  office: string = '';
  admission: string = '';

  subscription: Subscription = new Subscription();
  subscription2: Subscription = new Subscription();
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
      purchasing: ['', Validators.required],
      days: [0],
      limit: [''],
      period: ['', Validators.required],
      intprop: ['', Validators.required],
      sell: [''],
      observation: [''],
    });
  }

  onClear() {
    this.form.reset();
  }

  async vacationAdd() {

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
      ).subscribe(async () => {
        const initialDate = this.stringToDate(this.form.value.startVacation);
        const finalDate = this.stringToDate(this.form.value.endVacation);
  
        const days = this.diffInDays(initialDate, finalDate);
  
        this.vacation.registration = this.form.value.registration;
        this.vacation.name = this.name;
        this.vacation.office = this.office;
        this.vacation.admission = this.admission;
        this.vacation.registration = this.form.value.registration;  
        this.vacation.startVacation = this.form.value.startVacation;
        this.vacation.endVacation = this.form.value.endVacation;
        this.vacation.purchasing = this.form.value.purchasing;
        this.vacation.days = days;
        this.vacation.limit = this.form.value.limit;
        this.vacation.period = this.form.value.period;
        this.vacation.intprop = this.form.value.intprop;
        this.vacation.sell = this.form.value.sell;
        this.vacation.observation = this.form.value.observation;
        try {
          await this.vacationService
            .vacationAdd(this.vacation);
          const dialogReference = this.dialog.open(DialogCreatedComponent);
          this.subscription = dialogReference.afterClosed().subscribe();
          this.typeList.emit(this.main);
        } catch {
          return console.log('Deu erro');
        }
      }
      );      
    }
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

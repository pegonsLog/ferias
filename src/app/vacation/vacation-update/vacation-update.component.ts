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
export class VacationUpdateComponent implements OnInit{
  form!: FormGroup;

  registrations: Employee[] = [];
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

  dateInput: number = 0;

  vacation: Vacation = {
    id: '',
    registration: '',
    startVacation: new Date(),
    endVacation: new Date(),
    limit: new Date(),
    period: new Date(),
    intprop: '',
    sell: '',
    observation: '',
  };

  @Input() vacationUpdate: Vacation = {
    id: '',
    registration: '',
    startVacation: new Date(),
    endVacation: new Date(),
    limit: new Date(),
    period: new Date(),
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
        map((result: any) =>
          result.sort((a: any, b: any) => a.name!.localeCompare(b.name!))
        )
      )
      .subscribe((data: Employee[]) => (this.registrations = data));
  }

  async update() {
    this.vacation.registration = this.form.value.registration;
    this.vacation.startVacation = this.form.value.startVacation;
    this.vacation.endVacation = this.form.value.endVacation;
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
        this.typeList.emit(this.main);
      })
      .catch(() => console.log('Deu erro'));
  }

  ngOnInit(): void {
  
    this.form = this.fb.group({
      id: [this.vacationUpdate.id],
      registration: [this.vacationUpdate.registration, Validators.required],
      startVacation: [this.vacationUpdate.startVacation, Validators.required],
      endVacation: [this.vacationUpdate.endVacation, Validators.required],
      limit: [this.vacationUpdate.limit, Validators.required],
      period: [this.vacationUpdate.period, Validators.required],
      intprop: [this.vacationUpdate.intprop, Validators.required],
      sell: [this.vacationUpdate.sell, Validators.required],
      observation: [this.vacationUpdate.observation],
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.subscription2.unsubscribe();
  }
}

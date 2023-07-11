import { formatDate } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { createMask } from '@ngneat/input-mask';
import { Subscription, map } from 'rxjs';
import { EmployeesService } from 'src/app/employees/employees.service';
import { DialogCreatedComponent } from 'src/app/shared/dialogs/dialog-created/dialog-created.component';
import { FeriasService } from '../ferias.service';
import { Employee } from 'src/app/shared/models/employee';
import { Ferias } from 'src/app/shared/models/ferias';

@Component({
  selector: 'app-ferias-create',
  templateUrl: './ferias-create.component.html',
  styleUrls: ['./ferias-create.component.scss']
})
export class FeriasCreateComponent {
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

  ferias: Ferias = {
    id: '',
    registration: '',
    startVacation: new Date(),
    endVacation: new Date(),
  };

  constructor(
    private fb: FormBuilder,
    private feriasService: FeriasService,
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
    });
  }

  onClear() {
    this.form.reset();
  }

  feriasAdd() {
    this.dateInput = new Date(this.form.value.startDay).getFullYear();

    this.ferias.registration = this.form.value.registration;
    this.ferias.startVacation = this.form.value.startDay;
    this.ferias.endVacation = this.form.value.endDay;
    return this.feriasService
      .feriasAdd(this.ferias)
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

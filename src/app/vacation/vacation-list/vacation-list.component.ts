import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subscription, map } from 'rxjs';
import { ConfirmationDialogComponent } from 'src/app/shared/dialogs/confirmation/confirmation.component';
import { Vacation } from 'src/app/shared/models/vacation';
import { VacationService } from '../vacation.service';

@Component({
  selector: 'app-vacation-list',
  templateUrl: './vacation-list.component.html',
  styleUrls: ['./vacation-list.component.scss'],
})
export class VacationListComponent implements OnInit {
  subscription: Subscription = new Subscription();
  subscription2: Subscription = new Subscription();
  dataSource$!: Observable<any>;
  vacationUpdate: string = 'vacationUpdate';
  header: string = '';

  @Input() searchListCrud: any[] = [];

  @Output() crud: EventEmitter<string> = new EventEmitter<string>();
  @Output() type: EventEmitter<string> = new EventEmitter<string>();
  @Output() vacationEmit: EventEmitter<any> = new EventEmitter<string>();

  displayedColumns: string[] = [
    // 'id',
    'registration',
    'name',
    'office',
    'admission',
    'purchasing',
    'startVacation',
    'endVacation',
    'limit',
    'days',
    'period',
    'intprop',
    'sell',
    'actions',
  ];

  constructor(
    private vacationService: VacationService,
    public dialog: MatDialog
  ) {}
  ngOnInit(): void {
    if (this.searchListCrud[0] !== 'n/a') {
      this.forRegister(this.searchListCrud[0]);
      this.header = `Férias do funcionário: ${this.searchListCrud[0]}`;
    } else if (
      this.searchListCrud[1] !== 'n/a' &&
      this.searchListCrud[2] !== 'n/a'
    ) {
      this.forMonth(this.searchListCrud[1], this.searchListCrud[2]);
      this.header = `Férias do mês de: ${this.searchListCrud[1]}/${this.searchListCrud[2]}`;
    } else {
      this.forYear(this.searchListCrud[2]);
      this.header = `Férias do ano de: ${this.searchListCrud[2]}`;
    }
  }

  onUpdateVacation(id: string) {
    this.subscription2 = this.vacationService
      .findOne(id)
      .subscribe(
        (result: Vacation) => {this.vacationEmit.emit(result), this.type.emit(this.vacationUpdate)}
      );
  }

  onDeleteVacation(id: string) {
    const dialogReference = this.dialog.open(ConfirmationDialogComponent);
    this.subscription2 = dialogReference
      .afterClosed()
      .subscribe((result: any) => {
        if (result) {
          this.vacationService.delete(id).then();
        }
      });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.subscription2.unsubscribe();
  }

  forRegister(param: string) {
    this.dataSource$ = this.vacationService.list().pipe(
      map((data: Vacation[]) =>
        data
          .filter((result: Vacation) => result.registration == param)

          .sort((a, b) =>
            b.startVacation
              .toString()
              .split('/')
              .reverse()
              .join('/')
              .localeCompare(
                a.startVacation.toString().split('/').reverse().join('/')
              )
          )
      )
    );
  }

  forMonth(month: string, year: string) {
    const monthYear = `${month}/${year}`;

    this.dataSource$ = this.vacationService
      .list()
      .pipe(
        map((data: Vacation[]) =>
          data
            .filter(
              (result: Vacation) =>
                `${result.startVacation
                  .toString()
                  .substring(3, 6)}${result.startVacation
                  .toString()
                  .substring(6, 10)}` === monthYear
            )
            .sort((a, b) =>
              b.startVacation
                .toString()
                .split('/')
                .reverse()
                .join('/')
                .localeCompare(
                  a.startVacation.toString().split('/').reverse().join('/')
                )
            )
        )
      );
  }

  forYear(param: string) {
    this.dataSource$ = this.vacationService
      .list()
      .pipe(
        map((data: Vacation[]) =>
          data
            .filter(
              (result: Vacation) =>
                param === result.startVacation.toString().substring(6, 10)
            )
            .sort((a, b) =>
              b.startVacation
                .toString()
                .split('/')
                .reverse()
                .join('/')
                .localeCompare(
                  a.startVacation.toString().split('/').reverse().join('/')
                )
            )
        )
      );
  }
}

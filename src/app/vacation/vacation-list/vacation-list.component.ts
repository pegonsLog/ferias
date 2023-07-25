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
  dataSource$!: Observable<any>;
  vacationUpdate: string = 'vacationUpdate';

  @Input() searchListCrud: any[] = [];

  @Output() crud: EventEmitter<string> = new EventEmitter<string>();
  @Output() vacationEmit: EventEmitter<any> = new EventEmitter<string>();

  displayedColumns: string[] = [
    'registration',
    'startVacation',
    'endVacation',
    'intprop',
    'sell',
    'actions',
  ];

  constructor(
    private vacationService: VacationService,
    public dialog: MatDialog
  ) {}
  ngOnInit(): void {
    if (this.searchListCrud[1] === '' || this.searchListCrud[2] === '') {
      this.forRegister(this.searchListCrud[0]);
    }
    if (this.searchListCrud[0] === '' || this.searchListCrud[1] === '') {
      this.forYear(this.searchListCrud[2]);
    }
    if (this.searchListCrud[1] !== '' && this.searchListCrud[2] !== '') {
      this.forMonth(this.searchListCrud[1], this.searchListCrud[2]);
    }
  }

  onUpdateVacation(id: string) {
    this.subscription = this.vacationService
      .findOne(id)
      .subscribe((result: Vacation) => {
        this.vacationEmit.emit(result), this.crud.emit(this.vacationUpdate);
      });
  }

  onDeleteVacation(id: string) {
    const dialogReference = this.dialog.open(ConfirmationDialogComponent);
    this.subscription = dialogReference
      .afterClosed()
      .subscribe((result: any) => {
        if (result) {
          this.vacationService.delete(id).then();
        }
      });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  forRegister(param: string) {
    this.dataSource$ = this.vacationService.list().pipe(
      map((data: Vacation[]) =>
        data
          .filter((result: Vacation) => {
            param === result.registration;
          })
          // .sort((a, b) =>
          //   b.startVacation
          //     .toString()
          //     .split('/')
          //     .reverse()
          //     .join('/')
          //     .localeCompare(
          //       a.endVacation.toString().split('/').reverse().join('/')
          //     )
          // )
      )
    );
  }
  forMonth(month: string, year: string) {
    this.dataSource$ = this.vacationService.list().pipe(
      map((data: Vacation[]) =>
        data
          .filter((result: Vacation) => {
            result.startVacation.toString().substring(3, 5) === month &&
              result.startVacation.toString().substring(6, 10) === year;
          })
          // .sort((a, b) =>
          //   b.startVacation
          //     .toString()
          //     .split('/')
          //     .reverse()
          //     .join('/')
          //     .localeCompare(
          //       a.startVacation.toString().split('/').reverse().join('/')
          //     )
          // )
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
            // .sort((a, b) =>
            //   b.startVacation
            //     .toString()
            //     .split('/')
            //     .reverse()
            //     .join('/')
            //     .localeCompare(
            //       a.startVacation.toString().split('/').reverse().join('/')
            //     )
            // )
        )
      );
  }
}

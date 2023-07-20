import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { ConfirmationDialogComponent } from 'src/app/shared/dialogs/confirmation/confirmation.component';
import { Vacation } from 'src/app/shared/models/vacation';
import { VacationService } from '../vacation.service';

@Component({
  selector: 'app-vacation-list',
  templateUrl: './vacation-list.component.html',
  styleUrls: ['./vacation-list.component.scss']
})
export class VacationListComponent {
  subscription: Subscription = new Subscription();
  dataSource$: Observable<any>;
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
    'actions'
  ];

  constructor(
    private vacationService: VacationService,
    public dialog: MatDialog
  ) {
    this.dataSource$ = this.vacationService
      .list()
      // .pipe(
      //   map((data: Vacation[]) =>
      //     data
      //       .filter(
      //         (result: Vacation) =>
      //           this.searchListDay[0] === result.registration &&
      //           this.searchListDay[1] ===
      //             result.startDay.toString().substring(6) &&
      //           this.searchListDay[2] === result.type
      //       )
      //       .sort((a, b) =>
      //         b.startDay.toString().split('/').reverse().join('/').localeCompare(a.startDay.toString().split('/').reverse().join('/'))
      //       )
      //   )
      // );
  }

  onUpdateVacation(id: string) {
    this.subscription = this.vacationService
      .findOne(id)
      .subscribe((result: Vacation) => {
        this.vacationEmit.emit(result),
          this.crud.emit(this.vacationUpdate);
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


}

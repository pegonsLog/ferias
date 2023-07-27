import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subscription, map } from 'rxjs';
import { ConfirmationDialogComponent } from 'src/app/shared/dialogs/confirmation/confirmation.component';
import { Employee } from 'src/app/shared/models/employee';
import { EmployeesService } from '../employees.service';

@Component({
  selector: 'app-employees-list',
  templateUrl: './employees-list.component.html',
  styleUrls: ['./employees-list.component.scss'],
})
export class EmployeesListComponent implements OnDestroy {
  employeeCreate: string = 'employeeCreate';
  employeeUpdate: string = 'employeeUpdate';

  @Output() type: EventEmitter<string> = new EventEmitter<string>();
  @Output() employeeEmit: EventEmitter<any> = new EventEmitter<string>();

  displayedColumns: string[] = [
    'name',
    'registration',
    'office',
    'shift',
    'admission',
    'admission2',
    'actions',
  ];
  subscriptionDelete: Subscription = new Subscription();
  subscriptionUpdate: Subscription = new Subscription();
  dataSource$: Observable<any>;

  constructor(
    private employeeService: EmployeesService,
    public dialog: MatDialog
  ) {
    this.dataSource$ = employeeService
      .list()
      .pipe(
        map((result) => result.sort((a, b) => a.name!.localeCompare(b.name!)))
      );
  }

  onCreateEmployee() {
    this.type.emit(this.employeeCreate);
  }

  onUpdateEmployee(id: string) {
    this.subscriptionUpdate = this.employeeService
      .findOne(id)
      .subscribe((result: Employee) => {
        this.employeeEmit.emit(result), this.type.emit(this.employeeUpdate);
      });
  }

  onDeleteEmployee(id: string) {
    const dialogReference = this.dialog.open(ConfirmationDialogComponent);
    this.subscriptionDelete = dialogReference
      .afterClosed()
      .subscribe((result: any) => {
        if (result) {
          this.employeeService.delete(id).then();
        }
      });
  }

  ngOnDestroy(): void {
  this.subscriptionUpdate.unsubscribe();
  this.subscriptionDelete.unsubscribe();
  }
}

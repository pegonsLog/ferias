import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subscription, map } from 'rxjs';
import { EmployeesService } from '../employees.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/shared/dialogs/confirmation/confirmation.component';
import { Employee } from 'src/app/shared/models/employee';

@Component({
  selector: 'app-employees-list',
  templateUrl: './employees-list.component.html',
  styleUrls: ['./employees-list.component.scss'],
})
export class EmployeesListComponent {
  employeeCreate: string = 'employeeCreate';
  employeeUpdate: string = 'employeeUpdate';

  @Output() type: EventEmitter<string> = new EventEmitter<string>();
  @Output() employeeEmit: EventEmitter<any> = new EventEmitter<string>();

  displayedColumns: string[] = ['name', 'registration', 'birthday', 'actions'];
  subscription: Subscription = new Subscription();
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

  onCreateUser() {
    this.type.emit(this.employeeCreate);
  }

  onUpdateUser(id: string) {
    this.subscription = this.employeeService
      .findOne(id)
      .subscribe((result: Employee) => {
        this.employeeEmit.emit(result), this.type.emit(this.employeeUpdate);
      });
  }

  onDeleteEmployee(id: string) {
    const dialogReference = this.dialog.open(ConfirmationDialogComponent);
    this.subscription = dialogReference
      .afterClosed()
      .subscribe((result: any) => {
        if (result) {
          this.employeeService.delete(id).then();
        }
      });
  }
  // applyFilter(event: KeyboardEvent) {
  //   const filterValue = (event.target as HTMLInputElement).value;
  //   this.dataSource$.filter = filterValue.trim().toLowerCase();
  // }
}

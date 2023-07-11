import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { Employee } from '../shared/models/employee';
import { EmployeesService } from '../employees/employees.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnDestroy {
  registrationSearch: string = '';
  yearSearch: string = '';
  typeSearch: string = '';
  modeSearch: string = '';

  searchType: string = '';

  registrations: Employee[] = [];

  subscription: Subscription = new Subscription();

  @Output() searchTypeName: EventEmitter<string[]> = new EventEmitter<
    string[]
  >();

  constructor(private employeesService: EmployeesService) {
    this.registrationSearch = '';
    this.yearSearch = '2023';
    this.typeSearch = 'Atestado de dia';
    this.modeSearch = '';

    this.subscription = this.employeesService
      .list()
      .subscribe((data: Employee[]) => (this.registrations = data));
  }

  onSearch(typeSearch: string) {
    switch (typeSearch) {
      case 'Atestado de dia':
        this.searchType = 'dayList';
        break;
      case 'Atestado de hora':
        this.searchType = 'hourList';
        break;
      case 'Atestado de doação':
        this.searchType = 'donationList';
        break;
    }

    this.searchTypeName.emit([
      this.registrationSearch,
      this.yearSearch,
      this.typeSearch,
      this.modeSearch,
      this.searchType,
    ]);
  }

  onClear() {
    this.registrationSearch = '';
    this.yearSearch = '';
    this.typeSearch = '';
    this.modeSearch = '';
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

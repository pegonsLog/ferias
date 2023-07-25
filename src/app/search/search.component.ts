import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { EmployeesService } from '../employees/employees.service';
import { Employee } from '../shared/models/employee';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnDestroy, OnChanges {
  registrationSearch: string = '';
  yearSearch: string = '';
  monthSearch: string = '';
  vacationList: string = 'vacationList';

  @Input() typeCalendarSearch: string | null | undefined;
  isEmployee: boolean = false;
  isMonth: boolean = false;
  isYear: boolean = false;

  registrations: Employee[] = [];

  subscription: Subscription = new Subscription();

  @Output() searchTypeName: EventEmitter<string[]> = new EventEmitter<
    string[]
  >();

  constructor(private employeesService: EmployeesService) {
    this.subscription = this.employeesService
      .list()
      .subscribe((data: Employee[]) => (this.registrations = data));
  }
  ngOnChanges(): void {
    if (this.typeCalendarSearch === 'FÉRIAS DO FUNCIONÁRIO') {
      this.isEmployee = true;
      this.isMonth = false;
      this.isYear = false;
    }
    if (this.typeCalendarSearch === 'FÉRIAS DO MÊS') {
      this.isMonth = true;
      this.isEmployee = false;
      this.isYear = false;
    }
    if (this.typeCalendarSearch === 'FÉRIAS DO ANO') {
      this.isYear = true;
      this.isMonth = false;
      this.isEmployee = false;
    }
  }

  onSearch() {
    if (this.typeCalendarSearch === 'FÉRIAS DO FUNCIONÁRIO') {
      this.monthSearch = '';
      this.yearSearch = '';
    }
    if (this.typeCalendarSearch === 'FÉRIAS DO MÊS') {
      this.registrationSearch = '';
    }
    if (this.typeCalendarSearch === 'FÉRIAS DO ANO') {
      this.monthSearch = '';
      this.registrationSearch = '';
    }

    this.searchTypeName.emit([
      this.registrationSearch,
      this.monthSearch,
      this.yearSearch,
      this.vacationList
    ]);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

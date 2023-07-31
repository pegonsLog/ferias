import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Vacation } from 'src/app/shared/models/vacation';
import { VacationService } from 'src/app/vacation/vacation.service';

@Component({
  selector: 'app-search-list',
  templateUrl: './search-list.component.html',
  styleUrls: ['./search-list.component.scss'],
})
export class SearchListComponent implements OnDestroy {

  monthSearch: string = '';
  yearSearch: string = '';
  list: Vacation[] = [];
  subscription: Subscription = new Subscription();

  @Output() listEmit: EventEmitter<string[]> = new EventEmitter<string[]>

  constructor(private vacationService: VacationService, private router: Router) {
    this.subscription = this.vacationService
      .list()
      .subscribe((result: Vacation[]) => (this.list = result));
  }

  onSearch(monthSearch: string, yearSearch: string) {
    const navigationExtras: NavigationExtras = {
      queryParams: { monthSearch: monthSearch,  yearSearch: yearSearch},
    };
    this.router.navigate(['month-list'], navigationExtras);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

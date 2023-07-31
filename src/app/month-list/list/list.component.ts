import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription, map, of } from 'rxjs';
import { Vacation } from 'src/app/shared/models/vacation';
import { VacationService } from 'src/app/vacation/vacation.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  subscription: Subscription = new Subscription();
  dataSource$!: Observable<any>;
  header: string = '';
  monthList: string = '';
  yearList: string = '';

  displayedColumns: string[] = [
    'registration',
    'purchasing',
    'startVacation',
    'endVacation',
    'days',
    'intprop',
    'sell',
  ];

  headerVacationList: string = 'FÉRIAS DO MÊS DE ';
  literarMonth: string = '';

  constructor(
    private vacationService: VacationService,
    private router: ActivatedRoute
  ) {
   this.subscription = this.router.queryParams.subscribe((params) => {
      this.monthList = params['monthSearch'];
      this.yearList = params['yearSearch'];  
    });
  }
  ngOnInit() {
    const monthYear = `${this.monthList}/${this.yearList}`;

    this.dataSource$ = this.vacationService
      .list()
      .pipe(
        map((data: Vacation[]) =>
          data
            .filter(
              (result: Vacation) =>
                result.startVacation.toString().substring(3, 5) ===
                  this.monthList &&
                result.startVacation.toString().substring(6, 10) ===
                  this.yearList
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
      this.nameMonth(this.monthList);
  }

  nameMonth(nameMonth: string){
    switch(nameMonth){
      case '01': this.literarMonth ='JANEIRO'; break;
      case '02': this.literarMonth ='FEVEREIRO'; break;
      case '03': this.literarMonth ='MARÇO'; break;
      case '04': this.literarMonth ='ABRIL'; break;
      case '05': this.literarMonth ='MAIO'; break;
      case '06': this.literarMonth ='JUNHO'; break;
      case '07': this.literarMonth ='JULHO'; break;
      case '08': this.literarMonth ='AGOSTO'; break;
      case '09': this.literarMonth ='SETEMBRO'; break;
      case '10': this.literarMonth ='OUTUBRO'; break;
      case '11': this.literarMonth ='NOVEMBRO'; break;
      case '12': this.literarMonth ='DEZEMBRO'; break;
    }

  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../shared/models/user';
import { Employee } from '../shared/models/employee';
import { Ferias } from '../shared/models/ferias';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  menuName: string[] = [
    'dayCreate',
    'dayUpdate',
    'dayList',
    'hourCreate',
    'hourUpdate',
    'hourList',
    'donationCreate',
    'donationUpdate',
    'donationList',
    'employeeCreate',
    'employeeUpdate',
    'employeeList',
    'userCreate',
    'userUpdate',
    'userList',
    'search',
    'main',
    'birthday'
  ];

  typeName: string = '';
  isOpened: boolean = true;

  titleName: string | null = '';
  titleUser: string | null = '';
  gender: string | null = '';

  @Input() registration: string = '';
  @Input() year: string = '';
  @Input() type: string = '';
  @Input() mode: string = '';

  registrationSearch: string = '';
  yearSearch: string = '';
  modeSearch: string = '';
  typeSearch: string = '';
  userUpdate: User = {
    id: '',
    username: '',
    name: '',
    password: '',
    gender: '',
  };
  employeeUpdate: Employee = {
    id: '',
    registration: '',
    name: '',
    birthday: '',
  };
  feriasUpdate: Ferias = {
    id: '',
    registration: '',
    startVacation: new Date(),
    endVacation: new Date(),
 
  };

  searchList: any[] = [];

  @Output() registrationSearchList: EventEmitter<any> = new EventEmitter<any>();
  @Output() searchListDay: EventEmitter<any> = new EventEmitter<any>();
  @Output() searchListHour: EventEmitter<any> = new EventEmitter<any>();
  @Output() searchListDonation: EventEmitter<any> = new EventEmitter<any>();
  @Output() updateUser: EventEmitter<any> = new EventEmitter<any>();

  day: string = 'dayCreate';
  dayUpdate: string = 'dayUpdate';
  dayList: string = 'dayList';
  hour: string = 'hourCreate';
  hourUpdate: string = 'hourUpdate';
  hourList: string = 'hourList';
  donation: string = 'donationCreate';
  donationUpdate: string = 'donationUpdate';
  donationList: string = 'donationList';
  employeeList: string = 'employeeList';
  users: string = 'userList';
  search: string = 'search';
  main: string = 'main';
  birthday: string = 'birthday';

  dataSource$: Observable<any> | undefined;

  constructor() {
    this.titleUser = localStorage.getItem('user');
    this.gender = localStorage.getItem('gender');
  }

  onType(type: any) {
    if (this.menuName[0] === type) {
      this.typeName = 'dayCreate';
    }
    if (this.menuName[1] === type) {
      this.typeName = 'dayUpdate';
    }
    if (this.menuName[2] === type) {
      this.typeName = 'dayList';
    }
    if (this.menuName[3] === type) {
      this.typeName = 'hourCreate';
    }
    if (this.menuName[4] === type) {
      this.typeName = 'hourUpdate';
    }
    if (this.menuName[5] === type) {
      this.typeName = 'hourList';
    }
    if (this.menuName[6] === type) {
      this.typeName = 'donationCreate';
    }
    if (this.menuName[7] === type) {
      this.typeName = 'donationUpdate';
    }
    if (this.menuName[8] === type) {
      this.typeName = 'donationList';
    }
    if (this.menuName[9] === type) {
      this.typeName = 'employeeCreate';
    }
    if (this.menuName[10] === type) {
      this.typeName = 'employeeUpdate';
    }
    if (this.menuName[11] === type) {
      this.typeName = 'employeeList';
    }
    if (this.menuName[12] === type) {
      this.typeName = 'userCreate';
    }
    if (this.menuName[13] === type) {
      this.typeName = 'userUpdate';
    }
    if (this.menuName[14] === type) {
      this.typeName = 'userList';
    }
    if (this.menuName[15] === type) {
      this.typeName = 'search';
    }
    if (this.menuName[16] === type) {
      this.typeName = 'main';
    }
    if (this.menuName[17] === type) {
      this.typeName = 'birthday';
    }
  }

  onYear(year: any) {
    this.year = year;
  }
  onMode(mode: any) {
    this.mode = mode;
  }
  onRegistration(registration: string) {
    this.registration = registration;
  }
  onOpened() {
    this.isOpened = !this.isOpened;
  }
  onListUsers(users: any) {
    this.titleName = 'USUÁRIOS CADASTRADOS';
    this.onType(users);
  }
  onListEmployees(employees: any) {
    this.titleName = 'FUNCIONÁRIOS CADASTRADOS';
    this.onType(employees);
  }
  onDay(day: string) {
    this.titleName = 'FÉRIAS';
    this.onType(day);
  }
  onUpdateAllType(main: string) {
    this.titleName = '';
    this.onType(main);
  }
  onTypeList(typeList: any) {
    this.titleName = 'LISTA DE ATESTADOS';
    this.onType(typeList[4]);
    this.registrationSearch = typeList[0];
    this.yearSearch = typeList[1];
    this.typeSearch = typeList[2];
    this.modeSearch = typeList[3];

    this.searchList = [
      this.registrationSearch,
      this.yearSearch,
      this.typeSearch,
      this.modeSearch,
    ];
  }
  onSearch(search: string) {
    this.titleName = 'CONSULTA';
    this.onType(search);
  }
  registrationOutput(registration: any) {
    this.registrationSearchList.emit(registration);
  }
  onUpdate(event: any) {
    this.userUpdate = event;
  }
  onUpdateEmployee(event: any) {
    this.employeeUpdate = event;
  }
  onBirthday(birthday: any) {
    this.titleName = 'ANIVERSARIANTES';
    this.onType(birthday);
  }
}

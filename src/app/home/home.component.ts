import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../shared/models/user';
import { Employee } from '../shared/models/employee';
import { Vacation } from '../shared/models/vacation';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  menuName: string[] = [
    'vacationCreate',
    'vacationUpdate',
    'vacationList',
    'employeeCreate',
    'employeeUpdate',
    'employeeList',
    'userCreate',
    'userUpdate',
    'userList',
    'search',
    'main',
  ];

  typeName: string = '';
  isOpened: boolean = true;

  titleName: string | null = '';
  titleUser: string | null = '';
  gender: string | null = '';
  typeCalendarSearch: string | null | undefined;

  @Input() registration: string = '';

  registrationSearch: string = '';
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
    shift: '',
    office: '',
    admission: '',
    admission2: '',
  };
  vacationUpdate: Vacation = {
    id: '',
    registration: '',
    startVacation: new Date(),
    endVacation: new Date(),
    limit: new Date(),
    period: new Date(),
    intprop: '',
    sell: '',
    observation: '',
  };

  searchList: any[] = [];

  @Output() registrationSearchList: EventEmitter<any> = new EventEmitter<any>();
  @Output() updateUser: EventEmitter<any> = new EventEmitter<any>();
  vacationCrud: string[] = [];

  employeeList: string = 'employeeList';
  vacationList: string = 'vacationList';
  vacationCreate: string = 'vacationCreate';
  update: string = 'vacationUpdate';
  users: string = 'userList';
  search: string = 'search';
  main: string = 'main';

  dataSource$: Observable<any> | undefined;

  constructor(private readonly elementRef: ElementRef) {
    this.titleUser = localStorage.getItem('user');
    this.gender = localStorage.getItem('gender');
  }

  onType(type: any) {
    if (this.menuName[0] === type) {
      this.typeName = 'vacationCreate';
    }
    if (this.menuName[1] === type) {
      this.typeName = 'vacationUpdate';
    }
    if (this.menuName[2] === type[3]) {
      this.typeName = type[3];
      this.vacationCrud = type;
    }
    if (this.menuName[3] === type) {
      this.typeName = 'employeeCreate';
    }
    if (this.menuName[4] === type) {
      this.typeName = 'employeeUpdate';
    }
    if (this.menuName[5] === type) {
      this.typeName = 'employeeList';
    }
    if (this.menuName[6] === type) {
      this.typeName = 'userCreate';
    }
    if (this.menuName[7] === type) {
      this.typeName = 'userUpdate';
    }
    if (this.menuName[8] === type) {
      this.typeName = 'userList';
    }
    if (this.menuName[9] === type) {
      this.typeName = 'search';
    }
    if (this.menuName[10] === type) {
      this.typeName = 'main';
    }
  }

  onRegistration(registration: string) {
    this.registration = registration;
  }
  onOpened() {
    this.isOpened = !this.isOpened;
  }
  onUpdateAllType(main: string) {
    this.titleName = '';
    this.onType(main);
  }

  onVacationList(vacationList: any[]) {
    this.titleName = 'LISTA';
    this.onType(vacationList);
  }

  onVacationCreate(vacationCreate: string) {
    this.titleName = 'FÉRIAS';
    this.onType(vacationCreate);
  }

  onVacationUpdate(event: any) {
    this.titleName = 'FÉRIAS';
    this.vacationUpdate = event;
    this.onType(this.vacationUpdate);
  }

  onTypeList(typeList: any) {
    this.titleName = 'LISTA DE FÉRIAS';
    this.onType(typeList[4]);
    this.registrationSearch = typeList[0];
    this.searchList = [this.registrationSearch];
  }
  
  onSearchListVacation() {
    return this.vacationCrud;
  }

  onSearchEmployee() {
    this.titleName = 'CONSULTA POR FUNCIONÁRIO';
    this.typeName = 'search';
    this.typeCalendarSearch = document.querySelector(
      'a[id="vacation_employee"]'
    )?.textContent;
  }

  onSearchMonth() {
    this.titleName = 'CONSULTA POR MÊS';
    this.typeName = 'search';
    this.typeCalendarSearch = document.querySelector(
      'a[id="vacation_month"]'
    )?.textContent;
  }

  onSearchYear() {
    this.titleName = 'CONSULTA POR ANO';
    this.typeName = 'search';
    this.typeCalendarSearch = document.querySelector(
      'a[id="vacation_year"]'
    )?.textContent;
  }

  registrationOutput(registration: any) {
    this.registrationSearchList.emit(registration);
  }

  onEmployeesList(employees: any) {
    this.titleName = 'FUNCIONÁRIOS CADASTRADOS';
    this.onType(employees);
  }

  onEmployeesCreate(event: any) {
    this.employeeUpdate = event;
  }

  onEmployeesUpdate(event: any) {
    this.titleName = 'FUNCIONÁRIOS';
    this.employeeUpdate = event;
    this.onType(this.employeeUpdate);
  }

  onUsersList(users: any) {
    this.titleName = 'USUÁRIOS CADASTRADOS';
    this.onType(users);
  }

  onUsersCreate(event: any) {
    this.employeeUpdate = event;
  }

  onUsersUpdate(event: any) {
    this.titleName = 'USUÁRIOS';
    this.userUpdate = event;
    this.onType(this.userUpdate);
  }
}

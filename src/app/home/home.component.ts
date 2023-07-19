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
  feriasUpdate: Ferias = {
    id: '',
    registration: '',
    startVacation: new Date(),
    endVacation: new Date(),
  };

  searchList: any[] = [];

  @Output() registrationSearchList: EventEmitter<any> = new EventEmitter<any>();
  @Output() updateUser: EventEmitter<any> = new EventEmitter<any>();

  employeeList: string = 'employeeList';
  vacationList: string = 'vacationList';
  vacationCreate: string = 'vacationCreate';
  vacationUpdate: string = 'vacationUpdate';
  users: string = 'userList';
  search: string = 'search';
  main: string = 'main';

  dataSource$: Observable<any> | undefined;

  constructor() {
    this.titleUser = localStorage.getItem('user');
    this.gender = localStorage.getItem('gender');
  }

  onType(type: any) {
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

  onVacationList(day: string) {
    this.titleName = 'LISTA';
    this.onType(day);
  }
  onVacationCreate(day: string) {
    this.titleName = 'FÉRIAS';
    this.onType(day);
  }
  onVacationUpdate(event: any) {
    this.userUpdate = event;
  }

  // onTypeList(typeList: any) {
  //   this.titleName = 'LISTA DE ATESTADOS';
  //   this.onType(typeList[4]);
  //   this.registrationSearch = typeList[0];

  //   this.searchList = [
  //     this.registrationSearch,
  //   ]
  // }

  onSearch(search: string) {
    this.titleName = 'CONSULTA';
    this.onType(search);
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
    this.employeeUpdate = event;
  }


  onUsersList(users: any) {
    this.titleName = 'USUÁRIOS CADASTRADOS';
    this.onType(users);
  }
  onUsersCreate(event: any) {
    this.employeeUpdate = event;
  }
  onUsersUpdate(event: any) {
    this.employeeUpdate = event;
  }
}

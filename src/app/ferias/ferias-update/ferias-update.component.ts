import { Component } from '@angular/core';
import { Ferias } from 'src/app/shared/models/ferias';

@Component({
  selector: 'app-ferias-update',
  templateUrl: './ferias-update.component.html',
  styleUrls: ['./ferias-update.component.scss']
})
export class FeriasUpdateComponent {

  feriasUpdate!: Ferias;

}

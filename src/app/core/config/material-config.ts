import {
  EnvironmentProviders,
  Injectable,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { provideDateFnsAdapter } from '@angular/material-date-fns-adapter';
import { MAT_DATE_LOCALE, MatDateFormats } from '@angular/material/core';
import { MatDatepickerIntl } from '@angular/material/datepicker';
import { MAT_DIALOG_DEFAULT_OPTIONS, MatDialogConfig } from '@angular/material/dialog';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatIconRegistry } from '@angular/material/icon';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MAT_TOOLTIP_DEFAULT_OPTIONS } from '@angular/material/tooltip';
import { ptBR } from 'date-fns/locale';

/**
 * Formatos dos campos de data. A digitação aceita "01/08/2023", "1/8/23", "01082023" e "010823".
 * O formato com ano de 2 dígitos vem primeiro para que "01/08/23" não vire o ano 0023.
 */
export const APP_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: ['dd/MM/yy', 'dd/MM/yyyy', 'ddMMyy', 'ddMMyyyy'],
  },
  display: {
    dateInput: 'dd/MM/yyyy',
    monthYearLabel: 'LLL yyyy',
    dateA11yLabel: 'PPP',
    monthYearA11yLabel: 'LLLL yyyy',
  },
};

@Injectable()
export class PtBrPaginatorIntl extends MatPaginatorIntl {
  override itemsPerPageLabel = 'Itens por página';
  override nextPageLabel = 'Próxima página';
  override previousPageLabel = 'Página anterior';
  override firstPageLabel = 'Primeira página';
  override lastPageLabel = 'Última página';
  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) return `0 de ${length}`;
    const start = page * pageSize;
    const end = Math.min(start + pageSize, length);
    return `${start + 1} – ${end} de ${length}`;
  };
}

@Injectable()
export class PtBrDatepickerIntl extends MatDatepickerIntl {
  override calendarLabel = 'Calendário';
  override openCalendarLabel = 'Abrir calendário';
  override closeCalendarLabel = 'Fechar calendário';
  override prevMonthLabel = 'Mês anterior';
  override nextMonthLabel = 'Próximo mês';
  override prevYearLabel = 'Ano anterior';
  override nextYearLabel = 'Próximo ano';
  override prevMultiYearLabel = 'Anos anteriores';
  override nextMultiYearLabel = 'Próximos anos';
  override switchToMonthViewLabel = 'Escolher data';
  override switchToMultiYearViewLabel = 'Escolher mês e ano';
  override startDateLabel = 'Data de início';
  override endDateLabel = 'Data de término';
}

/** Padrões do Angular Material para toda a aplicação (idioma, datas, ícones e diálogos). */
export function provideMaterialConfig(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideDateFnsAdapter(APP_DATE_FORMATS),
    { provide: MAT_DATE_LOCALE, useValue: ptBR },
    { provide: MatPaginatorIntl, useClass: PtBrPaginatorIntl },
    { provide: MatDatepickerIntl, useClass: PtBrDatepickerIntl },
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } },
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: { ...new MatDialogConfig(), maxWidth: '96vw', restoreFocus: true },
    },
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: { ...new MatSnackBarConfig(), duration: 4000 },
    },
    {
      provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
      useValue: { showDelay: 300, hideDelay: 0, touchendHideDelay: 1500 },
    },
    provideAppInitializer(() => {
      inject(MatIconRegistry).setDefaultFontSetClass('material-symbols-outlined');
    }),
  ]);
}

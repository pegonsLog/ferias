import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { EmployeeRepository } from '../../core/data/employee-repository';
import { VacationRepository } from '../../core/data/vacation-repository';
import { describeError } from '../../core/errors';
import { parseDate, toDayNumber } from '../../domain/dates';
import { Employee } from '../../domain/employee';
import { SortAccessors, SortState, sortRows } from '../../domain/sort';
import { matchesSearch } from '../../domain/text';
import { ConfirmService } from '../../shared/ui/confirm-dialog';
import { EmptyState } from '../../shared/ui/empty-state';
import { NotificationService } from '../../shared/ui/notification-service';
import { PageHeader } from '../../shared/ui/page-header';
import type { EmployeeFormData, EmployeeFormResult } from './employee-form-dialog';

const dateKey = (value: string) => {
  const date = parseDate(value);
  return date ? toDayNumber(date) : null;
};

const ACCESSORS: SortAccessors<Employee> = {
  name: (row) => row.name,
  registration: (row) => row.registration,
  office: (row) => row.office,
  shift: (row) => row.shift,
  admission: (row) => dateKey(row.admission),
  admission2: (row) => dateKey(row.admission2),
};

@Component({
  selector: 'app-employees-page',
  imports: [
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
    PageHeader,
    EmptyState,
  ],
  templateUrl: './employees-page.html',
  styleUrl: './employees-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeesPage {
  private readonly repository = inject(EmployeeRepository);
  private readonly vacations = inject(VacationRepository);
  private readonly dialog = inject(MatDialog);
  private readonly confirm = inject(ConfirmService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  protected readonly columns = [
    'name',
    'registration',
    'office',
    'shift',
    'admission',
    'admission2',
    'actions',
  ];
  protected readonly pageSizes = [10, 25, 50, 100];
  protected readonly status = this.repository.status;
  protected readonly total = computed(() => this.repository.employees().length);

  protected readonly search = signal('');
  protected readonly sort = signal<SortState>({ active: 'name', direction: 'asc' });
  protected readonly pageSize = signal(25);
  private readonly requestedPage = signal(0);

  protected readonly filtered = computed(() =>
    this.repository
      .employees()
      .filter((employee) =>
        matchesSearch(
          this.search(),
          employee.name,
          employee.registration,
          employee.office,
          employee.shift,
        ),
      ),
  );
  private readonly sorted = computed(() => sortRows(this.filtered(), this.sort(), ACCESSORS));
  /** Página atual, corrigida quando a lista diminui (ex.: após excluir o último item). */
  protected readonly pageIndex = computed(() => {
    const lastPage = Math.max(0, Math.ceil(this.sorted().length / this.pageSize()) - 1);
    return Math.min(this.requestedPage(), lastPage);
  });
  protected readonly rows = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.sorted().slice(start, start + this.pageSize());
  });

  protected onSearch(value: string): void {
    this.search.set(value);
    this.requestedPage.set(0);
  }

  protected onSort(sort: SortState): void {
    this.sort.set(sort);
    this.requestedPage.set(0);
  }

  protected onPage(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.requestedPage.set(event.pageIndex);
  }

  protected reload(): void {
    this.repository.reload();
  }

  protected async create(): Promise<void> {
    const result = await this.openForm({});
    if (result) this.notifications.success('Funcionário cadastrado com sucesso.');
  }

  protected async edit(employee: Employee): Promise<void> {
    const result = await this.openForm({ employee });
    if (!result) return;
    const extra =
      result.vacationsUpdated > 0
        ? ` ${result.vacationsUpdated} ${result.vacationsUpdated === 1 ? 'registro de férias foi atualizado' : 'registros de férias foram atualizados'}.`
        : '';
    this.notifications.success(`Funcionário atualizado com sucesso.${extra}`);
  }

  protected viewVacations(employee: Employee): void {
    void this.router.navigate(['/ferias/funcionario'], {
      queryParams: { matricula: employee.registration },
    });
  }

  protected async remove(employee: Employee): Promise<void> {
    const vacationCount = this.vacations.forRegistration(employee.registration).length;
    const confirmed = await this.confirm.confirm({
      title: 'Excluir funcionário',
      message: `Deseja realmente excluir ${employee.name} (Mat. ${employee.registration})?`,
      details:
        vacationCount > 0
          ? `Este funcionário tem ${vacationCount} ${vacationCount === 1 ? 'registro' : 'registros'} de férias. O histórico de férias será mantido e continuará disponível nas consultas.`
          : 'Esta ação não pode ser desfeita.',
      confirmText: 'Excluir',
      tone: 'danger',
    });
    if (!confirmed) return;

    try {
      await this.repository.remove(employee.id);
      this.notifications.success('Funcionário excluído.');
    } catch (error) {
      this.notifications.error(describeError(error, 'Não foi possível excluir o funcionário.'));
    }
  }

  private async openForm(data: EmployeeFormData): Promise<EmployeeFormResult | undefined> {
    const { EmployeeFormDialog } = await import('./employee-form-dialog');
    const ref = this.dialog.open<
      InstanceType<typeof EmployeeFormDialog>,
      EmployeeFormData,
      EmployeeFormResult
    >(EmployeeFormDialog, {
      data,
      width: '680px',
      autoFocus: data.employee ? 'dialog' : 'first-tabbable',
    });
    return firstValueFrom(ref.afterClosed());
  }
}

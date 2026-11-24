import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { firstValueFrom } from 'rxjs';

import { SessionStore } from '../../core/auth/session-store';
import { UserRepository } from '../../core/data/user-repository';
import { describeError } from '../../core/errors';
import { SortAccessors, SortState, sortRows } from '../../domain/sort';
import { initials, matchesSearch } from '../../domain/text';
import { AppUser } from '../../domain/user';
import { ConfirmService } from '../../shared/ui/confirm-dialog';
import { EmptyState } from '../../shared/ui/empty-state';
import { NotificationService } from '../../shared/ui/notification-service';
import { PageHeader } from '../../shared/ui/page-header';
import type { UserFormData, UserFormResult } from './user-form-dialog';

const ACCESSORS: SortAccessors<AppUser> = {
  name: (row) => row.name,
  username: (row) => row.username,
  gender: (row) => row.gender,
};

@Component({
  selector: 'app-users-page',
  imports: [
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
    PageHeader,
    EmptyState,
  ],
  templateUrl: './users-page.html',
  styleUrl: './users-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersPage {
  private readonly repository = inject(UserRepository);
  private readonly session = inject(SessionStore);
  private readonly dialog = inject(MatDialog);
  private readonly confirm = inject(ConfirmService);
  private readonly notifications = inject(NotificationService);

  protected readonly columns = ['name', 'username', 'gender', 'actions'];
  protected readonly status = this.repository.status;
  protected readonly total = computed(() => this.repository.users().length);
  protected readonly currentUserId = computed(() => this.session.user()?.id ?? '');

  protected readonly search = signal('');
  protected readonly sort = signal<SortState>({ active: 'name', direction: 'asc' });
  protected readonly rows = computed(() =>
    sortRows(
      this.repository
        .users()
        .filter((user) => matchesSearch(this.search(), user.name, user.username)),
      this.sort(),
      ACCESSORS,
    ),
  );

  protected initials(name: string): string {
    return initials(name);
  }

  protected reload(): void {
    this.repository.reload();
  }

  protected async create(): Promise<void> {
    const result = await this.openForm({});
    if (result) this.notifications.success('Usuário cadastrado com sucesso.');
  }

  protected async edit(user: AppUser): Promise<void> {
    const result = await this.openForm({ user });
    if (result) this.notifications.success('Usuário atualizado com sucesso.');
  }

  protected async remove(user: AppUser): Promise<void> {
    if (user.id === this.currentUserId()) {
      this.notifications.error('Você não pode excluir o próprio usuário enquanto está conectado.');
      return;
    }
    if (this.total() <= 1) {
      this.notifications.error('É preciso manter pelo menos um usuário com acesso ao sistema.');
      return;
    }

    const confirmed = await this.confirm.confirm({
      title: 'Excluir usuário',
      message: `Deseja realmente excluir o acesso de ${user.name} (usuário ${user.username})?`,
      details: 'A pessoa não conseguirá mais entrar no sistema.',
      confirmText: 'Excluir',
      tone: 'danger',
    });
    if (!confirmed) return;

    try {
      await this.repository.remove(user.id);
      this.notifications.success('Usuário excluído.');
    } catch (error) {
      this.notifications.error(describeError(error, 'Não foi possível excluir o usuário.'));
    }
  }

  private async openForm(data: UserFormData): Promise<UserFormResult | undefined> {
    const { UserFormDialog } = await import('./user-form-dialog');
    const ref = this.dialog.open<InstanceType<typeof UserFormDialog>, UserFormData, UserFormResult>(
      UserFormDialog,
      {
        data,
        width: '560px',
        autoFocus: data.user ? 'dialog' : 'first-tabbable',
      },
    );
    return firstValueFrom(ref.afterClosed());
  }
}

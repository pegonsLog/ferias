import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { VacationRepository } from '../../core/data/vacation-repository';
import { describeError } from '../../core/errors';
import { VacationEntry, describeRange } from '../../domain/vacation';
import { ConfirmService } from '../../shared/ui/confirm-dialog';
import { NotificationService } from '../../shared/ui/notification-service';
import type { VacationFormData, VacationFormResult } from './vacation-form-dialog';

export interface CreateVacationOptions {
  /** Funcionário já selecionado no formulário. */
  readonly registration?: string;
  /** Oferece um atalho para ver as férias do funcionário depois de salvar. */
  readonly offerNavigation?: boolean;
}

/** Ponto único para incluir, editar e excluir férias a partir de qualquer tela. */
@Injectable({ providedIn: 'root' })
export class VacationEditor {
  private readonly dialog = inject(MatDialog);
  private readonly confirm = inject(ConfirmService);
  private readonly vacations = inject(VacationRepository);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  async create(options: CreateVacationOptions = {}): Promise<boolean> {
    const result = await this.open({ registration: options.registration });
    if (!result) return false;

    const snack = this.notifications.success(
      'Férias cadastradas com sucesso.',
      options.offerNavigation ? 'Ver férias' : undefined,
    );
    if (options.offerNavigation) {
      snack.onAction().subscribe(() => {
        void this.router.navigate(['/ferias/funcionario'], {
          queryParams: { matricula: result.registration },
        });
      });
    }
    return true;
  }

  async edit(vacation: VacationEntry): Promise<boolean> {
    const result = await this.open({ vacation });
    if (!result) return false;
    this.notifications.success('Férias atualizadas com sucesso.');
    return true;
  }

  async remove(vacation: VacationEntry): Promise<boolean> {
    const confirmed = await this.confirm.confirm({
      title: 'Excluir férias',
      message: `Deseja realmente excluir as férias de ${vacation.name || 'Mat. ' + vacation.registration} (${describeRange(vacation)})?`,
      details: 'Esta ação não pode ser desfeita.',
      confirmText: 'Excluir',
      tone: 'danger',
    });
    if (!confirmed) return false;

    try {
      await this.vacations.remove(vacation.id);
      this.notifications.success('Férias excluídas.');
      return true;
    } catch (error) {
      this.notifications.error(describeError(error, 'Não foi possível excluir as férias.'));
      return false;
    }
  }

  private async open(data: VacationFormData): Promise<VacationFormResult | undefined> {
    const { VacationFormDialog } = await import('./vacation-form-dialog');
    const ref = this.dialog.open<
      InstanceType<typeof VacationFormDialog>,
      VacationFormData,
      VacationFormResult
    >(VacationFormDialog, {
      data,
      width: '760px',
      autoFocus: data.vacation ? 'dialog' : 'first-tabbable',
    });
    return firstValueFrom(ref.afterClosed());
  }
}

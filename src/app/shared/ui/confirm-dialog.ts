import { ChangeDetectionStrategy, Component, Injectable, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';

export interface ConfirmOptions {
  readonly title: string;
  readonly message: string;
  /** Texto complementar exibido em destaque (ex.: consequências da ação). */
  readonly details?: string;
  readonly confirmText?: string;
  readonly cancelText?: string;
  readonly tone?: 'danger' | 'primary';
  readonly icon?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>
      <span class="confirm__icon" [class.confirm__icon--danger]="danger">
        <mat-icon>{{ data.icon ?? (danger ? 'delete' : 'help') }}</mat-icon>
      </span>
      {{ data.title }}
    </h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
      @if (data.details) {
        <p class="alert alert--warning confirm__details">
          <mat-icon>info</mat-icon>
          <span>{{ data.details }}</span>
        </p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" [mat-dialog-close]="false">
        {{ data.cancelText ?? 'Cancelar' }}
      </button>
      <button mat-flat-button type="button" [class.btn-danger]="danger" [mat-dialog-close]="true">
        {{ data.confirmText ?? 'Confirmar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .confirm__icon {
      display: inline-grid;
      place-items: center;
      width: 40px;
      height: 40px;
      border-radius: 12px;
      color: var(--mat-sys-primary);
      background: var(--mat-sys-primary-container);
    }
    .confirm__icon--danger {
      color: var(--app-danger);
      background: var(--app-danger-bg);
    }
    .confirm__details {
      margin-top: 16px;
    }
  `,
})
export class ConfirmDialog {
  protected readonly data = inject<ConfirmOptions>(MAT_DIALOG_DATA);
  protected readonly danger = this.data.tone !== 'primary';
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly dialog = inject(MatDialog);

  /** Abre o diálogo de confirmação e resolve `true` apenas se o usuário confirmar. */
  async confirm(options: ConfirmOptions): Promise<boolean> {
    const ref = this.dialog.open<ConfirmDialog, ConfirmOptions, boolean>(ConfirmDialog, {
      data: options,
      width: '460px',
      autoFocus: 'dialog',
    });
    return (await firstValueFrom(ref.afterClosed())) === true;
  }
}

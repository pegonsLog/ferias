import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';

/** Mensagens rápidas (snackbar) de sucesso e erro. */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string, action?: string): MatSnackBarRef<TextOnlySnackBar> {
    return this.snackBar.open(message, action ?? 'OK', {
      panelClass: 'snack--success',
      duration: action ? 6000 : 4000,
    });
  }

  error(message: string): MatSnackBarRef<TextOnlySnackBar> {
    return this.snackBar.open(message, 'Fechar', {
      panelClass: 'snack--error',
      duration: 8000,
      politeness: 'assertive',
    });
  }
}

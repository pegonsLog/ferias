import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialogRef } from '@angular/material/dialog';
import { filter, merge } from 'rxjs';

import { ConfirmService } from './confirm-dialog';

/**
 * Protege formulários abertos em diálogo contra fechamento acidental (clique fora ou Esc):
 * se houver alterações não salvas, pede confirmação antes de descartar.
 * Deve ser chamado no construtor do componente do diálogo.
 */
export function guardDialogClose<R>(isDirty: () => boolean): () => Promise<void> {
  const ref = inject<MatDialogRef<unknown, R>>(MatDialogRef);
  const confirm = inject(ConfirmService);
  const destroyRef = inject(DestroyRef);
  let asking = false;

  ref.disableClose = true;

  const requestClose = async (): Promise<void> => {
    if (asking) return;
    if (!isDirty()) {
      ref.close();
      return;
    }
    asking = true;
    const discard = await confirm.confirm({
      title: 'Descartar alterações?',
      message: 'As informações digitadas ainda não foram salvas e serão perdidas.',
      confirmText: 'Descartar',
      cancelText: 'Continuar editando',
      icon: 'edit_off',
    });
    asking = false;
    if (discard) ref.close();
  };

  merge(ref.backdropClick(), ref.keydownEvents().pipe(filter((event) => event.key === 'Escape')))
    .pipe(takeUntilDestroyed(destroyRef))
    .subscribe(() => void requestClose());

  return requestClose;
}

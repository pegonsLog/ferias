import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/** Mensagem para listas vazias, estados iniciais e falhas de carregamento. */
@Component({
  selector: 'app-empty-state',
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'status', '[class.empty--error]': 'tone() === "error"' },
  template: `
    <span class="empty__icon"
      ><mat-icon>{{ icon() }}</mat-icon></span
    >
    <h3 class="empty__title">{{ heading() }}</h3>
    @if (message()) {
      <p class="empty__message">{{ message() }}</p>
    }
    <div class="empty__actions"><ng-content /></div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 48px 24px;
      text-align: center;
    }
    .empty__icon {
      display: grid;
      place-items: center;
      width: 56px;
      height: 56px;
      margin-bottom: 4px;
      border-radius: 16px;
      color: var(--mat-sys-primary);
      background: var(--mat-sys-primary-container);
    }
    :host(.empty--error) .empty__icon {
      color: var(--app-danger);
      background: var(--app-danger-bg);
    }
    .empty__title {
      font-size: 16px;
    }
    .empty__message {
      max-width: 420px;
      color: var(--app-text-muted);
    }
    .empty__actions:not(:empty) {
      margin-top: 8px;
    }
  `,
})
export class EmptyState {
  readonly icon = input('inbox');
  readonly heading = input.required<string>();
  readonly message = input<string>();
  readonly tone = input<'default' | 'error'>('default');
}

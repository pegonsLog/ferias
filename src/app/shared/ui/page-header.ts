import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Título da página com descrição e área para botões de ação. */
@Component({
  selector: 'app-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header__text">
      <h2 class="page-header__title">{{ heading() }}</h2>
      @if (description()) {
        <p class="page-header__description">{{ description() }}</p>
      }
    </div>
    <div class="page-header__actions">
      <ng-content />
    </div>
  `,
  styles: `
    :host {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }
    .page-header__title {
      font-size: 24px;
      line-height: 32px;
    }
    .page-header__description {
      margin-top: 4px;
      color: var(--app-text-muted);
    }
    .page-header__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  `,
})
export class PageHeader {
  readonly heading = input.required<string>();
  readonly description = input<string>();
}

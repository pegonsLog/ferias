import {
  DestroyRef,
  Directive,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  input,
} from '@angular/core';

/**
 * Limita a altura de um container de tabela para mostrar exatamente N registros; o restante
 * fica acessível pela rolagem vertical (o cabeçalho fixo continua visível).
 * A altura é medida nas linhas reais, então funciona mesmo quando um nome quebra em duas linhas.
 *
 * Uso: `<div class="table-scroll" [appVisibleRows]="7"><table mat-table>...</table></div>`
 */
@Directive({ selector: '[appVisibleRows]' })
export class VisibleRows {
  readonly appVisibleRows = input.required<number>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private observer: ResizeObserver | null = null;

  constructor() {
    afterNextRender(() => {
      const table = this.host.querySelector('table');
      if (!table || typeof ResizeObserver === 'undefined') return;
      // Linhas novas, remoção de linhas ou quebra de texto mudam o tamanho da tabela.
      this.observer = new ResizeObserver(() => this.update());
      this.observer.observe(table);
      this.update();
    });
    effect(() => {
      this.appVisibleRows();
      this.update();
    });
    inject(DestroyRef).onDestroy(() => this.observer?.disconnect());
  }

  private update(): void {
    const limit = this.appVisibleRows();
    const header = this.host.querySelector<HTMLElement>('tr.mat-mdc-header-row, thead tr');
    const rows = this.host.querySelectorAll<HTMLElement>('tr.mat-mdc-row, tbody tr');
    if (!header || rows.length <= limit) {
      this.host.style.maxHeight = '';
      return;
    }
    let height = header.getBoundingClientRect().height;
    for (let i = 0; i < limit; i++) height += rows[i].getBoundingClientRect().height;
    this.host.style.maxHeight = `${Math.ceil(height)}px`;
  }
}

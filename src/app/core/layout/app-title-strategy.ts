import { Injectable, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';

const APP_NAME = 'Controle de Férias';

/** Define o título da aba e expõe título/seção da página atual para o cabeçalho. */
@Injectable({ providedIn: 'root' })
export class AppTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  readonly pageTitle = signal('');
  readonly pageSection = signal('');

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const pageTitle = this.buildTitle(snapshot) ?? '';
    this.pageTitle.set(pageTitle);
    this.pageSection.set(this.findSection(snapshot.root));
    this.title.setTitle(pageTitle ? `${pageTitle} · ${APP_NAME}` : `${APP_NAME} · GARBO`);
  }

  private findSection(route: ActivatedRouteSnapshot): string {
    let section = '';
    for (
      let current: ActivatedRouteSnapshot | null = route;
      current;
      current = current.firstChild
    ) {
      const value = current.data['section'];
      if (typeof value === 'string') section = value;
    }
    return section;
  }
}

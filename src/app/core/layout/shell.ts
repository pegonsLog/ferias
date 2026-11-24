import { BreakpointObserver } from '@angular/cdk/layout';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  linkedSignal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';

import { firstName, initials } from '../../domain/text';
import { VacationEditor } from '../../features/vacations/vacation-editor';
import { AuthService } from '../auth/auth-service';
import { SessionStore } from '../auth/session-store';
import { AppTitleStrategy } from './app-title-strategy';
import { NAVIGATION, NavAction } from './navigation';

/** Estrutura das telas internas: menu lateral, barra superior e área de conteúdo. */
@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell {
  private readonly session = inject(SessionStore);
  private readonly auth = inject(AuthService);
  private readonly vacationEditor = inject(VacationEditor);
  private readonly titles = inject(AppTitleStrategy);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  protected readonly navigation = NAVIGATION;
  protected readonly isHandset = toSignal(
    inject(BreakpointObserver)
      .observe('(max-width: 959.98px)')
      .pipe(map((state) => state.matches)),
    { initialValue: false },
  );
  protected readonly sidenavOpened = linkedSignal(() => !this.isHandset());

  protected readonly user = this.session.user;
  protected readonly firstName = computed(() => firstName(this.user()?.name ?? ''));
  protected readonly initials = computed(() => initials(this.user()?.name ?? ''));
  protected readonly pageTitle = this.titles.pageTitle;
  protected readonly pageSection = this.titles.pageSection;

  constructor() {
    inject(DestroyRef).onDestroy(this.auth.watchCurrentUser());

    // Sessão encerrada (inclusive em outra aba) ou usuário excluído: fecha os diálogos e volta
    // para o login.
    effect(() => {
      if (this.session.isAuthenticated()) return;
      this.dialog.closeAll();
      void this.router.navigateByUrl('/login');
    });

    // No celular, o menu fecha depois de escolher uma opção.
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        if (this.isHandset()) this.sidenavOpened.set(false);
      });
  }

  protected toggleSidenav(): void {
    this.sidenavOpened.update((opened) => !opened);
  }

  protected run(action: NavAction | undefined): void {
    if (this.isHandset()) this.sidenavOpened.set(false);
    if (action === 'add-vacation') void this.vacationEditor.create({ offerNavigation: true });
  }

  protected logout(): void {
    this.auth.logout();
  }
}

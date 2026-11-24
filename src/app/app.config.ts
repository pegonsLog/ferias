import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  TitleStrategy,
  provideRouter,
  withComponentInputBinding,
  withNavigationErrorHandler,
} from '@angular/router';

import { routes } from './app.routes';
import { reloadOnChunkLoadError } from './core/config/chunk-load-recovery';
import { provideMaterialConfig } from './core/config/material-config';
import { AppTitleStrategy } from './core/layout/app-title-strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withNavigationErrorHandler(reloadOnChunkLoadError),
    ),
    { provide: TitleStrategy, useExisting: AppTitleStrategy },
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    provideMaterialConfig(),
  ],
};

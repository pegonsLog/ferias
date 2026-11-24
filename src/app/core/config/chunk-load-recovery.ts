import { NavigationError } from '@angular/router';

const RELOAD_KEY = 'ferias.chunk-reload-at';
const CHUNK_ERROR =
  /dynamically imported module|Importing a module script failed|error loading dynamically|ChunkLoadError/i;

/**
 * Depois de uma nova publicação, abas abertas com a versão antiga tentam baixar arquivos que
 * não existem mais e a tela ficaria em branco. Nesse caso recarregamos a página no endereço
 * desejado (no máximo uma vez a cada 10 segundos, para evitar laços).
 */
export function reloadOnChunkLoadError(event: NavigationError): void {
  const error = event.error as { message?: unknown } | undefined;
  const message = String(error?.message ?? event.error ?? '');
  if (!CHUNK_ERROR.test(message)) return;

  const lastReload = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
  if (Date.now() - lastReload < 10_000) return;

  sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  location.assign(event.url);
}

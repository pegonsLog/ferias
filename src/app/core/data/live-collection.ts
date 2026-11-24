import { Signal, computed, effect, signal, untracked } from '@angular/core';
import {
  DocumentData,
  Query,
  QueryDocumentSnapshot,
  Unsubscribe,
  onSnapshot,
} from 'firebase/firestore';

export type LoadStatus = 'loading' | 'ready' | 'error';

type Mapper<T> = (id: string, data: DocumentData) => T;

/**
 * Mantém uma consulta do Firestore sincronizada em tempo real e expõe o resultado como signals.
 * Uma única escuta é compartilhada por todas as telas que usam o mesmo repositório, e ela só
 * fica ativa enquanto `enabled` for verdadeiro (sessão iniciada).
 * Deve ser criada em contexto de injeção (ex.: campo de um serviço).
 */
export class LiveCollection<T> {
  private readonly _items = signal<readonly T[]>([]);
  private readonly _status = signal<LoadStatus>('loading');
  private readonly _error = signal<unknown>(null);
  private unsubscribe: Unsubscribe | null = null;

  readonly items = this._items.asReadonly();
  readonly status = this._status.asReadonly();
  readonly error = this._error.asReadonly();
  readonly loading = computed(() => this._status() === 'loading');

  constructor(
    private readonly query: Query<DocumentData>,
    private readonly map: Mapper<T>,
    enabled: Signal<boolean>,
  ) {
    effect(() => {
      const active = enabled();
      untracked(() => (active ? this.connect() : this.reset()));
    });
  }

  /** (Re)inicia a escuta. Usado também pelo botão "Tentar novamente". */
  connect(): void {
    this.disconnect();
    this._status.set('loading');
    this._error.set(null);
    this.unsubscribe = onSnapshot(this.query, {
      next: (snapshot) => {
        this._items.set(
          snapshot.docs.map((doc: QueryDocumentSnapshot) => this.map(doc.id, doc.data())),
        );
        this._status.set('ready');
      },
      error: (error) => {
        console.error('[Firestore] Falha ao carregar dados', error);
        this._error.set(error);
        this._status.set('error');
      },
    });
  }

  disconnect(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  /** Encerra a escuta e descarta os dados (ex.: ao sair do sistema). */
  private reset(): void {
    this.disconnect();
    this._items.set([]);
    this._status.set('loading');
    this._error.set(null);
  }
}

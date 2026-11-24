/** Converte para minúsculas e remove acentos, para buscas tolerantes. */
export function normalizeText(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Verifica se todos os termos digitados aparecem em algum dos campos informados.
 * Ex.: "joao 123" encontra "João da Silva" com matrícula "1234".
 */
export function matchesSearch(term: string, ...fields: unknown[]): boolean {
  const tokens = normalizeText(term).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;
  const haystack = fields.map(normalizeText).join(' ');
  return tokens.every((token) => haystack.includes(token));
}

/** Remove espaços duplicados e das extremidades. */
export function collapseSpaces(value: unknown): string {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Comparação alfabética em português, sem diferenciar maiúsculas/acentos e com números naturais. */
export function compareText(a: string, b: string): number {
  return a.localeCompare(b, 'pt-BR', { sensitivity: 'base', numeric: true });
}

const NAME_PARTICLES = new Set(['da', 'das', 'de', 'do', 'dos', 'e']);

/** Iniciais para avatar: "Maria da Silva" -> "MS". */
export function initials(name: string): string {
  const parts = collapseSpaces(name)
    .split(' ')
    .filter((part) => part && !NAME_PARTICLES.has(part.toLowerCase()));
  if (parts.length === 0) return '?';
  const first = parts[0].charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
  return (first + last).toLocaleUpperCase('pt-BR');
}

/** Primeiro nome com capitalização adequada: "MARIA DA SILVA" -> "Maria". */
export function firstName(name: string): string {
  const first = collapseSpaces(name).split(' ')[0] ?? '';
  if (!first) return '';
  return first.charAt(0).toLocaleUpperCase('pt-BR') + first.slice(1).toLocaleLowerCase('pt-BR');
}

/** Lista de valores distintos (ignorando vazios), em ordem alfabética. */
export function distinctSorted(values: Iterable<string>): string[] {
  const byKey = new Map<string, string>();
  for (const raw of values) {
    const value = collapseSpaces(raw);
    if (!value) continue;
    const key = normalizeText(value);
    if (!byKey.has(key)) byKey.set(key, value);
  }
  return [...byKey.values()].sort(compareText);
}

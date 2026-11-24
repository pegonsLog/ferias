export type NavAction = 'add-vacation';

export interface NavItem {
  readonly label: string;
  readonly icon: string;
  /** Rota de destino. Itens sem rota executam uma ação (ex.: abrir um formulário). */
  readonly route?: string;
  readonly action?: NavAction;
}

export interface NavSection {
  readonly title: string;
  readonly items: readonly NavItem[];
}

/** Menu lateral, com as mesmas seções da versão anterior. */
export const NAVIGATION: readonly NavSection[] = [
  {
    title: 'Geral',
    items: [{ label: 'Início', icon: 'space_dashboard', route: '/inicio' }],
  },
  {
    title: 'Inclusão',
    items: [{ label: 'Adicionar férias', icon: 'beach_access', action: 'add-vacation' }],
  },
  {
    title: 'Consultas',
    items: [
      { label: 'Férias do funcionário', icon: 'person_search', route: '/ferias/funcionario' },
      { label: 'Férias do mês', icon: 'date_range', route: '/ferias/mes' },
      { label: 'Férias do ano', icon: 'calendar_month', route: '/ferias/ano' },
    ],
  },
  {
    title: 'Impressão',
    items: [{ label: 'Lista mensal', icon: 'print', route: '/relatorios/lista-mensal' }],
  },
  {
    title: 'Manutenção',
    items: [
      { label: 'Funcionários', icon: 'groups', route: '/funcionarios' },
      { label: 'Usuários', icon: 'manage_accounts', route: '/usuarios' },
    ],
  },
];

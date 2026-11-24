# Controle de Férias · GARBO

Aplicação web para registrar e consultar as férias dos funcionários.

## Funcionalidades

| Menu                  | O que faz                                                                                                                     |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Início                | Saudação, indicadores do dia (em férias hoje, início no mês, próximos 30 dias) e atalhos.                                     |
| Adicionar férias      | Formulário em janela (modal) com cálculo automático de dias e bloqueio de períodos sobrepostos para o mesmo funcionário.      |
| Férias do funcionário | Histórico completo de um funcionário, inclusive de matrículas que não estão mais cadastradas.                                 |
| Férias do mês / ano   | Férias com início no mês ou no ano escolhido, com totais de registros e de dias.                                              |
| Lista mensal          | Relação do mês formatada para impressão (botão **Imprimir** ou Ctrl+P).                                                       |
| Funcionários          | Cadastro com busca, ordenação e paginação. Alterar matrícula, nome, cargo ou admissão atualiza também as férias já gravadas. |
| Usuários              | Acessos ao sistema. As senhas não aparecem na tela; senhas novas ou alteradas são gravadas com hash.                          |

Todas as listas são atualizadas em tempo real e os filtros ficam no endereço da página
(ex.: `/ferias/mes?mes=8&ano=2023`), o que permite voltar, favoritar e compartilhar consultas.

## Tecnologias

- [Angular 21](https://angular.dev) com componentes standalone, signals e detecção de mudanças sem zone.js
- [Angular Material 3](https://material.angular.dev) (tema próprio, em português)
- [Firebase](https://firebase.google.com/docs/web/setup) (Firestore e Hosting)
- [date-fns](https://date-fns.org) para os campos de data
- [Vitest](https://vitest.dev) para os testes unitários

## Requisitos

- Node.js 20.19+, 22.12+ ou 24+ (com o npm que acompanha o Node.js)

## Comandos

```bash
npm install      # instala as dependências
npm start        # servidor local em http://localhost:4200
npm test         # testes unitários
npm run build    # build de produção em dist/ferias/browser
npm run format   # formata o código com o Prettier
npm run deploy   # build + publicação no Firebase Hosting (requer `npx firebase login`)
```

> O ambiente de desenvolvimento usa o **mesmo projeto Firebase de produção**
> (`src/environments`). Alterações feitas durante os testes locais afetam os dados reais.

## Estrutura

```
src/
├── app/
│   ├── core/        # infraestrutura: Firebase, repositórios, sessão, layout e configuração
│   ├── domain/      # regras de negócio puras (datas, férias, busca e ordenação) + testes
│   ├── features/    # telas: login, início, férias, lista mensal, funcionários e usuários
│   └── shared/ui/   # componentes reutilizáveis: confirmação, mensagens, cabeçalho, estado vazio
├── styles/          # tema Material, estilos base, utilitários e regras de impressão
└── environments/    # configuração do Firebase
```

## Dados (Firestore)

As coleções e os nomes de campos são os mesmos da versão anterior, então os dados existentes
continuam funcionando sem migração.

| Coleção     | Campos principais                                                                                                                                                    |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `users`     | `username`, `name`, `gender`, `password`                                                                                                                             |
| `employees` | `registration`, `name`, `office`, `shift`, `admission`, `admission2`                                                                                                 |
| `vacations` | `registration`, `name`, `office`, `admission`, `startVacation`, `endVacation`, `days`, `limit`, `purchasing`, `period`, `intprop`, `sell`, `observation` |

As datas continuam gravadas como texto `dd/MM/aaaa`. Na leitura também são aceitas variações
antigas (`1/8/23`, por exemplo).

## Segurança

- Senhas novas ou alteradas são gravadas com PBKDF2-SHA256. Senhas antigas, em texto puro,
  continuam aceitas no login e passam a ter hash quando forem redefinidas na tela de usuários.
- O login é próprio do sistema (coleção `users`), sem Firebase Authentication. Por isso as
  regras do Firestore precisam permitir acesso sem autenticação, e quem tiver a configuração do
  projeto consegue ler os dados diretamente. Para proteger os dados de verdade, o próximo passo
  recomendado é migrar o login para o Firebase Authentication e restringir as regras do Firestore.

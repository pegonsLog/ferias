import { FirebaseError } from 'firebase/app';

/** Erro com mensagem pronta para ser exibida ao usuário. */
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppError';
  }
}

/** Traduz erros em mensagens claras para o usuário. */
export function describeError(error: unknown, fallback = 'Ocorreu um erro inesperado.'): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'permission-denied':
        return 'Você não tem permissão para realizar esta operação.';
      case 'unavailable':
      case 'deadline-exceeded':
        return 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';
      case 'not-found':
        return 'O registro não foi encontrado. Ele pode ter sido excluído por outro usuário.';
      case 'resource-exhausted':
        return 'Limite de uso do banco de dados atingido. Tente novamente mais tarde.';
      default:
        return `${fallback} (${error.code})`;
    }
  }
  return fallback;
}

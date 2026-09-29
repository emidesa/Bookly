import { ApiError } from '../services/api';

// Message à afficher : celui du backend si c'est une erreur de l'API, sinon le message par défaut
export function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  return defaultMessage;
}

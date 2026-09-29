import { requireEnv } from "./env";

// Secret de signature des tokens (jamais envoyé au client)
export const JWT_SECRET = requireEnv("JWT_SECRET");

// Durée de validité d'un token
export const JWT_EXPIRES_IN = "7d";

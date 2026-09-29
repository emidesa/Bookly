import "dotenv/config";

// Lit une variable d'environnement obligatoire, sinon arrête le serveur
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variable d'environnement manquante : ${name}`);
  }
  return value;
}

import "dotenv/config";
import mysql from "mysql2/promise";

// Lit une variable d'environnement obligatoire, sinon arrête le serveur
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variable d'environnement manquante : ${name}`);
  }
  return value;
}

// Pool de connexions MySQL partagé par tous les models
const pool = mysql.createPool({
  host: requireEnv("DB_HOST"),
  port: Number(process.env.DB_PORT ?? 3306),
  user: requireEnv("DB_USER"),
  password: process.env.DB_PASSWORD ?? "", // peut être vide en local (XAMPP, WAMP)
  database: requireEnv("DB_NAME"),
  waitForConnections: true,
  connectionLimit: 10,
});

export default pool;

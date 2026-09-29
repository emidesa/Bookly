import mysql from "mysql2/promise";
import { requireEnv } from "./env";

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

import app from "./app";
import pool from "./config/database";

const PORT = Number(process.env.PORT ?? 3000);

// Vérifie la connexion MySQL avant de lancer le serveur
async function start(): Promise<void> {
  try {
    await pool.query("SELECT 1");
    console.log("Connexion MySQL OK");
  } catch (error) {
    console.error("Impossible de se connecter à MySQL :", error);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`API Bookly lancée sur http://localhost:${PORT}`);
  });
}

start();

import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());

// Route de test : vérifie que l'API répond
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Routes de l'API (branchées au fur et à mesure)
app.use("/auth", authRoutes);

// Route inconnue
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Route introuvable" });
});

// Gestion globale des erreurs (Express 5 y envoie aussi les erreurs async)
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  // Body JSON mal formé : erreur du client, pas du serveur
  if (typeof err === "object" && err !== null && "type" in err && err.type === "entity.parse.failed") {
    res.status(400).json({ message: "JSON invalide" });
    return;
  }
  console.error(err);
  res.status(500).json({ message: "Erreur serveur" });
});

export default app;

import express from "express";
import cors from "cors";

const app = express();

// Middlewares globales
app.use(cors());

app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({
    message: "API del Sistema de Gestión de Incidencias e Inventario funcionando correctamente"
  });
});

export default app;
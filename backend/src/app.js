import express from "express";
import cors from "cors";

import empresaRoutes from "./routes/empresa.routes.js";
import departamentoRoutes from "./routes/departamento.routes.js";
import areaRoutes from "./routes/area.routes.js";
import empleadoRoutes from "./routes/empleado.routes.js";

const app = express();

// ==============================
// Middlewares globales
// ==============================

app.use(cors());
app.use(express.json());

// ==============================
// Ruta principal
// ==============================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "API del Sistema de Gestión de Incidencias e Inventario funcionando correctamente",
  });
});

// ==============================
// Rutas de la API
// ==============================

app.use("/api/v1/empresas", empresaRoutes);
app.use("/api/v1/departamentos",departamentoRoutes);
app.use("/api/v1/areas", areaRoutes);
app.use("/api/v1/empleados", empleadoRoutes);

// ==============================
// Middleware para rutas inexistentes
// ==============================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
  });
});

// ==============================
// Middleware global de errores
// ==============================

app.use((error, req, res, next) => {
  console.error(error);

  // Error de validación de Mongoose
  if (error.name === "ValidationError") {
    const errores = Object.values(error.errors).map(
      (err) => err.message
    );

    return res.status(400).json({
      success: false,
      message: "Error de validación",
      errors: errores,
    });
  }

  // Campo unique duplicado de MongoDB
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Ya existe un registro con esos datos únicos",
    });
  }

  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Error interno del servidor",
  });
});

export default app;
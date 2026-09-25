import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes.js";
import usuarioRoutes from "./routes/usuario.routes.js";

import empresaRoutes from "./routes/empresa.routes.js";
import departamentoRoutes from "./routes/departamento.routes.js";
import areaRoutes from "./routes/area.routes.js";
import empleadoRoutes from "./routes/empleado.routes.js";

import grupoRecursoRoutes from "./routes/grupoRecurso.routes.js";
import categoriaRecursoRoutes from "./routes/categoriaRecurso.routes.js";
import recursoRoutes from "./routes/recurso.routes.js";

import proveedorRoutes from "./routes/proveedor.routes.js";
import mantenimientoRoutes from "./routes/mantenimiento.routes.js";

import categoriaAjusteRoutes from "./routes/categoriaAjuste.routes.js";
import ajusteInventarioRoutes from "./routes/ajusteInventario.routes.js";

const app = express();

app.set("trust proxy", 1);

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Demasiadas solicitudes de autenticación. Intente nuevamente más tarde",
  },
});

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message:
      "API del Sistema de Gestión de Incidencias e Inventario funcionando correctamente",
  });
});

app.use(
  "/api/v1/auth",
  authLimiter,
  authRoutes
);

app.use(
  "/api/v1/usuarios",
  usuarioRoutes
);

app.use(
  "/api/v1/empresas",
  empresaRoutes
);

app.use(
  "/api/v1/departamentos",
  departamentoRoutes
);

app.use(
  "/api/v1/areas",
  areaRoutes
);

app.use(
  "/api/v1/empleados",
  empleadoRoutes
);

app.use(
  "/api/v1/grupos-recursos",
  grupoRecursoRoutes
);

app.use(
  "/api/v1/categorias-recursos",
  categoriaRecursoRoutes
);

app.use(
  "/api/v1/recursos",
  recursoRoutes
);

app.use(
  "/api/v1/proveedores",
  proveedorRoutes
);

app.use(
  "/api/v1/mantenimientos",
  mantenimientoRoutes
);

app.use(
  "/api/v1/categorias-ajustes",
  categoriaAjusteRoutes
);

app.use(
  "/api/v1/ajustes-inventario",
  ajusteInventarioRoutes
);

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  if (error.name === "ValidationError") {
    const errores = Object.values(
      error.errors
    ).map((err) => err.message);

    return res.status(400).json({
      success: false,
      message: "Error de validación",
      errors: errores,
    });
  }

  if (error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message:
        "El identificador proporcionado no es válido",
    });
  }

  if (error.code === 11000) {
    const campo = Object.keys(
      error.keyValue || {}
    )[0];

    return res.status(409).json({
      success: false,
      message: campo
        ? `Ya existe un registro con el valor indicado para ${campo}`
        : "Ya existe un registro con esos datos únicos",
    });
  }

  if (
    error.name === "JsonWebTokenError" ||
    error.name === "TokenExpiredError"
  ) {
    return res.status(401).json({
      success: false,
      message: "Token inválido o expirado",
    });
  }

  return res.status(
    error.statusCode || 500
  ).json({
    success: false,
    message:
      error.message ||
      "Error interno del servidor",
  });
});

export default app;
import express from "express";

import {
  getEmpleados,
  getEmpleadoById,
  createEmpleado,
  updateEmpleado,
  deleteEmpleado,
  getEmpleadosByArea,
  assignRecurso,
} from "../controllers/empleado.controller.js";

import { autenticar } from "../middlewares/auth.middleware.js";
import { autorizarRoles } from "../middlewares/roles.middleware.js";

const router = express.Router();

router.use(autenticar);

router.get("/", getEmpleados);

router.get(
  "/area/:areaId",
  getEmpleadosByArea
);

router.get("/:id", getEmpleadoById);

router.post(
  "/",
  autorizarRoles("administrador"),
  createEmpleado
);

router.post(
  "/:id/asignaciones",
  autorizarRoles("administrador"),
  assignRecurso
);

router.put(
  "/:id",
  autorizarRoles("administrador"),
  updateEmpleado
);

router.delete(
  "/:id",
  autorizarRoles("administrador"),
  deleteEmpleado
);

export default router;
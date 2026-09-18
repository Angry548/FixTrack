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

const router = express.Router();

// Obtener todos
router.get("/", getEmpleados);

// Obtener empleados de un área
router.get("/area/:areaId", getEmpleadosByArea);

// Obtener empleado por ID
router.get("/:id", getEmpleadoById);

// Crear empleado
router.post("/", createEmpleado);

// Asignar recurso
router.post("/:id/asignaciones", assignRecurso);

// Actualizar empleado
router.put("/:id", updateEmpleado);

// Eliminar empleado
router.delete("/:id", deleteEmpleado);

export default router;
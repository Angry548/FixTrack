import express from "express";

import {
  getAreas,
  getAreaById,
  createArea,
  updateArea,
  deleteArea,
  getAreasByDepartamento,
} from "../controllers/area.controller.js";

const router = express.Router();

// Obtener todas las áreas
router.get("/", getAreas);

// Obtener áreas pertenecientes a un departamento
router.get(
  "/departamento/:departamentoId",
  getAreasByDepartamento
);

// Obtener área por ID
router.get("/:id", getAreaById);

// Crear área
router.post("/", createArea);

// Actualizar área
router.put("/:id", updateArea);

// Eliminar área
router.delete("/:id", deleteArea);

export default router;
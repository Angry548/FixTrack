import express from "express";

import {
  getDepartamentos,
  getDepartamentoById,
  createDepartamento,
  updateDepartamento,
  deleteDepartamento,
  getDepartamentosByEmpresa,
} from "../controllers/departamento.controller.js";

const router = express.Router();

// Obtener todos
router.get("/", getDepartamentos);

// Obtener departamentos pertenecientes a una empresa
router.get(
  "/empresa/:empresaId",
  getDepartamentosByEmpresa
);

// Obtener uno por ID
router.get("/:id", getDepartamentoById);

// Crear
router.post("/", createDepartamento);

// Actualizar
router.put("/:id", updateDepartamento);

// Eliminar
router.delete("/:id", deleteDepartamento);

export default router;
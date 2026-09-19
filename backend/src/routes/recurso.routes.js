import express from "express";

import {
  getRecurso,
  getRecursoById,
  createRecurso,
  updateRecurso,
  deleteRecurso,
} from "../controllers/recurso.controller.js";

const router = express.Router();

// GET - Obtener todos los recursos
router.get("/", getRecurso);

// GET - Obtener recurso por ID
router.get("/:id", getRecursoById);

// POST - Crear recurso
router.post("/", createRecurso);

// PUT - Actualizar recurso
router.put("/:id", updateRecurso);

// DELETE - Eliminar recurso
router.delete("/:id", deleteRecurso);

export default router;
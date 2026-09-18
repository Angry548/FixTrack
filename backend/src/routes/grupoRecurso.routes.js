import express from "express";

import {
  getGrupoRecurso,
  getGrupoRecursoById,
  createGrupoRecurso,
  updateGrupoRecurso,
  deleteGrupoRecurso,
} from "../controllers/grupoRecurso.controller.js";

const router = express.Router();

// GET - Obtener todos los grupos de recursos
router.get("/", getGrupoRecurso);

// GET - Obtener grupo de recurso por ID
router.get("/:id", getGrupoRecursoById);

// POST - Crear grupo de recurso
router.post("/", createGrupoRecurso);

// PUT - Actualizar grupo de recurso
router.put("/:id", updateGrupoRecurso);

// DELETE - Eliminar grupo de recurso
router.delete("/:id", deleteGrupoRecurso);

export default router;
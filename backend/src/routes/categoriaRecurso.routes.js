import express from "express";

import {
  getCategoriaRecurso,
  getCategoriaRecursoById,
  createCategoriaRecurso,
  updateCategoriaRecurso,
  deleteCategoriaRecurso,
} from "../controllers/categoriaRecurso.controller.js";

const router = express.Router();

// GET - Obtener todas las categorías de recursos
router.get("/", getCategoriaRecurso);

// GET - Obtener categoría de recurso por ID
router.get("/:id", getCategoriaRecursoById);

// POST - Crear categoría de recurso
router.post("/", createCategoriaRecurso);

// PUT - Actualizar categoría de recurso
router.put("/:id", updateCategoriaRecurso);

// DELETE - Eliminar categoría de recurso
router.delete("/:id", deleteCategoriaRecurso);

export default router;
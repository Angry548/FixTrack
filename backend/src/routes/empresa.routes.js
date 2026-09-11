import express from "express";

import {
  getEmpresas,
  getEmpresaById,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
} from "../controllers/empresa.controller.js";

const router = express.Router();

// GET - Obtener todas las empresas
router.get("/", getEmpresas);

// GET - Obtener empresa por ID
router.get("/:id", getEmpresaById);

// POST - Crear empresa
router.post("/", createEmpresa);

// PUT - Actualizar empresa
router.put("/:id", updateEmpresa);

// DELETE - Eliminar empresa
router.delete("/:id", deleteEmpresa);

export default router;
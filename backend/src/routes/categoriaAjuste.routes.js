import express from "express";

import {
  getCategoriasAjuste,
  getCategoriaAjusteById,
  createCategoriaAjuste,
  updateCategoriaAjuste,
  deleteCategoriaAjuste,
  changeEstadoCategoriaAjuste,
} from "../controllers/categoriaAjuste.controller.js";

const router = express.Router();

router.get("/", getCategoriasAjuste);

router.get("/:id", getCategoriaAjusteById);

router.post("/", createCategoriaAjuste);

router.put("/:id", updateCategoriaAjuste);

router.patch(
  "/:id/estado",
  changeEstadoCategoriaAjuste
);

router.delete("/:id", deleteCategoriaAjuste);

export default router;
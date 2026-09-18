import express from "express";

import {
  getAjustesInventario,
  getAjusteInventarioById,
  createAjusteInventario,
  updateAjusteInventario,
  deleteAjusteInventario,
  getAjustesByCategoria,
} from "../controllers/ajusteInventario.controller.js";

const router = express.Router();

router.get("/", getAjustesInventario);

router.get(
  "/categoria/:categoriaAjusteId",
  getAjustesByCategoria
);

router.get("/:id", getAjusteInventarioById);

router.post("/", createAjusteInventario);

router.put("/:id", updateAjusteInventario);

router.delete("/:id", deleteAjusteInventario);

export default router;
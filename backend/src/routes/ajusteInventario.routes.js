import express from "express";

import {
  getAjustesInventario,
  getAjusteInventarioById,
  createAjusteInventario,
  updateAjusteInventario,
  deleteAjusteInventario,
  getAjustesByCategoria,
} from "../controllers/ajusteInventario.controller.js";

import { autenticar } from "../middlewares/auth.middleware.js";
import { autorizarRoles } from "../middlewares/roles.middleware.js";

const router = express.Router();

router.use(autenticar);

router.get("/", getAjustesInventario);

router.get(
  "/categoria/:categoriaAjusteId",
  getAjustesByCategoria
);

router.get("/:id", getAjusteInventarioById);

router.post(
  "/",
  autorizarRoles("administrador", "inventario"),
  createAjusteInventario
);

router.put(
  "/:id",
  autorizarRoles("administrador", "inventario"),
  updateAjusteInventario
);

router.delete(
  "/:id",
  autorizarRoles("administrador", "inventario"),
  deleteAjusteInventario
);

export default router;
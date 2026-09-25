import express from "express";

import {
  getCategoriasAjuste,
  getCategoriaAjusteById,
  createCategoriaAjuste,
  updateCategoriaAjuste,
  deleteCategoriaAjuste,
  changeEstadoCategoriaAjuste,
} from "../controllers/categoriaAjuste.controller.js";

import { autenticar } from "../middlewares/auth.middleware.js";
import { autorizarRoles } from "../middlewares/roles.middleware.js";

const router = express.Router();

router.use(autenticar);

router.get("/", getCategoriasAjuste);

router.get("/:id", getCategoriaAjusteById);

router.post(
  "/",
  autorizarRoles("administrador", "inventario"),
  createCategoriaAjuste
);

router.put(
  "/:id",
  autorizarRoles("administrador", "inventario"),
  updateCategoriaAjuste
);

router.patch(
  "/:id/estado",
  autorizarRoles("administrador", "inventario"),
  changeEstadoCategoriaAjuste
);

router.delete(
  "/:id",
  autorizarRoles("administrador", "inventario"),
  deleteCategoriaAjuste
);

export default router;
import express from "express";

import {
  getCategoriaRecurso,
  getCategoriaRecursoById,
  createCategoriaRecurso,
  updateCategoriaRecurso,
  deleteCategoriaRecurso,
} from "../controllers/categoriaRecurso.controller.js";

import { autenticar } from "../middlewares/auth.middleware.js";
import { autorizarRoles } from "../middlewares/roles.middleware.js";

const router = express.Router();

router.use(autenticar);

router.get("/", getCategoriaRecurso);

router.get("/:id", getCategoriaRecursoById);

router.post(
  "/",
  autorizarRoles("administrador", "inventario"),
  createCategoriaRecurso
);

router.put(
  "/:id",
  autorizarRoles("administrador", "inventario"),
  updateCategoriaRecurso
);

router.delete(
  "/:id",
  autorizarRoles("administrador", "inventario"),
  deleteCategoriaRecurso
);

export default router;
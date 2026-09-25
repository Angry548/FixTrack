import express from "express";

import {
  getGrupoRecurso,
  getGrupoRecursoById,
  createGrupoRecurso,
  updateGrupoRecurso,
  deleteGrupoRecurso,
} from "../controllers/grupoRecurso.controller.js";

import { autenticar } from "../middlewares/auth.middleware.js";
import { autorizarRoles } from "../middlewares/roles.middleware.js";

const router = express.Router();

router.use(autenticar);

router.get("/", getGrupoRecurso);

router.get("/:id", getGrupoRecursoById);

router.post(
  "/",
  autorizarRoles("administrador", "inventario"),
  createGrupoRecurso
);

router.put(
  "/:id",
  autorizarRoles("administrador", "inventario"),
  updateGrupoRecurso
);

router.delete(
  "/:id",
  autorizarRoles("administrador", "inventario"),
  deleteGrupoRecurso
);

export default router;
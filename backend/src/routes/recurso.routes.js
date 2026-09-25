import express from "express";

import {
  getRecurso,
  getRecursoById,
  createRecurso,
  updateRecurso,
  deleteRecurso,
} from "../controllers/recurso.controller.js";

import { autenticar } from "../middlewares/auth.middleware.js";
import { autorizarRoles } from "../middlewares/roles.middleware.js";

const router = express.Router();

router.use(autenticar);

router.get("/", getRecurso);

router.get("/:id", getRecursoById);

router.post(
  "/",
  autorizarRoles("administrador", "inventario"),
  createRecurso
);

router.put(
  "/:id",
  autorizarRoles("administrador", "inventario"),
  updateRecurso
);

router.delete(
  "/:id",
  autorizarRoles("administrador", "inventario"),
  deleteRecurso
);

export default router;
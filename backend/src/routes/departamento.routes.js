import express from "express";

import {
  getDepartamentos,
  getDepartamentoById,
  createDepartamento,
  updateDepartamento,
  deleteDepartamento,
  getDepartamentosByEmpresa,
} from "../controllers/departamento.controller.js";

import { autenticar } from "../middlewares/auth.middleware.js";
import { autorizarRoles } from "../middlewares/roles.middleware.js";

const router = express.Router();

router.use(autenticar);

router.get("/", getDepartamentos);

router.get(
  "/empresa/:empresaId",
  getDepartamentosByEmpresa
);

router.get("/:id", getDepartamentoById);

router.post(
  "/",
  autorizarRoles("administrador"),
  createDepartamento
);

router.put(
  "/:id",
  autorizarRoles("administrador"),
  updateDepartamento
);

router.delete(
  "/:id",
  autorizarRoles("administrador"),
  deleteDepartamento
);

export default router;
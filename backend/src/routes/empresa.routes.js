import express from "express";

import {
  getEmpresas,
  getEmpresaById,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
} from "../controllers/empresa.controller.js";

import { autenticar } from "../middlewares/auth.middleware.js";
import { autorizarRoles } from "../middlewares/roles.middleware.js";

const router = express.Router();

router.use(autenticar);

router.get("/", getEmpresas);

router.get("/:id", getEmpresaById);

router.post(
  "/",
  autorizarRoles("administrador"),
  createEmpresa
);

router.put(
  "/:id",
  autorizarRoles("administrador"),
  updateEmpresa
);

router.delete(
  "/:id",
  autorizarRoles("administrador"),
  deleteEmpresa
);

export default router;
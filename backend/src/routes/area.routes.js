import express from "express";

import {
  getAreas,
  getAreaById,
  createArea,
  updateArea,
  deleteArea,
  getAreasByDepartamento,
} from "../controllers/area.controller.js";

import { autenticar } from "../middlewares/auth.middleware.js";
import { autorizarRoles } from "../middlewares/roles.middleware.js";

const router = express.Router();

router.use(autenticar);

router.get("/", getAreas);

router.get(
  "/departamento/:departamentoId",
  getAreasByDepartamento
);

router.get("/:id", getAreaById);

router.post(
  "/",
  autorizarRoles("administrador"),
  createArea
);

router.put(
  "/:id",
  autorizarRoles("administrador"),
  updateArea
);

router.delete(
  "/:id",
  autorizarRoles("administrador"),
  deleteArea
);

export default router;
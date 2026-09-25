import { Router } from "express";
import * as mantenimientoController from "../controllers/mantenimiento.controller.js";
import { autenticar } from "../middlewares/auth.middleware.js";
import { autorizarRoles } from "../middlewares/roles.middleware.js";

const router = Router();

router.use(autenticar);

router.get(
  "/",
  mantenimientoController.obtenerTodos
);

router.get(
  "/:id",
  mantenimientoController.obtenerPorId
);

router.post(
  "/",
  autorizarRoles("administrador", "tecnico"),
  mantenimientoController.crear
);

router.put(
  "/:id",
  autorizarRoles("administrador", "tecnico"),
  mantenimientoController.actualizar
);

router.delete(
  "/:id",
  autorizarRoles("administrador"),
  mantenimientoController.eliminar
);

export default router;
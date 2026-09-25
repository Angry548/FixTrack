import express from "express";
import * as usuarioController from "../controllers/usuario.controller.js";
import { autenticar } from "../middlewares/auth.middleware.js";
import { autorizarRoles } from "../middlewares/roles.middleware.js";

const router = express.Router();

router.use(
  autenticar,
  autorizarRoles("administrador")
);

router.get(
  "/",
  usuarioController.obtenerTodos
);

router.get(
  "/:id",
  usuarioController.obtenerPorId
);

router.post(
  "/",
  usuarioController.crear
);

router.put(
  "/:id",
  usuarioController.actualizar
);

router.patch(
  "/:id/estado",
  usuarioController.cambiarEstado
);

router.delete(
  "/:id",
  usuarioController.eliminar
);

export default router;
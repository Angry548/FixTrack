import { Router } from "express";
import * as proveedorController from "../controllers/proveedor.controller.js";
import { autenticar } from "../middlewares/auth.middleware.js";
import { autorizarRoles } from "../middlewares/roles.middleware.js";

const router = Router();

router.use(autenticar);

router.get("/", proveedorController.obtenerTodos);

router.get("/:id", proveedorController.obtenerPorId);

router.post(
  "/",
  autorizarRoles("administrador", "inventario"),
  proveedorController.crear
);

router.put(
  "/:id",
  autorizarRoles("administrador", "inventario"),
  proveedorController.actualizar
);

router.delete(
  "/:id",
  autorizarRoles("administrador", "inventario"),
  proveedorController.eliminar
);

export default router;
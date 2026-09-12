import { Router } from "express";
import * as proveedorController from "../controllers/proveedor.controller.js";

const router = Router();

// CRUD básico según la guía del proyecto
router.post("/", proveedorController.crear);
router.get("/", proveedorController.obtenerTodos);
router.get("/:id", proveedorController.obtenerPorId);
router.put("/:id", proveedorController.actualizar);
router.delete("/:id", proveedorController.eliminar);

export default router;

// NOTA IMPORTANTE:
// Angel será quien registre esta ruta en app.js, así:
// import proveedorRoutes from "./routes/proveedor.routes.js";
// app.use("/api/v1/proveedores", proveedorRoutes);
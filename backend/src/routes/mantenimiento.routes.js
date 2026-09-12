import { Router } from "express";
import * as mantenimientoController from "../controllers/mantenimiento.controller.js";

const router = Router();

// CRUD básico según la guía del proyecto
router.post("/", mantenimientoController.crear);
router.get("/", mantenimientoController.obtenerTodos);
router.get("/:id", mantenimientoController.obtenerPorId);
router.put("/:id", mantenimientoController.actualizar);
router.delete("/:id", mantenimientoController.eliminar);

export default router;

// NOTA IMPORTANTE:
// Angel será quien registre esta ruta en app.js, así:
// import mantenimientoRoutes from "./routes/mantenimiento.routes.js";
// app.use("/api/v1/mantenimientos", mantenimientoRoutes);
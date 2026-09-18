import * as mantenimientoService from "../services/mantenimiento.service.js";

// El Controller NO debe hacer consultas directas a MongoDB.
// Solo recibe req, extrae datos y llama al Service.

export const crear = async (req, res, next) => {
  try {
    const mantenimiento = await mantenimientoService.crearMantenimiento(
      req.body
    );
    res.status(201).json(mantenimiento);
  } catch (error) {
    next(error);
  }
};

export const obtenerTodos = async (req, res, next) => {
  try {
    const mantenimientos = await mantenimientoService.obtenerMantenimientos();
    res.status(200).json(mantenimientos);
  } catch (error) {
    next(error);
  }
};

export const obtenerPorId = async (req, res, next) => {
  try {
    const mantenimiento = await mantenimientoService.obtenerMantenimientoPorId(
      req.params.id
    );

    if (!mantenimiento) {
      return res.status(404).json({ mensaje: "Mantenimiento no encontrado" });
    }

    res.status(200).json(mantenimiento);
  } catch (error) {
    next(error);
  }
};

export const actualizar = async (req, res, next) => {
  try {
    const mantenimiento = await mantenimientoService.actualizarMantenimiento(
      req.params.id,
      req.body
    );

    if (!mantenimiento) {
      return res.status(404).json({ mensaje: "Mantenimiento no encontrado" });
    }

    res.status(200).json(mantenimiento);
  } catch (error) {
    next(error);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    const mantenimiento = await mantenimientoService.eliminarMantenimiento(
      req.params.id
    );

    if (!mantenimiento) {
      return res.status(404).json({ mensaje: "Mantenimiento no encontrado" });
    }

    res.status(200).json({ mensaje: "Mantenimiento eliminado correctamente" });
  } catch (error) {
    next(error);
  }
};
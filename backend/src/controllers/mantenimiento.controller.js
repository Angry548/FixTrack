import * as mantenimientoService from "../services/mantenimiento.service.js";

export const crear = async (req, res, next) => {
  try {
    const mantenimiento = await mantenimientoService.crearMantenimiento(
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Mantenimiento creado correctamente",
      data: mantenimiento,
    });
  } catch (error) {
    next(error);
  }
};

export const obtenerTodos = async (req, res, next) => {
  try {
    const mantenimientos = await mantenimientoService.obtenerMantenimientos();

    return res.status(200).json({
      success: true,
      message: "Mantenimientos obtenidos correctamente",
      count: mantenimientos.length,
      data: mantenimientos,
    });
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
      return res.status(404).json({
        success: false,
        message: "Mantenimiento no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Mantenimiento obtenido correctamente",
      data: mantenimiento,
    });
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
      return res.status(404).json({
        success: false,
        message: "Mantenimiento no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Mantenimiento actualizado correctamente",
      data: mantenimiento,
    });
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
      return res.status(404).json({
        success: false,
        message: "Mantenimiento no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Mantenimiento eliminado correctamente",
      data: mantenimiento,
    });
  } catch (error) {
    next(error);
  }
};
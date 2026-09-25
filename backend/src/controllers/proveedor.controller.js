import * as proveedorService from "../services/proveedor.service.js";

export const crear = async (req, res, next) => {
  try {
    const proveedor = await proveedorService.crearProveedor(req.body);

    return res.status(201).json({
      success: true,
      message: "Proveedor creado correctamente",
      data: proveedor,
    });
  } catch (error) {
    next(error);
  }
};

export const obtenerTodos = async (req, res, next) => {
  try {
    const proveedores = await proveedorService.obtenerProveedores();

    return res.status(200).json({
      success: true,
      message: "Proveedores obtenidos correctamente",
      count: proveedores.length,
      data: proveedores,
    });
  } catch (error) {
    next(error);
  }
};

export const obtenerPorId = async (req, res, next) => {
  try {
    const proveedor = await proveedorService.obtenerProveedorPorId(
      req.params.id
    );

    if (!proveedor) {
      return res.status(404).json({
        success: false,
        message: "Proveedor no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Proveedor obtenido correctamente",
      data: proveedor,
    });
  } catch (error) {
    next(error);
  }
};

export const actualizar = async (req, res, next) => {
  try {
    const proveedor = await proveedorService.actualizarProveedor(
      req.params.id,
      req.body
    );

    if (!proveedor) {
      return res.status(404).json({
        success: false,
        message: "Proveedor no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Proveedor actualizado correctamente",
      data: proveedor,
    });
  } catch (error) {
    next(error);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    const proveedor = await proveedorService.eliminarProveedor(
      req.params.id
    );

    if (!proveedor) {
      return res.status(404).json({
        success: false,
        message: "Proveedor no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Proveedor eliminado correctamente",
      data: proveedor,
    });
  } catch (error) {
    next(error);
  }
};
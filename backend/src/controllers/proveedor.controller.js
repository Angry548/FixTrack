import * as proveedorService from "../services/proveedor.service.js";

// El Controller NO debe hacer consultas directas a MongoDB.
// Solo recibe req, extrae datos y llama al Service.

export const crear = async (req, res, next) => {
  try {
    const proveedor = await proveedorService.crearProveedor(req.body);
    res.status(201).json(proveedor);
  } catch (error) {
    next(error);
  }
};

export const obtenerTodos = async (req, res, next) => {
  try {
    const proveedores = await proveedorService.obtenerProveedores();
    res.status(200).json(proveedores);
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
      return res.status(404).json({ mensaje: "Proveedor no encontrado" });
    }

    res.status(200).json(proveedor);
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
      return res.status(404).json({ mensaje: "Proveedor no encontrado" });
    }

    res.status(200).json(proveedor);
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
      return res.status(404).json({ mensaje: "Proveedor no encontrado" });
    }

    res.status(200).json({ mensaje: "Proveedor eliminado correctamente" });
  } catch (error) {
    next(error);
  }
};
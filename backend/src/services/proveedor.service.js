import Proveedor from "../models/proveedor.model.js";

// El Service NO debe usar req, res ni Express.
// Solo trabaja con datos y modelos.

export const crearProveedor = async (data) => {
  const nuevoProveedor = new Proveedor(data);
  return await nuevoProveedor.save();
};

export const obtenerProveedores = async () => {
  return await Proveedor.find();
};

export const obtenerProveedorPorId = async (id) => {
  return await Proveedor.findById(id);
};

export const actualizarProveedor = async (id, data) => {
  return await Proveedor.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

export const eliminarProveedor = async (id) => {
  return await Proveedor.findByIdAndDelete(id);
};
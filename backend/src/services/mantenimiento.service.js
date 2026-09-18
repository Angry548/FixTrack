import Mantenimiento from "../models/mantenimiento.model.js";

// El Service NO debe usar req, res ni Express.
// Solo trabaja con datos y modelos.

const CAMPOS_POPULATE = ["recursoId", "empleadoReportaId", "proveedorId"];

export const crearMantenimiento = async (data) => {
  const nuevoMantenimiento = new Mantenimiento(data);
  const guardado = await nuevoMantenimiento.save();
  return guardado.populate(CAMPOS_POPULATE);
};

export const obtenerMantenimientos = async () => {
  return await Mantenimiento.find().populate(CAMPOS_POPULATE);
};

export const obtenerMantenimientoPorId = async (id) => {
  return await Mantenimiento.findById(id).populate(CAMPOS_POPULATE);
};

export const actualizarMantenimiento = async (id, data) => {
  return await Mantenimiento.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate(CAMPOS_POPULATE);
};

export const eliminarMantenimiento = async (id) => {
  return await Mantenimiento.findByIdAndDelete(id);
};
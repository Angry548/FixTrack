import mongoose from "mongoose";
import Mantenimiento from "../models/mantenimiento.model.js";
import Recurso from "../models/recurso.model.js";
import Empleado from "../models/empleado.model.js";

export const crearMantenimiento = async (data) => {
  const { recursoId, empleadoReportaId } = data;

  if (!mongoose.Types.ObjectId.isValid(recursoId)) {
    const error = new Error("El ID del recurso no es válido");
    error.statusCode = 400;
    throw error;
  }

  if (!mongoose.Types.ObjectId.isValid(empleadoReportaId)) {
    const error = new Error("El ID del empleado no es válido");
    error.statusCode = 400;
    throw error;
  }

  const recursoExiste = await Recurso.findById(recursoId);

  if (!recursoExiste) {
    const error = new Error("El recurso indicado no existe");
    error.statusCode = 404;
    throw error;
  }

  const empleadoExiste = await Empleado.findById(empleadoReportaId);

  if (!empleadoExiste) {
    const error = new Error("El empleado indicado no existe");
    error.statusCode = 404;
    throw error;
  }

  const nuevoMantenimiento = new Mantenimiento(data);

  const guardado = await nuevoMantenimiento.save();

  return await Mantenimiento.findById(guardado._id)
    .populate("recursoId")
    .populate("empleadoReportaId");
};

export const obtenerMantenimientos = async () => {
  return await Mantenimiento.find()
    .populate("recursoId")
    .populate("empleadoReportaId")
    .sort({ createdAt: -1 });
};

export const obtenerMantenimientoPorId = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("El ID del mantenimiento no es válido");
    error.statusCode = 400;
    throw error;
  }

  return await Mantenimiento.findById(id)
    .populate("recursoId")
    .populate("empleadoReportaId");
};

export const actualizarMantenimiento = async (id, data) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("El ID del mantenimiento no es válido");
    error.statusCode = 400;
    throw error;
  }

  if (data.recursoId) {
    if (!mongoose.Types.ObjectId.isValid(data.recursoId)) {
      const error = new Error("El ID del recurso no es válido");
      error.statusCode = 400;
      throw error;
    }

    const recursoExiste = await Recurso.findById(data.recursoId);

    if (!recursoExiste) {
      const error = new Error("El recurso indicado no existe");
      error.statusCode = 404;
      throw error;
    }
  }

  if (data.empleadoReportaId) {
    if (!mongoose.Types.ObjectId.isValid(data.empleadoReportaId)) {
      const error = new Error("El ID del empleado no es válido");
      error.statusCode = 400;
      throw error;
    }

    const empleadoExiste = await Empleado.findById(
      data.empleadoReportaId
    );

    if (!empleadoExiste) {
      const error = new Error("El empleado indicado no existe");
      error.statusCode = 404;
      throw error;
    }
  }

  return await Mantenimiento.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("recursoId")
    .populate("empleadoReportaId");
};

export const eliminarMantenimiento = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("El ID del mantenimiento no es válido");
    error.statusCode = 400;
    throw error;
  }

  return await Mantenimiento.findByIdAndDelete(id);
};
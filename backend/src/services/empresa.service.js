import mongoose from "mongoose";
import Empresa from "../models/empresa.model.js";

// Obtener todas las empresas
const obtenerTodas = async () => {
  return await Empresa.find().sort({ createdAt: -1 });
};

// Obtener empresa por ID
const obtenerPorId = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("El ID de la empresa no es válido");
    error.statusCode = 400;
    throw error;
  }

  const empresa = await Empresa.findById(id);

  if (!empresa) {
    const error = new Error("Empresa no encontrada");
    error.statusCode = 404;
    throw error;
  }

  return empresa;
};

// Crear empresa
const crear = async (datosEmpresa) => {
  const empresaExistente = await Empresa.findOne({
    nitORuc: datosEmpresa.nitORuc,
  });

  if (empresaExistente) {
    const error = new Error("Ya existe una empresa con ese NIT/RUC");
    error.statusCode = 409;
    throw error;
  }

  const nuevaEmpresa = new Empresa(datosEmpresa);

  return await nuevaEmpresa.save();
};

// Actualizar empresa
const actualizar = async (id, datosEmpresa) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("El ID de la empresa no es válido");
    error.statusCode = 400;
    throw error;
  }

  // Si se intenta cambiar el NIT/RUC, verificamos que no pertenezca a otra empresa
  if (datosEmpresa.nitORuc) {
    const empresaConMismoNit = await Empresa.findOne({
      nitORuc: datosEmpresa.nitORuc,
      _id: { $ne: id },
    });

    if (empresaConMismoNit) {
      const error = new Error("Ya existe otra empresa con ese NIT/RUC");
      error.statusCode = 409;
      throw error;
    }
  }

  const empresaActualizada = await Empresa.findByIdAndUpdate(
    id,
    datosEmpresa,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!empresaActualizada) {
    const error = new Error("Empresa no encontrada");
    error.statusCode = 404;
    throw error;
  }

  return empresaActualizada;
};

// Eliminar empresa
const eliminar = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("El ID de la empresa no es válido");
    error.statusCode = 400;
    throw error;
  }

  const empresaEliminada = await Empresa.findByIdAndDelete(id);

  if (!empresaEliminada) {
    const error = new Error("Empresa no encontrada");
    error.statusCode = 404;
    throw error;
  }

  return empresaEliminada;
};

export {
  obtenerTodas,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
};
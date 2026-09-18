import mongoose from "mongoose";
import Departamento from "../models/departamento.model.js";
import Empresa from "../models/empresa.model.js";

const obtenerTodos = async () => {
  return await Departamento.find()
    .populate("empresaId", "nombre nitORuc")
    .sort({ createdAt: -1 });
};

const obtenerPorId = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("El ID del departamento no es válido");
    error.statusCode = 400;
    throw error;
  }

  const departamento = await Departamento.findById(id).populate(
    "empresaId",
    "nombre nitORuc"
  );

  if (!departamento) {
    const error = new Error("Departamento no encontrado");
    error.statusCode = 404;
    throw error;
  }

  return departamento;
};

const crear = async (datosDepartamento) => {
  const { empresaId } = datosDepartamento;

  // Validar formato del ObjectId
  if (!mongoose.Types.ObjectId.isValid(empresaId)) {
    const error = new Error("El ID de la empresa no es válido");
    error.statusCode = 400;
    throw error;
  }

  // Comprobar que la empresa realmente exista
  const empresaExiste = await Empresa.findById(empresaId);

  if (!empresaExiste) {
    const error = new Error(
      "No se puede crear el departamento porque la empresa no existe"
    );
    error.statusCode = 404;
    throw error;
  }

  const nuevoDepartamento = new Departamento(datosDepartamento);

  const departamentoGuardado = await nuevoDepartamento.save();

  return await Departamento.findById(departamentoGuardado._id).populate(
    "empresaId",
    "nombre nitORuc"
  );
};

const actualizar = async (id, datosDepartamento) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("El ID del departamento no es válido");
    error.statusCode = 400;
    throw error;
  }

  // Si se intenta cambiar la empresa
  if (datosDepartamento.empresaId) {
    if (!mongoose.Types.ObjectId.isValid(datosDepartamento.empresaId)) {
      const error = new Error("El ID de la empresa no es válido");
      error.statusCode = 400;
      throw error;
    }

    const empresaExiste = await Empresa.findById(
      datosDepartamento.empresaId
    );

    if (!empresaExiste) {
      const error = new Error(
        "No se puede actualizar el departamento porque la empresa no existe"
      );
      error.statusCode = 404;
      throw error;
    }
  }

  const departamentoActualizado =
    await Departamento.findByIdAndUpdate(
      id,
      datosDepartamento,
      {
        new: true,
        runValidators: true,
      }
    ).populate("empresaId", "nombre nitORuc");

  if (!departamentoActualizado) {
    const error = new Error("Departamento no encontrado");
    error.statusCode = 404;
    throw error;
  }

  return departamentoActualizado;
};

const eliminar = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("El ID del departamento no es válido");
    error.statusCode = 400;
    throw error;
  }

  const departamentoEliminado =
    await Departamento.findByIdAndDelete(id);

  if (!departamentoEliminado) {
    const error = new Error("Departamento no encontrado");
    error.statusCode = 404;
    throw error;
  }

  return departamentoEliminado;
};

const obtenerPorEmpresa = async (empresaId) => {
  if (!mongoose.Types.ObjectId.isValid(empresaId)) {
    const error = new Error("El ID de la empresa no es válido");
    error.statusCode = 400;
    throw error;
  }

  const empresaExiste = await Empresa.findById(empresaId);

  if (!empresaExiste) {
    const error = new Error("Empresa no encontrada");
    error.statusCode = 404;
    throw error;
  }

  return await Departamento.find({ empresaId })
    .populate("empresaId", "nombre nitORuc")
    .sort({ nombre: 1 });
};

export {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  obtenerPorEmpresa,
};
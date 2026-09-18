import mongoose from "mongoose";
import Area from "../models/area.model.js";
import Departamento from "../models/departamento.model.js";

const obtenerTodas = async () => {
  return await Area.find()
    .populate("departamentoId", "nombre descripcion empresaId")
    .sort({ createdAt: -1 });
};

const obtenerPorId = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("El ID del área no es válido");
    error.statusCode = 400;
    throw error;
  }

  const area = await Area.findById(id).populate(
    "departamentoId",
    "nombre descripcion empresaId"
  );

  if (!area) {
    const error = new Error("Área no encontrada");
    error.statusCode = 404;
    throw error;
  }

  return area;
};


const crear = async (datosArea) => {
  const { departamentoId } = datosArea;

  if (!mongoose.Types.ObjectId.isValid(departamentoId)) {
    const error = new Error("El ID del departamento no es válido");
    error.statusCode = 400;
    throw error;
  }

  const departamentoExiste = await Departamento.findById(departamentoId);

  if (!departamentoExiste) {
    const error = new Error(
      "No se puede crear el área porque el departamento no existe"
    );
    error.statusCode = 404;
    throw error;
  }

  const nuevaArea = new Area(datosArea);

  const areaGuardada = await nuevaArea.save();

  return await Area.findById(areaGuardada._id).populate(
    "departamentoId",
    "nombre descripcion empresaId"
  );
};

const actualizar = async (id, datosArea) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("El ID del área no es válido");
    error.statusCode = 400;
    throw error;
  }

  if (datosArea.departamentoId) {
    if (!mongoose.Types.ObjectId.isValid(datosArea.departamentoId)) {
      const error = new Error("El ID del departamento no es válido");
      error.statusCode = 400;
      throw error;
    }

    const departamentoExiste = await Departamento.findById(
      datosArea.departamentoId
    );

    if (!departamentoExiste) {
      const error = new Error(
        "No se puede actualizar el área porque el departamento no existe"
      );
      error.statusCode = 404;
      throw error;
    }
  }

  const areaActualizada = await Area.findByIdAndUpdate(
    id,
    datosArea,
    {
      new: true,
      runValidators: true,
    }
  ).populate(
    "departamentoId",
    "nombre descripcion empresaId"
  );

  if (!areaActualizada) {
    const error = new Error("Área no encontrada");
    error.statusCode = 404;
    throw error;
  }

  return areaActualizada;
};

const eliminar = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("El ID del área no es válido");
    error.statusCode = 400;
    throw error;
  }

  const areaEliminada = await Area.findByIdAndDelete(id);

  if (!areaEliminada) {
    const error = new Error("Área no encontrada");
    error.statusCode = 404;
    throw error;
  }

  return areaEliminada;
};

const obtenerPorDepartamento = async (departamentoId) => {
  if (!mongoose.Types.ObjectId.isValid(departamentoId)) {
    const error = new Error("El ID del departamento no es válido");
    error.statusCode = 400;
    throw error;
  }

  const departamentoExiste = await Departamento.findById(departamentoId);

  if (!departamentoExiste) {
    const error = new Error("Departamento no encontrado");
    error.statusCode = 404;
    throw error;
  }

  return await Area.find({ departamentoId })
    .populate("departamentoId", "nombre descripcion empresaId")
    .sort({ nombre: 1 });
};

export {
  obtenerTodas,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  obtenerPorDepartamento,
};
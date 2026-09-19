import mongoose from "mongoose";
import Recurso from "../models/recurso.model.js";
import CategoriaRecurso from "../models/categoriaRecurso.model.js";
import Area from "../models/area.model.js";

// Obtener todos los recursos
const obtenerTodas = async () => {
  return await Recurso.find()
    .populate("areaId")
    .populate("categoriaRecursoId")
    .sort({ createdAt: -1 });
};

// Obtener recurso por ID
const obtenerPorId = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("El ID del recurso no es válido");
    error.statusCode = 400;
    throw error;
  }

  const recurso = await Recurso.findById(id)
    .populate("areaId")
    .populate("categoriaRecursoId");

  if (!recurso) {
    const error = new Error("Recurso no encontrado");
    error.statusCode = 404;
    throw error;
  }

  return recurso;
};

// Crear recurso
const crear = async (datosRecurso) => {
  // Validar si el código ya existe
  const codigoExistente = await Recurso.findOne({
    codigo: datosRecurso.codigo,
  });

  if (codigoExistente) {
    const error = new Error("Ya existe un recurso con ese código");
    error.statusCode = 409;
    throw error;
  }

  // Validar si el nombre ya existe
  const nombreExistente = await Recurso.findOne({
    nombre: datosRecurso.nombre,
  });

  if (nombreExistente) {
    const error = new Error("Ya existe un recurso con ese nombre");
    error.statusCode = 409;
    throw error;
  }

  const nuevoRecurso = new Recurso(datosRecurso);

  return await nuevoRecurso.save();
};

// Actualizar recurso
const actualizar = async (id, datosRecurso) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("El ID del recurso no es válido");
    error.statusCode = 400;
    throw error;
  }

  // Si se intenta cambiar el código, verificamos que no pertenezca a otro recurso
  if (datosRecurso.codigo) {
    const recursoConMismoCodigo = await Recurso.findOne({
      codigo: datosRecurso.codigo,
      _id: { $ne: id },
    });

    if (recursoConMismoCodigo) {
      const error = new Error("Ya existe otro recurso con ese código");
      error.statusCode = 409;
      throw error;
    }
  }

  // Si se intenta cambiar el nombre, verificamos que no pertenezca a otro recurso
  if (datosRecurso.nombre) {
    const recursoConMismoNombre = await Recurso.findOne({
      nombre: datosRecurso.nombre,
      _id: { $ne: id },
    });

    if (recursoConMismoNombre) {
      const error = new Error("Ya existe otro recurso con ese nombre");
      error.statusCode = 409;
      throw error;
    }
  }

  // Para ejecutar las validaciones personalizadas (como la suma de cantidades vs existencia total),
  // buscamos el documento, le asignamos los cambios y ejecutamos .save()
  const recurso = await Recurso.findById(id);

  if (!recurso) {
    const error = new Error("Recurso no encontrado");
    error.statusCode = 404;
    throw error;
  }

  Object.assign(recurso, datosRecurso);
  const recursoActualizado = await recurso.save();

  // Populate de las relaciones para la respuesta
  return await recursoActualizado.populate(["areaId", "categoriaRecursoId"]);
};

// Eliminar recurso
const eliminar = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("El ID del recurso no es válido");
    error.statusCode = 400;
    throw error;
  }

  const recursoEliminado = await Recurso.findByIdAndDelete(id);

  if (!recursoEliminado) {
    const error = new Error("Recurso no encontrado");
    error.statusCode = 404;
    throw error;
  }

  return recursoEliminado;
};

export {
  obtenerTodas,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
};
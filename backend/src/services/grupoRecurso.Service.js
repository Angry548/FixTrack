import mongoose from "mongoose";
import GrupoRecurso from "../models/grupoRecurso.model.js";

// Obtener todos los grupos de recursos
const obtenerTodas = async () => {
  return await GrupoRecurso.find()
    .populate("recursosAsociados")
    .sort({ createdAt: -1 });
};

// Obtener grupo de recurso por ID
const obtenerPorId = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("El ID del grupo no es válido");
    error.statusCode = 400;
    throw error;
  }

  const grupo = await GrupoRecurso.findById(id).populate("recursosAsociados");

  if (!grupo) {
    const error = new Error("Grupo de recursos no encontrado");
    error.statusCode = 404;
    throw error;
  }

  return grupo;
};

// Crear grupo de recurso
const crear = async (datosGrupo) => {
  const grupoExistente = await GrupoRecurso.findOne({
    nombre: datosGrupo.nombre,
  });

  if (grupoExistente) {
    const error = new Error("Ya existe un grupo con ese nombre");
    error.statusCode = 409;
    throw error;
  }

  const nuevoGrupo = new GrupoRecurso(datosGrupo);

  return await nuevoGrupo.save();
};

// Actualizar grupo de recurso
const actualizar = async (id, datosGrupo) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("El ID del grupo no es válido");
    error.statusCode = 400;
    throw error;
  }

  // Si se intenta cambiar el nombre, verificamos que no pertenezca a otro grupo
  if (datosGrupo.nombre) {
    const grupoConMismoNombre = await GrupoRecurso.findOne({
      nombre: datosGrupo.nombre,
      _id: { $ne: id },
    });

    if (grupoConMismoNombre) {
      const error = new Error("Ya existe otro grupo con ese nombre");
      error.statusCode = 409;
      throw error;
    }
  }

  const grupoActualizado = await GrupoRecurso.findByIdAndUpdate(
    id,
    datosGrupo,
    {
      new: true,
      runValidators: true,
    }
  ).populate("recursosAsociados");

  if (!grupoActualizado) {
    const error = new Error("Grupo de recursos no encontrado");
    error.statusCode = 404;
    throw error;
  }

  return grupoActualizado;
};

// Eliminar grupo de recurso
const eliminar = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("El ID del grupo no es válido");
    error.statusCode = 400;
    throw error;
  }

  const grupoEliminado = await GrupoRecurso.findByIdAndDelete(id);

  if (!grupoEliminado) {
    const error = new Error("Grupo de recursos no encontrado");
    error.statusCode = 404;
    throw error;
  }

  return grupoEliminado;
};

export {
  obtenerTodas,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
};
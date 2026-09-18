import mongoose from "mongoose";
import CategoriaAjuste from "../models/categoriaAjuste.model.js";

const obtenerTodas = async () => {
  return await CategoriaAjuste.find().sort({ nombre: 1 });
};

const obtenerPorId = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(
      "El ID de la categoría de ajuste no es válido"
    );
    error.statusCode = 400;
    throw error;
  }

  const categoria = await CategoriaAjuste.findById(id);

  if (!categoria) {
    const error = new Error(
      "Categoría de ajuste no encontrada"
    );
    error.statusCode = 404;
    throw error;
  }

  return categoria;
};

const crear = async (datosCategoria) => {
  const categoriaExistente = await CategoriaAjuste.findOne({
    nombre: datosCategoria.nombre,
  });

  if (categoriaExistente) {
    const error = new Error(
      "Ya existe una categoría de ajuste con ese nombre"
    );
    error.statusCode = 409;
    throw error;
  }

  const nuevaCategoria = new CategoriaAjuste(datosCategoria);

  return await nuevaCategoria.save();
};

const actualizar = async (id, datosCategoria) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(
      "El ID de la categoría de ajuste no es válido"
    );
    error.statusCode = 400;
    throw error;
  }

  if (datosCategoria.nombre) {
    const categoriaExistente = await CategoriaAjuste.findOne({
      nombre: datosCategoria.nombre,
      _id: { $ne: id },
    });

    if (categoriaExistente) {
      const error = new Error(
        "Ya existe otra categoría de ajuste con ese nombre"
      );
      error.statusCode = 409;
      throw error;
    }
  }

  const categoriaActualizada =
    await CategoriaAjuste.findByIdAndUpdate(
      id,
      datosCategoria,
      {
        new: true,
        runValidators: true,
      }
    );

  if (!categoriaActualizada) {
    const error = new Error(
      "Categoría de ajuste no encontrada"
    );
    error.statusCode = 404;
    throw error;
  }

  return categoriaActualizada;
};

const eliminar = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(
      "El ID de la categoría de ajuste no es válido"
    );
    error.statusCode = 400;
    throw error;
  }

  const categoriaEliminada =
    await CategoriaAjuste.findByIdAndDelete(id);

  if (!categoriaEliminada) {
    const error = new Error(
      "Categoría de ajuste no encontrada"
    );
    error.statusCode = 404;
    throw error;
  }

  return categoriaEliminada;
};

const cambiarEstado = async (id, activo) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(
      "El ID de la categoría de ajuste no es válido"
    );
    error.statusCode = 400;
    throw error;
  }

  if (typeof activo !== "boolean") {
    const error = new Error(
      "El campo activo debe ser verdadero o falso"
    );
    error.statusCode = 400;
    throw error;
  }

  const categoriaActualizada =
    await CategoriaAjuste.findByIdAndUpdate(
      id,
      { activo },
      {
        new: true,
        runValidators: true,
      }
    );

  if (!categoriaActualizada) {
    const error = new Error(
      "Categoría de ajuste no encontrada"
    );
    error.statusCode = 404;
    throw error;
  }

  return categoriaActualizada;
};

export {
  obtenerTodas,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  cambiarEstado,
};
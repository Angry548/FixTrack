import mongoose from "mongoose";
import CategoriaRecurso from "../models/categoriaRecurso.model.js";

// Obtener todas las categorías de recursos
const obtenerTodas = async () => {
  return await CategoriaRecurso.find().sort({ createdAt: -1 });
};

// Obtener categoría de recurso por ID
const obtenerPorId = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("El ID de la categoría no es válido");
    error.statusCode = 400;
    throw error;
  }

  const categoria = await CategoriaRecurso.findById(id);

  if (!categoria) {
    const error = new Error("Categoría de recurso no encontrada");
    error.statusCode = 404;
    throw error;
  }

  return categoria;
};

// Crear categoría de recurso
const crear = async (datosCategoria) => {
  const categoriaExistente = await CategoriaRecurso.findOne({
    nombre: datosCategoria.nombre,
  });

  if (categoriaExistente) {
    const error = new Error("Ya existe una categoría con ese nombre");
    error.statusCode = 409;
    throw error;
  }

  const nuevaCategoria = new CategoriaRecurso(datosCategoria);

  return await nuevaCategoria.save();
};

// Actualizar categoría de recurso
const actualizar = async (id, datosCategoria) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("El ID de la categoría no es válido");
    error.statusCode = 400;
    throw error;
  }

  // Si se intenta cambiar el nombre, verificamos que no pertenezca a otra categoría
  if (datosCategoria.nombre) {
    const categoriaConMismoNombre = await CategoriaRecurso.findOne({
      nombre: datosCategoria.nombre,
      _id: { $ne: id },
    });

    if (categoriaConMismoNombre) {
      const error = new Error("Ya existe otra categoría con ese nombre");
      error.statusCode = 409;
      throw error;
    }
  }

  const categoriaActualizada = await CategoriaRecurso.findByIdAndUpdate(
    id,
    datosCategoria,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!categoriaActualizada) {
    const error = new Error("Categoría de recurso no encontrada");
    error.statusCode = 404;
    throw error;
  }

  return categoriaActualizada;
};

// Eliminar categoría de recurso
const eliminar = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("El ID de la categoría no es válido");
    error.statusCode = 400;
    throw error;
  }

  const categoriaEliminada = await CategoriaRecurso.findByIdAndDelete(id);

  if (!categoriaEliminada) {
    const error = new Error("Categoría de recurso no encontrada");
    error.statusCode = 404;
    throw error;
  }

  return categoriaEliminada;
};

export {
  obtenerTodas,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
};
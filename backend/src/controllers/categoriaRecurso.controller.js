import * as categoriaRecursoService from "../services/categoriaRecurso.service.js";

// GET /api/v1/categorias-recurso
const getCategoriasRecurso = async (req, res, next) => {
  try {
    const categorias = await categoriaRecursoService.obtenerTodas();

    return res.status(200).json({
      success: true,
      message: "Categorías de recurso obtenidas correctamente",
      count: categorias.length,
      data: categorias,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/categorias-recurso/:id
const getCategoriaRecursoById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const categoria = await categoriaRecursoService.obtenerPorId(id);

    return res.status(200).json({
      success: true,
      message: "Categoría de recurso obtenida correctamente",
      data: categoria,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/categorias-recurso
const createCategoriaRecurso = async (req, res, next) => {
  try {
    const nuevaCategoria = await categoriaRecursoService.crear(req.body);

    return res.status(201).json({
      success: true,
      message: "Categoría de recurso creada correctamente",
      data: nuevaCategoria,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/categorias-recurso/:id
const updateCategoriaRecurso = async (req, res, next) => {
  try {
    const { id } = req.params;

    const categoriaActualizada = await categoriaRecursoService.actualizar(
      id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Categoría de recurso actualizada correctamente",
      data: categoriaActualizada,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/categorias-recurso/:id
const deleteCategoriaRecurso = async (req, res, next) => {
  try {
    const { id } = req.params;

    await categoriaRecursoService.eliminar(id);

    return res.status(200).json({
      success: true,
      message: "Categoría de recurso eliminada correctamente",
    });
  } catch (error) {
    next(error);
  }
};

export {
  getCategoriasRecurso,
  getCategoriaRecursoById,
  createCategoriaRecurso,
  updateCategoriaRecurso,
  deleteCategoriaRecurso,
};
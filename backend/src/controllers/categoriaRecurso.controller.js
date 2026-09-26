import * as categoriaRecursoService from "../services/categoriaRecurso.service.js";

const getCategoriaRecurso = async (
  req,
  res,
  next
) => {
  try {
    const {
      nombre = "",
      descripcion = "",
      activo = "",
      search = "",
      page,
      limit,
    } = req.query;

    const resultado =
      await categoriaRecursoService.obtenerTodas({
        nombre,
        descripcion,
        activo,
        search,
        page,
        limit,
      });

    const respuesta = {
      success: true,
      message:
        "Categorías de recurso obtenidas correctamente",
      count:
        resultado.registros.length,
      data:
        resultado.registros,
    };

    if (resultado.paginado) {
      respuesta.pagination = {
        page:
          resultado.page,
        limit:
          resultado.limit,
        total:
          resultado.total,
        totalPages:
          resultado.totalPages,
        hasPrevPage:
          resultado.page > 1,
        hasNextPage:
          resultado.page <
          resultado.totalPages,
      };
    }

    return res
      .status(200)
      .json(respuesta);
  } catch (error) {
    next(error);
  }
};

const getCategoriaRecursoById = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const categoria =
      await categoriaRecursoService.obtenerPorId(
        id
      );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Categoría de recurso obtenida correctamente",
        data: categoria,
      });
  } catch (error) {
    next(error);
  }
};

const createCategoriaRecurso = async (
  req,
  res,
  next
) => {
  try {
    const nuevaCategoria =
      await categoriaRecursoService.crear(
        req.body
      );

    return res
      .status(201)
      .json({
        success: true,
        message:
          "Categoría de recurso creada correctamente",
        data:
          nuevaCategoria,
      });
  } catch (error) {
    next(error);
  }
};

const updateCategoriaRecurso = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const categoriaActualizada =
      await categoriaRecursoService.actualizar(
        id,
        req.body
      );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Categoría de recurso actualizada correctamente",
        data:
          categoriaActualizada,
      });
  } catch (error) {
    next(error);
  }
};

const deleteCategoriaRecurso = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    await categoriaRecursoService.eliminar(
      id
    );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Categoría de recurso eliminada correctamente",
      });
  } catch (error) {
    next(error);
  }
};

export {
  getCategoriaRecurso,
  getCategoriaRecursoById,
  createCategoriaRecurso,
  updateCategoriaRecurso,
  deleteCategoriaRecurso,
};
import * as recursoService from "../services/recurso.service.js";

const getRecurso = async (
  req,
  res,
  next
) => {
  try {
    const {
      nombre = "",
      codigo = "",
      descripcion = "",
      areaId = "",
      categoriaRecursoId = "",
      activo = "",
      search = "",
      page,
      limit,
    } = req.query;

    const resultado =
      await recursoService.obtenerTodas({
        nombre,
        codigo,
        descripcion,
        areaId,
        categoriaRecursoId,
        activo,
        search,
        page,
        limit,
      });

    const respuesta = {
      success: true,
      message:
        "Recursos obtenidos correctamente",
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

const getRecursoById = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const recurso =
      await recursoService.obtenerPorId(
        id
      );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Recurso obtenido correctamente",
        data: recurso,
      });
  } catch (error) {
    next(error);
  }
};

const createRecurso = async (
  req,
  res,
  next
) => {
  try {
    const nuevoRecurso =
      await recursoService.crear(
        req.body
      );

    return res
      .status(201)
      .json({
        success: true,
        message:
          "Recurso creado correctamente",
        data:
          nuevoRecurso,
      });
  } catch (error) {
    next(error);
  }
};

const updateRecurso = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const recursoActualizado =
      await recursoService.actualizar(
        id,
        req.body
      );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Recurso actualizado correctamente",
        data:
          recursoActualizado,
      });
  } catch (error) {
    next(error);
  }
};

const deleteRecurso = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    await recursoService.eliminar(
      id
    );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Recurso eliminado correctamente",
      });
  } catch (error) {
    next(error);
  }
};

export {
  getRecurso,
  getRecursoById,
  createRecurso,
  updateRecurso,
  deleteRecurso,
};
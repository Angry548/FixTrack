import * as grupoRecursoService from "../services/grupoRecurso.service.js";

const getGrupoRecurso = async (
  req,
  res,
  next
) => {
  try {
    const {
      nombre = "",
      descripcion = "",
      recursoId = "",
      activo = "",
      search = "",
      page,
      limit,
    } = req.query;

    const resultado =
      await grupoRecursoService.obtenerTodas({
        nombre,
        descripcion,
        recursoId,
        activo,
        search,
        page,
        limit,
      });

    const respuesta = {
      success: true,
      message:
        "Grupos de recursos obtenidos correctamente",
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

const getGrupoRecursoById = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const grupo =
      await grupoRecursoService.obtenerPorId(
        id
      );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Grupo de recursos obtenido correctamente",
        data: grupo,
      });
  } catch (error) {
    next(error);
  }
};

const createGrupoRecurso = async (
  req,
  res,
  next
) => {
  try {
    const nuevoGrupo =
      await grupoRecursoService.crear(
        req.body
      );

    return res
      .status(201)
      .json({
        success: true,
        message:
          "Grupo de recursos creado correctamente",
        data:
          nuevoGrupo,
      });
  } catch (error) {
    next(error);
  }
};

const updateGrupoRecurso = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const grupoActualizado =
      await grupoRecursoService.actualizar(
        id,
        req.body
      );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Grupo de recursos actualizado correctamente",
        data:
          grupoActualizado,
      });
  } catch (error) {
    next(error);
  }
};

const deleteGrupoRecurso = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    await grupoRecursoService.eliminar(
      id
    );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Grupo de recursos eliminado correctamente",
      });
  } catch (error) {
    next(error);
  }
};

export {
  getGrupoRecurso,
  getGrupoRecursoById,
  createGrupoRecurso,
  updateGrupoRecurso,
  deleteGrupoRecurso,
};
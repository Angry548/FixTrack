import * as areaService from "../services/area.service.js";

const getAreas = async (req, res, next) => {
  try {
    const {
      nombre = "",
      descripcion = "",
      ubicacion = "",
      departamentoId = "",
      search = "",
      page,
      limit,
    } = req.query;

    const resultado =
      await areaService.obtenerTodas({
        nombre,
        descripcion,
        ubicacion,
        departamentoId,
        search,
        page,
        limit,
      });

    const respuesta = {
      success: true,
      message:
        "Áreas obtenidas correctamente",
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

const getAreaById = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const area =
      await areaService.obtenerPorId(
        id
      );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Área obtenida correctamente",
        data: area,
      });
  } catch (error) {
    next(error);
  }
};

const createArea = async (
  req,
  res,
  next
) => {
  try {
    const nuevaArea =
      await areaService.crear(
        req.body
      );

    return res
      .status(201)
      .json({
        success: true,
        message:
          "Área creada correctamente",
        data:
          nuevaArea,
      });
  } catch (error) {
    next(error);
  }
};

const updateArea = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const areaActualizada =
      await areaService.actualizar(
        id,
        req.body
      );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Área actualizada correctamente",
        data:
          areaActualizada,
      });
  } catch (error) {
    next(error);
  }
};

const deleteArea = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    await areaService.eliminar(
      id
    );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Área eliminada correctamente",
      });
  } catch (error) {
    next(error);
  }
};

const getAreasByDepartamento = async (
  req,
  res,
  next
) => {
  try {
    const {
      departamentoId,
    } = req.params;

    const areas =
      await areaService.obtenerPorDepartamento(
        departamentoId
      );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Áreas del departamento obtenidas correctamente",
        count:
          areas.length,
        data: areas,
      });
  } catch (error) {
    next(error);
  }
};

export {
  getAreas,
  getAreaById,
  createArea,
  updateArea,
  deleteArea,
  getAreasByDepartamento,
};
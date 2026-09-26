import * as categoriaAjusteService from "../services/categoriaAjuste.service.js";

const getCategoriasAjuste = async (
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
      await categoriaAjusteService.obtenerTodas({
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
        "Categorías de ajuste obtenidas correctamente",
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

const getCategoriaAjusteById = async (
  req,
  res,
  next
) => {
  try {
    const categoria =
      await categoriaAjusteService.obtenerPorId(
        req.params.id
      );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Categoría de ajuste obtenida correctamente",
        data: categoria,
      });
  } catch (error) {
    next(error);
  }
};

const createCategoriaAjuste = async (
  req,
  res,
  next
) => {
  try {
    const nuevaCategoria =
      await categoriaAjusteService.crear(
        req.body
      );

    return res
      .status(201)
      .json({
        success: true,
        message:
          "Categoría de ajuste creada correctamente",
        data:
          nuevaCategoria,
      });
  } catch (error) {
    next(error);
  }
};

const updateCategoriaAjuste = async (
  req,
  res,
  next
) => {
  try {
    const categoriaActualizada =
      await categoriaAjusteService.actualizar(
        req.params.id,
        req.body
      );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Categoría de ajuste actualizada correctamente",
        data:
          categoriaActualizada,
      });
  } catch (error) {
    next(error);
  }
};

const deleteCategoriaAjuste = async (
  req,
  res,
  next
) => {
  try {
    await categoriaAjusteService.eliminar(
      req.params.id
    );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Categoría de ajuste eliminada correctamente",
      });
  } catch (error) {
    next(error);
  }
};

const changeEstadoCategoriaAjuste = async (
  req,
  res,
  next
) => {
  try {
    const categoria =
      await categoriaAjusteService.cambiarEstado(
        req.params.id,
        req.body.activo
      );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Estado de la categoría de ajuste actualizado correctamente",
        data: categoria,
      });
  } catch (error) {
    next(error);
  }
};

export {
  getCategoriasAjuste,
  getCategoriaAjusteById,
  createCategoriaAjuste,
  updateCategoriaAjuste,
  deleteCategoriaAjuste,
  changeEstadoCategoriaAjuste,
};
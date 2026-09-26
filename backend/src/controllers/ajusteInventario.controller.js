import * as ajusteInventarioService from "../services/ajusteInventario.service.js";

const getAjustesInventario = async (
  req,
  res,
  next
) => {
  try {
    const {
      numeroDocumento = "",
      justificacion = "",
      categoriaAjusteId = "",
      proveedorId = "",
      recursoId = "",
      tipoMovimiento = "",
      fechaDesde = "",
      fechaHasta = "",
      search = "",
      page,
      limit,
    } = req.query;

    const resultado =
      await ajusteInventarioService.obtenerTodos({
        numeroDocumento,
        justificacion,
        categoriaAjusteId,
        proveedorId,
        recursoId,
        tipoMovimiento,
        fechaDesde,
        fechaHasta,
        search,
        page,
        limit,
      });

    const respuesta = {
      success: true,
      message:
        "Ajustes de inventario obtenidos correctamente",
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

const getAjusteInventarioById = async (
  req,
  res,
  next
) => {
  try {
    const ajuste =
      await ajusteInventarioService.obtenerPorId(
        req.params.id
      );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Ajuste de inventario obtenido correctamente",
        data: ajuste,
      });
  } catch (error) {
    next(error);
  }
};

const createAjusteInventario = async (
  req,
  res,
  next
) => {
  try {
    const nuevoAjuste =
      await ajusteInventarioService.crear(
        req.body
      );

    return res
      .status(201)
      .json({
        success: true,
        message:
          "Ajuste de inventario creado correctamente",
        data:
          nuevoAjuste,
      });
  } catch (error) {
    next(error);
  }
};

const updateAjusteInventario = async (
  req,
  res,
  next
) => {
  try {
    const ajuste =
      await ajusteInventarioService.actualizar(
        req.params.id,
        req.body
      );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Ajuste de inventario actualizado correctamente",
        data: ajuste,
      });
  } catch (error) {
    next(error);
  }
};

const deleteAjusteInventario = async (
  req,
  res,
  next
) => {
  try {
    await ajusteInventarioService.eliminar(
      req.params.id
    );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Ajuste de inventario eliminado y existencias revertidas correctamente",
      });
  } catch (error) {
    next(error);
  }
};

const getAjustesByCategoria = async (
  req,
  res,
  next
) => {
  try {
    const ajustes =
      await ajusteInventarioService.obtenerPorCategoria(
        req.params
          .categoriaAjusteId
      );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Ajustes de la categoría obtenidos correctamente",
        count:
          ajustes.length,
        data: ajustes,
      });
  } catch (error) {
    next(error);
  }
};

export {
  getAjustesInventario,
  getAjusteInventarioById,
  createAjusteInventario,
  updateAjusteInventario,
  deleteAjusteInventario,
  getAjustesByCategoria,
};
import * as mantenimientoService from "../services/mantenimiento.service.js";

export const crear = async (req, res, next) => {
  try {
    const mantenimiento =
      await mantenimientoService.crearMantenimiento(req.body);

    return res.status(201).json({
      success: true,
      message: "Mantenimiento creado correctamente",
      data: mantenimiento,
    });
  } catch (error) {
    next(error);
  }
};

export const obtenerTodos = async (req, res, next) => {
  try {
    const {
      tipo = "",
      estado = "",
      descripcionProblema = "",
      recursoId = "",
      empleadoReportaId = "",
      tecnicoAsignadoId = "",
      proveedorId = "",
      fechaDesde = "",
      fechaHasta = "",
      search = "",
      page,
      limit,
    } = req.query;

    const resultado = await mantenimientoService.obtenerMantenimientos({
      tipo,
      estado,
      descripcionProblema,
      recursoId,
      empleadoReportaId,
      tecnicoAsignadoId,
      proveedorId,
      fechaDesde,
      fechaHasta,
      search,
      page,
      limit,
    });

    const respuesta = {
      success: true,
      message: "Mantenimientos obtenidos correctamente",
      count: resultado.registros.length,
      data: resultado.registros,
    };

    if (resultado.paginado) {
      respuesta.pagination = {
        page: resultado.page,
        limit: resultado.limit,
        total: resultado.total,
        totalPages: resultado.totalPages,
        hasPrevPage: resultado.page > 1,
        hasNextPage: resultado.page < resultado.totalPages,
      };
    }

    return res.status(200).json(respuesta);
  } catch (error) {
    next(error);
  }
};

export const obtenerPorId = async (req, res, next) => {
  try {
    const mantenimiento =
      await mantenimientoService.obtenerMantenimientoPorId(req.params.id);

    if (!mantenimiento) {
      return res.status(404).json({
        success: false,
        message: "Mantenimiento no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Mantenimiento obtenido correctamente",
      data: mantenimiento,
    });
  } catch (error) {
    next(error);
  }
};

export const actualizar = async (req, res, next) => {
  try {
    const mantenimiento =
      await mantenimientoService.actualizarMantenimiento(
        req.params.id,
        req.body
      );

    if (!mantenimiento) {
      return res.status(404).json({
        success: false,
        message: "Mantenimiento no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Mantenimiento actualizado correctamente",
      data: mantenimiento,
    });
  } catch (error) {
    next(error);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    const mantenimiento =
      await mantenimientoService.eliminarMantenimiento(req.params.id);

    if (!mantenimiento) {
      return res.status(404).json({
        success: false,
        message: "Mantenimiento no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Mantenimiento eliminado correctamente",
      data: mantenimiento,
    });
  } catch (error) {
    next(error);
  }
};
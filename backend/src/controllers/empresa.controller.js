import * as empresaService from "../services/empresa.service.js";

const getEmpresas = async (
  req,
  res,
  next
) => {
  try {
    const {
      nombre = "",
      nitORuc = "",
      search = "",
      page,
      limit,
    } = req.query;

    const resultado =
      await empresaService.obtenerTodas({
        nombre,
        nitORuc,
        search,
        page,
        limit,
      });

    const respuesta = {
      success: true,
      message:
        "Empresas obtenidas correctamente",
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

// GET /api/v1/empresas/:id
const getEmpresaById = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const empresa =
      await empresaService.obtenerPorId(
        id
      );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Empresa obtenida correctamente",
        data: empresa,
      });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/empresas
const createEmpresa = async (
  req,
  res,
  next
) => {
  try {
    const nuevaEmpresa =
      await empresaService.crear(
        req.body
      );

    return res
      .status(201)
      .json({
        success: true,
        message:
          "Empresa creada correctamente",
        data:
          nuevaEmpresa,
      });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/empresas/:id
const updateEmpresa = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const empresaActualizada =
      await empresaService.actualizar(
        id,
        req.body
      );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Empresa actualizada correctamente",
        data:
          empresaActualizada,
      });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/empresas/:id
const deleteEmpresa = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    await empresaService.eliminar(
      id
    );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Empresa eliminada correctamente",
      });
  } catch (error) {
    next(error);
  }
};

export {
  getEmpresas,
  getEmpresaById,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
};
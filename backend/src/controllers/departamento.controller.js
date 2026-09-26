import * as departamentoService from "../services/departamento.service.js";

const getDepartamentos = async (
  req,
  res,
  next
) => {
  try {
    const {
      nombre = "",
      descripcion = "",
      empresaId = "",
      search = "",
      page,
      limit,
    } = req.query;

    const resultado =
      await departamentoService.obtenerTodos({
        nombre,
        descripcion,
        empresaId,
        search,
        page,
        limit,
      });

    const respuesta = {
      success: true,
      message:
        "Departamentos obtenidos correctamente",
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

// GET /api/v1/departamentos/:id
const getDepartamentoById = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const departamento =
      await departamentoService.obtenerPorId(
        id
      );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Departamento obtenido correctamente",
        data:
          departamento,
      });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/departamentos
const createDepartamento = async (
  req,
  res,
  next
) => {
  try {
    const nuevoDepartamento =
      await departamentoService.crear(
        req.body
      );

    return res
      .status(201)
      .json({
        success: true,
        message:
          "Departamento creado correctamente",
        data:
          nuevoDepartamento,
      });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/departamentos/:id
const updateDepartamento = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const departamentoActualizado =
      await departamentoService.actualizar(
        id,
        req.body
      );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Departamento actualizado correctamente",
        data:
          departamentoActualizado,
      });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/departamentos/:id
const deleteDepartamento = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    await departamentoService.eliminar(
      id
    );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Departamento eliminado correctamente",
      });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/departamentos/empresa/:empresaId
const getDepartamentosByEmpresa = async (
  req,
  res,
  next
) => {
  try {
    const {
      empresaId,
    } = req.params;

    const departamentos =
      await departamentoService.obtenerPorEmpresa(
        empresaId
      );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Departamentos de la empresa obtenidos correctamente",
        count:
          departamentos.length,
        data:
          departamentos,
      });
  } catch (error) {
    next(error);
  }
};

export {
  getDepartamentos,
  getDepartamentoById,
  createDepartamento,
  updateDepartamento,
  deleteDepartamento,
  getDepartamentosByEmpresa,
};
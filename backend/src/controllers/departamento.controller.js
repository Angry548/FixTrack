import * as departamentoService from "../services/departamento.service.js";

const getDepartamentos = async (req, res, next) => {
  try {
    const departamentos =
      await departamentoService.obtenerTodos();

    return res.status(200).json({
      success: true,
      message: "Departamentos obtenidos correctamente",
      count: departamentos.length,
      data: departamentos,
    });
  } catch (error) {
    next(error);
  }
};

const getDepartamentoById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const departamento =
      await departamentoService.obtenerPorId(id);

    return res.status(200).json({
      success: true,
      message: "Departamento obtenido correctamente",
      data: departamento,
    });
  } catch (error) {
    next(error);
  }
};

const createDepartamento = async (req, res, next) => {
  try {
    const nuevoDepartamento =
      await departamentoService.crear(req.body);

    return res.status(201).json({
      success: true,
      message: "Departamento creado correctamente",
      data: nuevoDepartamento,
    });
  } catch (error) {
    next(error);
  }
};

const updateDepartamento = async (req, res, next) => {
  try {
    const { id } = req.params;

    const departamentoActualizado =
      await departamentoService.actualizar(
        id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message: "Departamento actualizado correctamente",
      data: departamentoActualizado,
    });
  } catch (error) {
    next(error);
  }
};

const deleteDepartamento = async (req, res, next) => {
  try {
    const { id } = req.params;

    await departamentoService.eliminar(id);

    return res.status(200).json({
      success: true,
      message: "Departamento eliminado correctamente",
    });
  } catch (error) {
    next(error);
  }
};

const getDepartamentosByEmpresa = async (
  req,
  res,
  next
) => {
  try {
    const { empresaId } = req.params;

    const departamentos =
      await departamentoService.obtenerPorEmpresa(
        empresaId
      );

    return res.status(200).json({
      success: true,
      message:
        "Departamentos de la empresa obtenidos correctamente",
      count: departamentos.length,
      data: departamentos,
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
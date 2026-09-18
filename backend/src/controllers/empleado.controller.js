import * as empleadoService from "../services/empleado.service.js";

const getEmpleados = async (req, res, next) => {
  try {
    const empleados = await empleadoService.obtenerTodos();

    return res.status(200).json({
      success: true,
      message: "Empleados obtenidos correctamente",
      count: empleados.length,
      data: empleados,
    });
  } catch (error) {
    next(error);
  }
};

const getEmpleadoById = async (req, res, next) => {
  try {
    const empleado = await empleadoService.obtenerPorId(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Empleado obtenido correctamente",
      data: empleado,
    });
  } catch (error) {
    next(error);
  }
};

const createEmpleado = async (req, res, next) => {
  try {
    const nuevoEmpleado = await empleadoService.crear(
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Empleado creado correctamente",
      data: nuevoEmpleado,
    });
  } catch (error) {
    next(error);
  }
};

const updateEmpleado = async (req, res, next) => {
  try {
    const empleado = await empleadoService.actualizar(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Empleado actualizado correctamente",
      data: empleado,
    });
  } catch (error) {
    next(error);
  }
};

const deleteEmpleado = async (req, res, next) => {
  try {
    await empleadoService.eliminar(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Empleado eliminado correctamente",
    });
  } catch (error) {
    next(error);
  }
};

const getEmpleadosByArea = async (req, res, next) => {
  try {
    const empleados = await empleadoService.obtenerPorArea(
      req.params.areaId
    );

    return res.status(200).json({
      success: true,
      message: "Empleados del área obtenidos correctamente",
      count: empleados.length,
      data: empleados,
    });
  } catch (error) {
    next(error);
  }
};

const assignRecurso = async (req, res, next) => {
  try {
    const empleado = await empleadoService.asignarRecurso(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Recurso asignado correctamente al empleado",
      data: empleado,
    });
  } catch (error) {
    next(error);
  }
};

export {
  getEmpleados,
  getEmpleadoById,
  createEmpleado,
  updateEmpleado,
  deleteEmpleado,
  getEmpleadosByArea,
  assignRecurso,
};
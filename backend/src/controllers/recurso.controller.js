import * as recursoService from "../services/recurso.service.js";

// GET /api/v1/recursos
const getRecurso = async (req, res, next) => {
  try {
    const recursos = await recursoService.obtenerTodas();

    return res.status(200).json({
      success: true,
      message: "Recursos obtenidos correctamente",
      count: recursos.length,
      data: recursos,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/recursos/:id
const getRecursoById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const recurso = await recursoService.obtenerPorId(id);

    return res.status(200).json({
      success: true,
      message: "Recurso obtenido correctamente",
      data: recurso,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/recursos
const createRecurso = async (req, res, next) => {
  try {
    const nuevoRecurso = await recursoService.crear(req.body);

    return res.status(201).json({
      success: true,
      message: "Recurso creado correctamente",
      data: nuevoRecurso,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/recursos/:id
const updateRecurso = async (req, res, next) => {
  try {
    const { id } = req.params;

    const recursoActualizado = await recursoService.actualizar(
      id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Recurso actualizado correctamente",
      data: recursoActualizado,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/recursos/:id
const deleteRecurso = async (req, res, next) => {
  try {
    const { id } = req.params;

    await recursoService.eliminar(id);

    return res.status(200).json({
      success: true,
      message: "Recurso eliminado correctamente",
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
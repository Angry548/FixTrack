import * as grupoRecursoService from "../services/grupoRecurso.service.js";

// GET /api/v1/grupos-recurso
const getGrupoRecurso = async (req, res, next) => {
  try {
    const grupos = await grupoRecursoService.obtenerTodas();

    return res.status(200).json({
      success: true,
      message: "Grupos de recursos obtenidos correctamente",
      count: grupos.length,
      data: grupos,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/grupos-recurso/:id
const getGrupoRecursoById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const grupo = await grupoRecursoService.obtenerPorId(id);

    return res.status(200).json({
      success: true,
      message: "Grupo de recursos obtenido correctamente",
      data: grupo,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/grupos-recurso
const createGrupoRecurso = async (req, res, next) => {
  try {
    const nuevoGrupo = await grupoRecursoService.crear(req.body);

    return res.status(201).json({
      success: true,
      message: "Grupo de recursos creado correctamente",
      data: nuevoGrupo,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/grupos-recurso/:id
const updateGrupoRecurso = async (req, res, next) => {
  try {
    const { id } = req.params;

    const grupoActualizado = await grupoRecursoService.actualizar(
      id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Grupo de recursos actualizado correctamente",
      data: grupoActualizado,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/grupos-recurso/:id
const deleteGrupoRecurso = async (req, res, next) => {
  try {
    const { id } = req.params;

    await grupoRecursoService.eliminar(id);

    return res.status(200).json({
      success: true,
      message: "Grupo de recursos eliminado correctamente",
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
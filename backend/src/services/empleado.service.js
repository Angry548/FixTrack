import mongoose from "mongoose";
import Empleado from "../models/empleado.model.js";
import Area from "../models/area.model.js";
import Recurso from "../models/recurso.model.js";

const obtenerTodos = async () => {
  return await Empleado.find()
    .populate("areaId", "nombre ubicacion departamentoId")
    .populate("asignaciones.recursoId", "nombre codigo")
    .sort({ createdAt: -1 });
};

const obtenerPorId = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("El ID del empleado no es válido");
    error.statusCode = 400;
    throw error;
  }

  const empleado = await Empleado.findById(id)
    .populate("areaId", "nombre ubicacion departamentoId")
    .populate("asignaciones.recursoId", "nombre codigo");

  if (!empleado) {
    const error = new Error("Empleado no encontrado");
    error.statusCode = 404;
    throw error;
  }

  return empleado;
};

const crear = async (datosEmpleado) => {
  const { areaId, codigoEmpleado, correo } = datosEmpleado;

  // Validar ObjectId del área
  if (!mongoose.Types.ObjectId.isValid(areaId)) {
    const error = new Error("El ID del área no es válido");
    error.statusCode = 400;
    throw error;
  }

  // Verificar existencia del área
  const areaExiste = await Area.findById(areaId);

  if (!areaExiste) {
    const error = new Error(
      "No se puede crear el empleado porque el área no existe"
    );
    error.statusCode = 404;
    throw error;
  }

  // Verificar código duplicado
  const codigoExistente = await Empleado.findOne({
    codigoEmpleado,
  });

  if (codigoExistente) {
    const error = new Error(
      "Ya existe un empleado con ese código"
    );
    error.statusCode = 409;
    throw error;
  }

  // Verificar correo duplicado
  const correoExistente = await Empleado.findOne({
    correo,
  });

  if (correoExistente) {
    const error = new Error(
      "Ya existe un empleado con ese correo"
    );
    error.statusCode = 409;
    throw error;
  }

  const nuevoEmpleado = new Empleado(datosEmpleado);

  const empleadoGuardado = await nuevoEmpleado.save();

  return await Empleado.findById(empleadoGuardado._id)
    .populate("areaId", "nombre ubicacion departamentoId")
    .populate("asignaciones.recursoId", "nombre codigo");
};

const actualizar = async (id, datosEmpleado) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("El ID del empleado no es válido");
    error.statusCode = 400;
    throw error;
  }

  if (datosEmpleado.areaId) {
    if (!mongoose.Types.ObjectId.isValid(datosEmpleado.areaId)) {
      const error = new Error("El ID del área no es válido");
      error.statusCode = 400;
      throw error;
    }

    const areaExiste = await Area.findById(datosEmpleado.areaId);

    if (!areaExiste) {
      const error = new Error("El área indicada no existe");
      error.statusCode = 404;
      throw error;
    }
  }

  if (datosEmpleado.codigoEmpleado) {
    const codigoExistente = await Empleado.findOne({
      codigoEmpleado: datosEmpleado.codigoEmpleado,
      _id: { $ne: id },
    });

    if (codigoExistente) {
      const error = new Error(
        "Ya existe otro empleado con ese código"
      );
      error.statusCode = 409;
      throw error;
    }
  }

  if (datosEmpleado.correo) {
    const correoExistente = await Empleado.findOne({
      correo: datosEmpleado.correo,
      _id: { $ne: id },
    });

    if (correoExistente) {
      const error = new Error(
        "Ya existe otro empleado con ese correo"
      );
      error.statusCode = 409;
      throw error;
    }
  }

  const empleadoActualizado = await Empleado.findByIdAndUpdate(
    id,
    datosEmpleado,
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("areaId", "nombre ubicacion departamentoId")
    .populate("asignaciones.recursoId", "nombre codigo");

  if (!empleadoActualizado) {
    const error = new Error("Empleado no encontrado");
    error.statusCode = 404;
    throw error;
  }

  return empleadoActualizado;
};

const eliminar = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("El ID del empleado no es válido");
    error.statusCode = 400;
    throw error;
  }

  const empleadoEliminado = await Empleado.findByIdAndDelete(id);

  if (!empleadoEliminado) {
    const error = new Error("Empleado no encontrado");
    error.statusCode = 404;
    throw error;
  }

  return empleadoEliminado;
};

const obtenerPorArea = async (areaId) => {
  if (!mongoose.Types.ObjectId.isValid(areaId)) {
    const error = new Error("El ID del área no es válido");
    error.statusCode = 400;
    throw error;
  }

  const areaExiste = await Area.findById(areaId);

  if (!areaExiste) {
    const error = new Error("Área no encontrada");
    error.statusCode = 404;
    throw error;
  }

  return await Empleado.find({ areaId })
    .populate("areaId", "nombre ubicacion departamentoId")
    .populate("asignaciones.recursoId", "nombre codigo")
    .sort({ apellidos: 1, nombres: 1 });
};

const asignarRecurso = async (
  empleadoId,
  datosAsignacion
) => {
  if (!mongoose.Types.ObjectId.isValid(empleadoId)) {
    const error = new Error("El ID del empleado no es válido");
    error.statusCode = 400;
    throw error;
  }

  const { recursoId, cantidad } = datosAsignacion;

  if (!mongoose.Types.ObjectId.isValid(recursoId)) {
    const error = new Error("El ID del recurso no es válido");
    error.statusCode = 400;
    throw error;
  }

  if (!cantidad || cantidad <= 0) {
    const error = new Error(
      "La cantidad asignada debe ser mayor a 0"
    );
    error.statusCode = 400;
    throw error;
  }

  const empleado = await Empleado.findById(empleadoId);

  if (!empleado) {
    const error = new Error("Empleado no encontrado");
    error.statusCode = 404;
    throw error;
  }

  const recurso = await Recurso.findById(recursoId);

  if (!recurso) {
    const error = new Error("Recurso no encontrado");
    error.statusCode = 404;
    throw error;
  }

  const disponible =
    recurso.existenciaTotal -
    recurso.cantidadPrestada -
    recurso.cantidadEnReparacion -
    recurso.cantidadDesecho;

  if (cantidad > disponible) {
    const error = new Error(
      `Stock insuficiente. Disponibilidad actual: ${disponible}`
    );
    error.statusCode = 400;
    throw error;
  }

  empleado.asignaciones.push({
    recursoId,
    cantidad,
    fechaAsignacion: new Date(),
  });

  recurso.cantidadPrestada += cantidad;

  await recurso.save();
  await empleado.save();

  return await Empleado.findById(empleadoId)
    .populate("areaId", "nombre ubicacion departamentoId")
    .populate("asignaciones.recursoId", "nombre codigo");
};

export {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  obtenerPorArea,
  asignarRecurso,
};
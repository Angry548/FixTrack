import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Usuario from "../models/usuario.model.js";
import Empleado from "../models/empleado.model.js";

export const crearUsuario = async (data) => {
  const {
    nombre,
    correo,
    password,
    rol,
    empleadoId,
    activo = true,
  } = data;

  const usuarioExistente = await Usuario.findOne({
    correo: correo.toLowerCase(),
  });

  if (usuarioExistente) {
    const error = new Error("Ya existe un usuario con ese correo");
    error.statusCode = 409;
    throw error;
  }

  if (empleadoId) {
    if (!mongoose.Types.ObjectId.isValid(empleadoId)) {
      const error = new Error("El ID del empleado no es válido");
      error.statusCode = 400;
      throw error;
    }

    const empleadoExiste = await Empleado.findById(empleadoId);

    if (!empleadoExiste) {
      const error = new Error("El empleado indicado no existe");
      error.statusCode = 404;
      throw error;
    }

    const usuarioConEmpleado = await Usuario.findOne({ empleadoId });

    if (usuarioConEmpleado) {
      const error = new Error(
        "El empleado ya está asociado a otro usuario"
      );
      error.statusCode = 409;
      throw error;
    }
  }

  if (!password || password.length < 6) {
    const error = new Error(
      "La contraseña debe tener al menos 6 caracteres"
    );
    error.statusCode = 400;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const nuevoUsuario = new Usuario({
    nombre,
    correo,
    passwordHash,
    rol,
    empleadoId: empleadoId || undefined,
    activo,
  });

  const guardado = await nuevoUsuario.save();

  return await Usuario.findById(guardado._id).populate(
    "empleadoId",
    "nombres apellidos codigoEmpleado correo cargo activo"
  );
};

export const obtenerUsuarios = async () => {
  return await Usuario.find()
    .populate(
      "empleadoId",
      "nombres apellidos codigoEmpleado correo cargo activo"
    )
    .sort({ createdAt: -1 });
};

export const obtenerUsuarioPorId = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("El ID del usuario no es válido");
    error.statusCode = 400;
    throw error;
  }

  return await Usuario.findById(id).populate(
    "empleadoId",
    "nombres apellidos codigoEmpleado correo cargo activo"
  );
};

export const obtenerUsuarioPorCorreo = async (
  correo,
  incluirPassword = false
) => {
  const query = Usuario.findOne({
    correo: correo.toLowerCase(),
  });

  if (incluirPassword) {
    query.select("+passwordHash");
  }

  return await query.populate(
    "empleadoId",
    "nombres apellidos codigoEmpleado correo cargo activo"
  );
};

export const actualizarUsuario = async (id, data) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("El ID del usuario no es válido");
    error.statusCode = 400;
    throw error;
  }

  const usuario = await Usuario.findById(id);

  if (!usuario) {
    return null;
  }

  if (data.correo) {
    const correoNormalizado = data.correo.toLowerCase();

    const correoExistente = await Usuario.findOne({
      correo: correoNormalizado,
      _id: { $ne: id },
    });

    if (correoExistente) {
      const error = new Error(
        "Ya existe otro usuario con ese correo"
      );
      error.statusCode = 409;
      throw error;
    }

    usuario.correo = correoNormalizado;
  }

  if (data.empleadoId !== undefined) {
    if (data.empleadoId === null || data.empleadoId === "") {
      usuario.empleadoId = undefined;
    } else {
      if (!mongoose.Types.ObjectId.isValid(data.empleadoId)) {
        const error = new Error("El ID del empleado no es válido");
        error.statusCode = 400;
        throw error;
      }

      const empleadoExiste = await Empleado.findById(
        data.empleadoId
      );

      if (!empleadoExiste) {
        const error = new Error("El empleado indicado no existe");
        error.statusCode = 404;
        throw error;
      }

      const usuarioConEmpleado = await Usuario.findOne({
        empleadoId: data.empleadoId,
        _id: { $ne: id },
      });

      if (usuarioConEmpleado) {
        const error = new Error(
          "El empleado ya está asociado a otro usuario"
        );
        error.statusCode = 409;
        throw error;
      }

      usuario.empleadoId = data.empleadoId;
    }
  }

  if (data.password) {
    if (data.password.length < 6) {
      const error = new Error(
        "La contraseña debe tener al menos 6 caracteres"
      );
      error.statusCode = 400;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    usuario.passwordHash = await bcrypt.hash(
      data.password,
      salt
    );
  }

  if (data.nombre !== undefined) {
    usuario.nombre = data.nombre;
  }

  if (data.rol !== undefined) {
    usuario.rol = data.rol;
  }

  if (data.activo !== undefined) {
    usuario.activo = data.activo;
  }

  await usuario.save();

  return await Usuario.findById(usuario._id).populate(
    "empleadoId",
    "nombres apellidos codigoEmpleado correo cargo activo"
  );
};

export const cambiarEstadoUsuario = async (id, activo) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("El ID del usuario no es válido");
    error.statusCode = 400;
    throw error;
  }

  if (typeof activo !== "boolean") {
    const error = new Error(
      "El campo activo debe ser verdadero o falso"
    );
    error.statusCode = 400;
    throw error;
  }

  return await Usuario.findByIdAndUpdate(
    id,
    { activo },
    {
      new: true,
      runValidators: true,
    }
  ).populate(
    "empleadoId",
    "nombres apellidos codigoEmpleado correo cargo activo"
  );
};

export const actualizarUltimoAcceso = async (id) => {
  return await Usuario.findByIdAndUpdate(
    id,
    {
      ultimoAcceso: new Date(),
    },
    {
      new: true,
    }
  );
};

export const eliminarUsuario = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("El ID del usuario no es válido");
    error.statusCode = 400;
    throw error;
  }

  return await Usuario.findByIdAndDelete(id);
};
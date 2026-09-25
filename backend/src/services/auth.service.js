import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as usuarioService from "./usuario.service.js";

const generarToken = (usuario) => {
  if (!process.env.JWT_SECRET) {
    const error = new Error(
      "JWT_SECRET no está configurado"
    );

    error.statusCode = 500;

    throw error;
  }

  return jwt.sign(
    {
      id: usuario._id.toString(),
      rol: usuario.rol,
    },
    process.env.JWT_SECRET,
    {
      expiresIn:
        process.env.JWT_EXPIRES_IN || "8h",
    }
  );
};

export const iniciarSesion = async (
  correo,
  password
) => {
  if (!correo || !password) {
    const error = new Error(
      "Correo y contraseña son obligatorios"
    );

    error.statusCode = 400;

    throw error;
  }

  const usuario =
    await usuarioService.obtenerUsuarioPorCorreo(
      correo,
      true
    );

  if (!usuario) {
    const error = new Error(
      "Correo o contraseña incorrectos"
    );

    error.statusCode = 401;

    throw error;
  }

  if (!usuario.activo) {
    const error = new Error(
      "El usuario se encuentra desactivado"
    );

    error.statusCode = 403;

    throw error;
  }

  const passwordCorrecto = await bcrypt.compare(
    password,
    usuario.passwordHash
  );

  if (!passwordCorrecto) {
    const error = new Error(
      "Correo o contraseña incorrectos"
    );

    error.statusCode = 401;

    throw error;
  }

  await usuarioService.actualizarUltimoAcceso(
    usuario._id
  );

  const token = generarToken(usuario);

  const usuarioSeguro = usuario.toObject();

  delete usuarioSeguro.passwordHash;

  usuarioSeguro.ultimoAcceso = new Date();

  return {
    usuario: usuarioSeguro,
    token,
  };
};
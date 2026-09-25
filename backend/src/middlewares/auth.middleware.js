import jwt from "jsonwebtoken";
import Usuario from "../models/usuario.model.js";

export const autenticar = async (req, res, next) => {
  try {
    let token = null;

    const authorization = req.headers.authorization;

    if (
      authorization &&
      authorization.startsWith("Bearer ")
    ) {
      token = authorization.split(" ")[1];
    }

    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No autenticado. Debe iniciar sesión",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error(
        "JWT_SECRET no está configurado en las variables de entorno"
      );
    }

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token inválido o expirado",
      });
    }

    const usuario = await Usuario.findById(
      decoded.id
    ).populate(
      "empleadoId",
      "nombres apellidos codigoEmpleado correo cargo activo"
    );

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: "El usuario asociado al token ya no existe",
      });
    }

    if (!usuario.activo) {
      return res.status(403).json({
        success: false,
        message: "El usuario se encuentra desactivado",
      });
    }

    req.usuario = usuario;

    next();
  } catch (error) {
    next(error);
  }
};
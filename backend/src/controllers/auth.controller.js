import * as authService from "../services/auth.service.js";

const obtenerOpcionesCookie = () => {
  const produccion =
    process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: produccion,
    sameSite: produccion ? "none" : "lax",
    maxAge: 8 * 60 * 60 * 1000,
  };
};

export const login = async (req, res, next) => {
  try {
    const { correo, password } = req.body;

    const resultado =
      await authService.iniciarSesion(
        correo,
        password
      );

    res.cookie(
      "token",
      resultado.token,
      obtenerOpcionesCookie()
    );

    return res.status(200).json({
      success: true,
      message: "Inicio de sesión exitoso",
      data: resultado,
    });
  } catch (error) {
    next(error);
  }
};

export const obtenerPerfil = async (
  req,
  res,
  next
) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Usuario autenticado",
      data: req.usuario,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req,
  res,
  next
) => {
  try {
    const produccion =
      process.env.NODE_ENV === "production";

    res.clearCookie("token", {
      httpOnly: true,
      secure: produccion,
      sameSite: produccion
        ? "none"
        : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Sesión cerrada correctamente",
    });
  } catch (error) {
    next(error);
  }
};
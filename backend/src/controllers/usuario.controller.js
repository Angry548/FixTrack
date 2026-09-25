import * as usuarioService from "../services/usuario.service.js";

export const crear = async (req, res, next) => {
  try {
    const usuario = await usuarioService.crearUsuario(req.body);

    return res.status(201).json({
      success: true,
      message: "Usuario creado correctamente",
      data: usuario,
    });
  } catch (error) {
    next(error);
  }
};

export const obtenerTodos = async (req, res, next) => {
  try {
    const usuarios = await usuarioService.obtenerUsuarios();

    return res.status(200).json({
      success: true,
      message: "Usuarios obtenidos correctamente",
      count: usuarios.length,
      data: usuarios,
    });
  } catch (error) {
    next(error);
  }
};

export const obtenerPorId = async (req, res, next) => {
  try {
    const usuario = await usuarioService.obtenerUsuarioPorId(
      req.params.id
    );

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Usuario obtenido correctamente",
      data: usuario,
    });
  } catch (error) {
    next(error);
  }
};

export const actualizar = async (req, res, next) => {
  try {
    const usuario = await usuarioService.actualizarUsuario(
      req.params.id,
      req.body
    );

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Usuario actualizado correctamente",
      data: usuario,
    });
  } catch (error) {
    next(error);
  }
};

export const cambiarEstado = async (req, res, next) => {
  try {
    const { activo } = req.body;

    const usuario = await usuarioService.cambiarEstadoUsuario(
      req.params.id,
      activo
    );

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: activo
        ? "Usuario activado correctamente"
        : "Usuario desactivado correctamente",
      data: usuario,
    });
  } catch (error) {
    next(error);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    const usuario = await usuarioService.eliminarUsuario(
      req.params.id
    );

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Usuario eliminado correctamente",
      data: usuario,
    });
  } catch (error) {
    next(error);
  }
};
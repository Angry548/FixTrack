import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import Usuario from "../models/usuario.model.js";
import Empleado from "../models/empleado.model.js";

const escaparRegex = (
  texto = ""
) => {
  return texto.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

const normalizarTexto = (
  valor
) => {
  if (
    typeof valor !== "string"
  ) {
    return "";
  }

  return valor.trim();
};

const obtenerPaginaValida = (
  page
) => {
  if (
    page === undefined ||
    page === null ||
    page === ""
  ) {
    return null;
  }

  const pagina =
    Number(page);

  if (
    !Number.isInteger(
      pagina
    ) ||
    pagina <= 0
  ) {
    const error =
      new Error(
        "La página debe ser un número entero mayor que 0"
      );

    error.statusCode = 400;

    throw error;
  }

  return pagina;
};

const obtenerLimiteValido = (
  limit
) => {
  if (
    limit === undefined ||
    limit === null ||
    limit === ""
  ) {
    return null;
  }

  const limite =
    Number(limit);

  if (
    !Number.isInteger(
      limite
    ) ||
    limite <= 0
  ) {
    const error =
      new Error(
        "El límite debe ser un número entero mayor que 0"
      );

    error.statusCode = 400;

    throw error;
  }

  return Math.min(
    limite,
    50
  );
};

const obtenerActivoValido = (
  activo
) => {
  if (
    activo === undefined ||
    activo === null ||
    activo === ""
  ) {
    return null;
  }

  if (
    activo === true ||
    activo === "true"
  ) {
    return true;
  }

  if (
    activo === false ||
    activo === "false"
  ) {
    return false;
  }

  const error =
    new Error(
      "El filtro activo debe ser true o false"
    );

  error.statusCode = 400;

  throw error;
};

const validarRol = (
  rol
) => {
  if (!rol) {
    return null;
  }

  const rolesPermitidos = [
    "administrador",
    "inventario",
    "tecnico",
    "consulta",
  ];

  if (
    !rolesPermitidos.includes(
      rol
    )
  ) {
    const error =
      new Error(
        "El rol debe ser administrador, inventario, tecnico o consulta"
      );

    error.statusCode = 400;

    throw error;
  }

  return rol;
};

const poblarUsuario = (
  consulta
) => {
  return consulta.populate(
    "empleadoId",
    "nombres apellidos codigoEmpleado correo cargo activo"
  );
};

export const crearUsuario = async (
  data
) => {
  const {
    nombre,
    correo,
    password,
    rol,
    empleadoId,
    activo = true,
  } = data;

  if (
    !nombre ||
    !nombre.trim()
  ) {
    const error =
      new Error(
        "El nombre del usuario es obligatorio"
      );

    error.statusCode = 400;

    throw error;
  }

  if (
    !correo ||
    !correo.trim()
  ) {
    const error =
      new Error(
        "El correo es obligatorio"
      );

    error.statusCode = 400;

    throw error;
  }

  if (rol) {
    validarRol(
      rol
    );
  }

  const correoNormalizado =
    correo
      .trim()
      .toLowerCase();

  const usuarioExistente =
    await Usuario.findOne({
      correo:
        correoNormalizado,
    });

  if (
    usuarioExistente
  ) {
    const error =
      new Error(
        "Ya existe un usuario con ese correo"
      );

    error.statusCode = 409;

    throw error;
  }

  if (empleadoId) {
    if (
      !mongoose.Types.ObjectId.isValid(
        empleadoId
      )
    ) {
      const error =
        new Error(
          "El ID del empleado no es válido"
        );

      error.statusCode = 400;

      throw error;
    }

    const empleadoExiste =
      await Empleado.findById(
        empleadoId
      );

    if (
      !empleadoExiste
    ) {
      const error =
        new Error(
          "El empleado indicado no existe"
        );

      error.statusCode = 404;

      throw error;
    }

    const usuarioConEmpleado =
      await Usuario.findOne({
        empleadoId,
      });

    if (
      usuarioConEmpleado
    ) {
      const error =
        new Error(
          "El empleado ya está asociado a otro usuario"
        );

      error.statusCode = 409;

      throw error;
    }
  }

  if (
    !password ||
    password.length < 6
  ) {
    const error =
      new Error(
        "La contraseña debe tener al menos 6 caracteres"
      );

    error.statusCode = 400;

    throw error;
  }

  const salt =
    await bcrypt.genSalt(
      10
    );

  const passwordHash =
    await bcrypt.hash(
      password,
      salt
    );

  const nuevoUsuario =
    new Usuario({
      nombre:
        nombre.trim(),

      correo:
        correoNormalizado,

      passwordHash,

      rol:
        rol || "consulta",

      empleadoId:
        empleadoId ||
        undefined,

      activo,
    });

  const guardado =
    await nuevoUsuario.save();

  return await poblarUsuario(
    Usuario.findById(
      guardado._id
    )
  );
};

export const obtenerUsuarios = async ({
  nombre = "",
  correo = "",
  rol = "",
  empleadoId = "",
  activo = "",
  search = "",
  page,
  limit,
} = {}) => {
  const filtro = {};

  const nombreLimpio =
    normalizarTexto(
      nombre
    );

  const correoLimpio =
    normalizarTexto(
      correo
    );

  const rolLimpio =
    normalizarTexto(
      rol
    );

  const empleadoIdLimpio =
    normalizarTexto(
      empleadoId
    );

  const busquedaGeneral =
    normalizarTexto(
      search
    );

  const activoValido =
    obtenerActivoValido(
      activo
    );

  if (nombreLimpio) {
    filtro.nombre = {
      $regex:
        escaparRegex(
          nombreLimpio
        ),
      $options: "i",
    };
  }

  if (correoLimpio) {
    filtro.correo = {
      $regex:
        escaparRegex(
          correoLimpio
        ),
      $options: "i",
    };
  }

  if (rolLimpio) {
    filtro.rol =
      validarRol(
        rolLimpio
      );
  }

  if (empleadoIdLimpio) {
    if (
      !mongoose.Types.ObjectId.isValid(
        empleadoIdLimpio
      )
    ) {
      const error =
        new Error(
          "El ID del empleado no es válido"
        );

      error.statusCode = 400;

      throw error;
    }

    filtro.empleadoId =
      empleadoIdLimpio;
  }

  if (
    activoValido !== null
  ) {
    filtro.activo =
      activoValido;
  }

  if (busquedaGeneral) {
    const textoSeguro =
      escaparRegex(
        busquedaGeneral
      );

    filtro.$or = [
      {
        nombre: {
          $regex:
            textoSeguro,
          $options: "i",
        },
      },
      {
        correo: {
          $regex:
            textoSeguro,
          $options: "i",
        },
      },
      {
        rol: {
          $regex:
            textoSeguro,
          $options: "i",
        },
      },
    ];
  }

  const pagina =
    obtenerPaginaValida(
      page
    );

  const limite =
    obtenerLimiteValido(
      limit
    );

  const paginado =
    pagina !== null ||
    limite !== null;

  const paginaFinal =
    pagina || 1;

  const limiteFinal =
    limite ||
    (paginado
      ? 10
      : null);

  if (!paginado) {
    const registros =
      await poblarUsuario(
        Usuario.find(
          filtro
        ).sort({
          createdAt: -1,
        })
      );

    return {
      registros,
      total:
        registros.length,
      page: 1,
      limit:
        registros.length,
      totalPages: 1,
      paginado: false,
    };
  }

  const total =
    await Usuario.countDocuments(
      filtro
    );

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        total /
          limiteFinal
      )
    );

  const salto =
    (paginaFinal - 1) *
    limiteFinal;

  const registros =
    await poblarUsuario(
      Usuario.find(
        filtro
      )
        .sort({
          createdAt: -1,
        })
        .skip(
          salto
        )
        .limit(
          limiteFinal
        )
    );

  return {
    registros,
    total,
    page:
      paginaFinal,
    limit:
      limiteFinal,
    totalPages,
    paginado: true,
  };
};

export const obtenerUsuarioPorId = async (
  id
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      id
    )
  ) {
    const error =
      new Error(
        "El ID del usuario no es válido"
      );

    error.statusCode = 400;

    throw error;
  }

  return await poblarUsuario(
    Usuario.findById(
      id
    )
  );
};

export const obtenerUsuarioPorCorreo = async (
  correo,
  incluirPassword = false
) => {
  const query =
    Usuario.findOne({
      correo:
        correo
          .trim()
          .toLowerCase(),
    });

  if (
    incluirPassword
  ) {
    query.select(
      "+passwordHash"
    );
  }

  return await query.populate(
    "empleadoId",
    "nombres apellidos codigoEmpleado correo cargo activo"
  );
};

export const actualizarUsuario = async (
  id,
  data
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      id
    )
  ) {
    const error =
      new Error(
        "El ID del usuario no es válido"
      );

    error.statusCode = 400;

    throw error;
  }

  const usuario =
    await Usuario.findById(
      id
    );

  if (!usuario) {
    return null;
  }

  if (
    data.correo !==
    undefined
  ) {
    if (
      !data.correo ||
      !data.correo.trim()
    ) {
      const error =
        new Error(
          "El correo es obligatorio"
        );

      error.statusCode = 400;

      throw error;
    }

    const correoNormalizado =
      data.correo
        .trim()
        .toLowerCase();

    const correoExistente =
      await Usuario.findOne({
        correo:
          correoNormalizado,

        _id: {
          $ne: id,
        },
      });

    if (
      correoExistente
    ) {
      const error =
        new Error(
          "Ya existe otro usuario con ese correo"
        );

      error.statusCode = 409;

      throw error;
    }

    usuario.correo =
      correoNormalizado;
  }

  if (
    data.empleadoId !==
    undefined
  ) {
    if (
      data.empleadoId ===
        null ||
      data.empleadoId ===
        ""
    ) {
      usuario.empleadoId =
        undefined;
    } else {
      if (
        !mongoose.Types.ObjectId.isValid(
          data.empleadoId
        )
      ) {
        const error =
          new Error(
            "El ID del empleado no es válido"
          );

        error.statusCode = 400;

        throw error;
      }

      const empleadoExiste =
        await Empleado.findById(
          data.empleadoId
        );

      if (
        !empleadoExiste
      ) {
        const error =
          new Error(
            "El empleado indicado no existe"
          );

        error.statusCode = 404;

        throw error;
      }

      const usuarioConEmpleado =
        await Usuario.findOne({
          empleadoId:
            data.empleadoId,

          _id: {
            $ne: id,
          },
        });

      if (
        usuarioConEmpleado
      ) {
        const error =
          new Error(
            "El empleado ya está asociado a otro usuario"
          );

        error.statusCode = 409;

        throw error;
      }

      usuario.empleadoId =
        data.empleadoId;
    }
  }

  if (data.password) {
    if (
      data.password.length <
      6
    ) {
      const error =
        new Error(
          "La contraseña debe tener al menos 6 caracteres"
        );

      error.statusCode = 400;

      throw error;
    }

    const salt =
      await bcrypt.genSalt(
        10
      );

    usuario.passwordHash =
      await bcrypt.hash(
        data.password,
        salt
      );
  }

  if (
    data.nombre !==
    undefined
  ) {
    if (
      !data.nombre ||
      !data.nombre.trim()
    ) {
      const error =
        new Error(
          "El nombre del usuario es obligatorio"
        );

      error.statusCode = 400;

      throw error;
    }

    usuario.nombre =
      data.nombre.trim();
  }

  if (
    data.rol !==
    undefined
  ) {
    usuario.rol =
      validarRol(
        data.rol
      );
  }

  if (
    data.activo !==
    undefined
  ) {
    if (
      typeof data.activo !==
      "boolean"
    ) {
      const error =
        new Error(
          "El campo activo debe ser verdadero o falso"
        );

      error.statusCode = 400;

      throw error;
    }

    usuario.activo =
      data.activo;
  }

  await usuario.save();

  return await poblarUsuario(
    Usuario.findById(
      usuario._id
    )
  );
};

export const cambiarEstadoUsuario = async (
  id,
  activo
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      id
    )
  ) {
    const error =
      new Error(
        "El ID del usuario no es válido"
      );

    error.statusCode = 400;

    throw error;
  }

  if (
    typeof activo !==
    "boolean"
  ) {
    const error =
      new Error(
        "El campo activo debe ser verdadero o falso"
      );

    error.statusCode = 400;

    throw error;
  }

  return await poblarUsuario(
    Usuario.findByIdAndUpdate(
      id,
      {
        activo,
      },
      {
        new: true,
        runValidators: true,
      }
    )
  );
};

export const actualizarUltimoAcceso = async (
  id
) => {
  return await Usuario.findByIdAndUpdate(
    id,
    {
      ultimoAcceso:
        new Date(),
    },
    {
      new: true,
    }
  );
};

export const eliminarUsuario = async (
  id
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      id
    )
  ) {
    const error =
      new Error(
        "El ID del usuario no es válido"
      );

    error.statusCode = 400;

    throw error;
  }

  return await Usuario.findByIdAndDelete(
    id
  );
};
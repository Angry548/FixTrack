import mongoose from "mongoose";
import Proveedor from "../models/proveedor.model.js";

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

export const crearProveedor = async (
  data
) => {
  const nuevoProveedor =
    new Proveedor(data);

  return await nuevoProveedor.save();
};

export const obtenerProveedores = async ({
  nombre = "",
  nitORuc = "",
  correo = "",
  telefono = "",
  direccion = "",
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

  const nitLimpio =
    normalizarTexto(
      nitORuc
    );

  const correoLimpio =
    normalizarTexto(
      correo
    );

  const telefonoLimpio =
    normalizarTexto(
      telefono
    );

  const direccionLimpia =
    normalizarTexto(
      direccion
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

  if (nitLimpio) {
    filtro.nitORuc = {
      $regex:
        escaparRegex(
          nitLimpio
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

  if (telefonoLimpio) {
    filtro.telefono = {
      $regex:
        escaparRegex(
          telefonoLimpio
        ),
      $options: "i",
    };
  }

  if (direccionLimpia) {
    filtro.direccion = {
      $regex:
        escaparRegex(
          direccionLimpia
        ),
      $options: "i",
    };
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
        nitORuc: {
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
        telefono: {
          $regex:
            textoSeguro,
          $options: "i",
        },
      },
      {
        direccion: {
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
      await Proveedor.find(
        filtro
      ).sort({
        nombre: 1,
      });

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
    await Proveedor.countDocuments(
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
    await Proveedor.find(
      filtro
    )
      .sort({
        nombre: 1,
      })
      .skip(
        salto
      )
      .limit(
        limiteFinal
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

export const obtenerProveedorPorId = async (
  id
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      id
    )
  ) {
    const error =
      new Error(
        "El ID del proveedor no es válido"
      );

    error.statusCode = 400;

    throw error;
  }

  return await Proveedor.findById(
    id
  );
};

export const actualizarProveedor = async (
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
        "El ID del proveedor no es válido"
      );

    error.statusCode = 400;

    throw error;
  }

  return await Proveedor.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
    }
  );
};

export const eliminarProveedor = async (
  id
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      id
    )
  ) {
    const error =
      new Error(
        "El ID del proveedor no es válido"
      );

    error.statusCode = 400;

    throw error;
  }

  return await Proveedor.findByIdAndDelete(
    id
  );
};
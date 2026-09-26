import mongoose from "mongoose";
import Empresa from "../models/empresa.model.js";

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

// Convierte y valida limit.
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

const obtenerTodas = async ({
  nombre = "",
  nitORuc = "",
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

  const busquedaGeneral =
    normalizarTexto(
      search
    );

  // Filtro independiente por nombre.
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
      await Empresa.find(
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
    await Empresa.countDocuments(
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
    await Empresa.find(
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

// Obtener empresa por ID
const obtenerPorId = async (
  id
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      id
    )
  ) {
    const error =
      new Error(
        "El ID de la empresa no es válido"
      );

    error.statusCode = 400;

    throw error;
  }

  const empresa =
    await Empresa.findById(
      id
    );

  if (!empresa) {
    const error =
      new Error(
        "Empresa no encontrada"
      );

    error.statusCode = 404;

    throw error;
  }

  return empresa;
};

// Crear empresa
const crear = async (
  datosEmpresa
) => {
  const empresaExistente =
    await Empresa.findOne({
      nitORuc:
        datosEmpresa.nitORuc,
    });

  if (
    empresaExistente
  ) {
    const error =
      new Error(
        "Ya existe una empresa con ese NIT/RUC"
      );

    error.statusCode = 409;

    throw error;
  }

  const nuevaEmpresa =
    new Empresa(
      datosEmpresa
    );

  return await nuevaEmpresa.save();
};

// Actualizar empresa
const actualizar = async (
  id,
  datosEmpresa
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      id
    )
  ) {
    const error =
      new Error(
        "El ID de la empresa no es válido"
      );

    error.statusCode = 400;

    throw error;
  }

  if (
    datosEmpresa.nitORuc
  ) {
    const empresaConMismoNit =
      await Empresa.findOne({
        nitORuc:
          datosEmpresa.nitORuc,

        _id: {
          $ne: id,
        },
      });

    if (
      empresaConMismoNit
    ) {
      const error =
        new Error(
          "Ya existe otra empresa con ese NIT/RUC"
        );

      error.statusCode = 409;

      throw error;
    }
  }

  const empresaActualizada =
    await Empresa.findByIdAndUpdate(
      id,
      datosEmpresa,
      {
        new: true,
        runValidators: true,
      }
    );

  if (
    !empresaActualizada
  ) {
    const error =
      new Error(
        "Empresa no encontrada"
      );

    error.statusCode = 404;

    throw error;
  }

  return empresaActualizada;
};

// Eliminar empresa
const eliminar = async (
  id
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      id
    )
  ) {
    const error =
      new Error(
        "El ID de la empresa no es válido"
      );

    error.statusCode = 400;

    throw error;
  }

  const empresaEliminada =
    await Empresa.findByIdAndDelete(
      id
    );

  if (
    !empresaEliminada
  ) {
    const error =
      new Error(
        "Empresa no encontrada"
      );

    error.statusCode = 404;

    throw error;
  }

  return empresaEliminada;
};

export {
  obtenerTodas,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
};
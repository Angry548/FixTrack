import mongoose from "mongoose";
import CategoriaRecurso from "../models/categoriaRecurso.model.js";

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

const obtenerTodas = async ({
  nombre = "",
  descripcion = "",
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

  const descripcionLimpia =
    normalizarTexto(
      descripcion
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

  if (descripcionLimpia) {
    filtro.descripcion = {
      $regex:
        escaparRegex(
          descripcionLimpia
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
        descripcion: {
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
      await CategoriaRecurso.find(
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
    await CategoriaRecurso.countDocuments(
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
    await CategoriaRecurso.find(
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
        "El ID de la categoría no es válido"
      );

    error.statusCode = 400;

    throw error;
  }

  const categoria =
    await CategoriaRecurso.findById(
      id
    );

  if (!categoria) {
    const error =
      new Error(
        "Categoría de recurso no encontrada"
      );

    error.statusCode = 404;

    throw error;
  }

  return categoria;
};

const crear = async (
  datosCategoria
) => {
  const categoriaExistente =
    await CategoriaRecurso.findOne({
      nombre:
        datosCategoria.nombre,
    });

  if (
    categoriaExistente
  ) {
    const error =
      new Error(
        "Ya existe una categoría con ese nombre"
      );

    error.statusCode = 409;

    throw error;
  }

  const nuevaCategoria =
    new CategoriaRecurso(
      datosCategoria
    );

  return await nuevaCategoria.save();
};

const actualizar = async (
  id,
  datosCategoria
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      id
    )
  ) {
    const error =
      new Error(
        "El ID de la categoría no es válido"
      );

    error.statusCode = 400;

    throw error;
  }

  if (
    datosCategoria.nombre
  ) {
    const categoriaConMismoNombre =
      await CategoriaRecurso.findOne({
        nombre:
          datosCategoria.nombre,
        _id: {
          $ne: id,
        },
      });

    if (
      categoriaConMismoNombre
    ) {
      const error =
        new Error(
          "Ya existe otra categoría con ese nombre"
        );

      error.statusCode = 409;

      throw error;
    }
  }

  const categoriaActualizada =
    await CategoriaRecurso.findByIdAndUpdate(
      id,
      datosCategoria,
      {
        new: true,
        runValidators: true,
      }
    );

  if (
    !categoriaActualizada
  ) {
    const error =
      new Error(
        "Categoría de recurso no encontrada"
      );

    error.statusCode = 404;

    throw error;
  }

  return categoriaActualizada;
};

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
        "El ID de la categoría no es válido"
      );

    error.statusCode = 400;

    throw error;
  }

  const categoriaEliminada =
    await CategoriaRecurso.findByIdAndDelete(
      id
    );

  if (
    !categoriaEliminada
  ) {
    const error =
      new Error(
        "Categoría de recurso no encontrada"
      );

    error.statusCode = 404;

    throw error;
  }

  return categoriaEliminada;
};

export {
  obtenerTodas,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
};
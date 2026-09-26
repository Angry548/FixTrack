import mongoose from "mongoose";
import Recurso from "../models/recurso.model.js";
import CategoriaRecurso from "../models/categoriaRecurso.model.js";
import Area from "../models/area.model.js";

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

const validarObjectIdFiltro = (
  valor,
  mensaje
) => {
  if (!valor) {
    return null;
  }

  if (
    !mongoose.Types.ObjectId.isValid(
      valor
    )
  ) {
    const error =
      new Error(
        mensaje
      );

    error.statusCode = 400;

    throw error;
  }

  return valor;
};

const obtenerTodas = async ({
  nombre = "",
  codigo = "",
  descripcion = "",
  areaId = "",
  categoriaRecursoId = "",
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

  const codigoLimpio =
    normalizarTexto(
      codigo
    );

  const descripcionLimpia =
    normalizarTexto(
      descripcion
    );

  const areaIdLimpio =
    normalizarTexto(
      areaId
    );

  const categoriaIdLimpio =
    normalizarTexto(
      categoriaRecursoId
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

  if (codigoLimpio) {
    filtro.codigo = {
      $regex:
        escaparRegex(
          codigoLimpio
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

  if (areaIdLimpio) {
    filtro.areaId =
      validarObjectIdFiltro(
        areaIdLimpio,
        "El ID del área no es válido"
      );
  }

  if (categoriaIdLimpio) {
    filtro.categoriaRecursoId =
      validarObjectIdFiltro(
        categoriaIdLimpio,
        "El ID de la categoría de recurso no es válido"
      );
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
        codigo: {
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
      await Recurso.find(
        filtro
      )
        .populate(
          "areaId"
        )
        .populate(
          "categoriaRecursoId"
        )
        .sort({
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
    await Recurso.countDocuments(
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
    await Recurso.find(
      filtro
    )
      .populate(
        "areaId"
      )
      .populate(
        "categoriaRecursoId"
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
        "El ID del recurso no es válido"
      );

    error.statusCode = 400;

    throw error;
  }

  const recurso =
    await Recurso.findById(
      id
    )
      .populate(
        "areaId"
      )
      .populate(
        "categoriaRecursoId"
      );

  if (!recurso) {
    const error =
      new Error(
        "Recurso no encontrado"
      );

    error.statusCode = 404;

    throw error;
  }

  return recurso;
};

const crear = async (
  datosRecurso
) => {
  const codigoExistente =
    await Recurso.findOne({
      codigo:
        datosRecurso.codigo,
    });

  if (
    codigoExistente
  ) {
    const error =
      new Error(
        "Ya existe un recurso con ese código"
      );

    error.statusCode = 409;

    throw error;
  }

  const nombreExistente =
    await Recurso.findOne({
      nombre:
        datosRecurso.nombre,
    });

  if (
    nombreExistente
  ) {
    const error =
      new Error(
        "Ya existe un recurso con ese nombre"
      );

    error.statusCode = 409;

    throw error;
  }

  if (
    datosRecurso.areaId
  ) {
    if (
      !mongoose.Types.ObjectId.isValid(
        datosRecurso.areaId
      )
    ) {
      const error =
        new Error(
          "El ID del área no es válido"
        );

      error.statusCode = 400;

      throw error;
    }

    const areaExiste =
      await Area.findById(
        datosRecurso.areaId
      );

    if (!areaExiste) {
      const error =
        new Error(
          "El área seleccionada no existe"
        );

      error.statusCode = 404;

      throw error;
    }
  }

  if (
    datosRecurso.categoriaRecursoId
  ) {
    if (
      !mongoose.Types.ObjectId.isValid(
        datosRecurso.categoriaRecursoId
      )
    ) {
      const error =
        new Error(
          "El ID de la categoría de recurso no es válido"
        );

      error.statusCode = 400;

      throw error;
    }

    const categoriaExiste =
      await CategoriaRecurso.findById(
        datosRecurso.categoriaRecursoId
      );

    if (!categoriaExiste) {
      const error =
        new Error(
          "La categoría de recurso seleccionada no existe"
        );

      error.statusCode = 404;

      throw error;
    }
  }

  const nuevoRecurso =
    new Recurso(
      datosRecurso
    );

  const recursoGuardado =
    await nuevoRecurso.save();

  return await Recurso.findById(
    recursoGuardado._id
  )
    .populate(
      "areaId"
    )
    .populate(
      "categoriaRecursoId"
    );
};

const actualizar = async (
  id,
  datosRecurso
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      id
    )
  ) {
    const error =
      new Error(
        "El ID del recurso no es válido"
      );

    error.statusCode = 400;

    throw error;
  }

  if (
    datosRecurso.codigo
  ) {
    const recursoConMismoCodigo =
      await Recurso.findOne({
        codigo:
          datosRecurso.codigo,
        _id: {
          $ne: id,
        },
      });

    if (
      recursoConMismoCodigo
    ) {
      const error =
        new Error(
          "Ya existe otro recurso con ese código"
        );

      error.statusCode = 409;

      throw error;
    }
  }

  if (
    datosRecurso.nombre
  ) {
    const recursoConMismoNombre =
      await Recurso.findOne({
        nombre:
          datosRecurso.nombre,
        _id: {
          $ne: id,
        },
      });

    if (
      recursoConMismoNombre
    ) {
      const error =
        new Error(
          "Ya existe otro recurso con ese nombre"
        );

      error.statusCode = 409;

      throw error;
    }
  }

  if (
    datosRecurso.areaId
  ) {
    if (
      !mongoose.Types.ObjectId.isValid(
        datosRecurso.areaId
      )
    ) {
      const error =
        new Error(
          "El ID del área no es válido"
        );

      error.statusCode = 400;

      throw error;
    }

    const areaExiste =
      await Area.findById(
        datosRecurso.areaId
      );

    if (!areaExiste) {
      const error =
        new Error(
          "El área seleccionada no existe"
        );

      error.statusCode = 404;

      throw error;
    }
  }

  if (
    datosRecurso.categoriaRecursoId
  ) {
    if (
      !mongoose.Types.ObjectId.isValid(
        datosRecurso.categoriaRecursoId
      )
    ) {
      const error =
        new Error(
          "El ID de la categoría de recurso no es válido"
        );

      error.statusCode = 400;

      throw error;
    }

    const categoriaExiste =
      await CategoriaRecurso.findById(
        datosRecurso.categoriaRecursoId
      );

    if (!categoriaExiste) {
      const error =
        new Error(
          "La categoría de recurso seleccionada no existe"
        );

      error.statusCode = 404;

      throw error;
    }
  }

  const recurso =
    await Recurso.findById(
      id
    );

  if (!recurso) {
    const error =
      new Error(
        "Recurso no encontrado"
      );

    error.statusCode = 404;

    throw error;
  }

  Object.assign(
    recurso,
    datosRecurso
  );

  const recursoActualizado =
    await recurso.save();

  return await recursoActualizado.populate(
    [
      "areaId",
      "categoriaRecursoId",
    ]
  );
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
        "El ID del recurso no es válido"
      );

    error.statusCode = 400;

    throw error;
  }

  const recursoEliminado =
    await Recurso.findByIdAndDelete(
      id
    );

  if (
    !recursoEliminado
  ) {
    const error =
      new Error(
        "Recurso no encontrado"
      );

    error.statusCode = 404;

    throw error;
  }

  return recursoEliminado;
};

export {
  obtenerTodas,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
};
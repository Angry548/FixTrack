import mongoose from "mongoose";
import GrupoRecurso from "../models/grupoRecurso.model.js";
import Recurso from "../models/recurso.model.js";

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

const validarRecursosAsociados = async (
  recursosAsociados
) => {
  if (
    recursosAsociados === undefined
  ) {
    return;
  }

  if (
    !Array.isArray(
      recursosAsociados
    )
  ) {
    const error =
      new Error(
        "Los recursos asociados deben enviarse como un arreglo"
      );

    error.statusCode = 400;

    throw error;
  }

  const idsUnicos = [
    ...new Set(
      recursosAsociados.map(
        (id) =>
          String(id)
      )
    ),
  ];

  for (const id of idsUnicos) {
    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      const error =
        new Error(
          "Uno de los IDs de recursos asociados no es válido"
        );

      error.statusCode = 400;

      throw error;
    }
  }

  if (
    idsUnicos.length === 0
  ) {
    return;
  }

  const cantidadExistente =
    await Recurso.countDocuments({
      _id: {
        $in: idsUnicos,
      },
    });

  if (
    cantidadExistente !==
    idsUnicos.length
  ) {
    const error =
      new Error(
        "Uno o más recursos asociados no existen"
      );

    error.statusCode = 404;

    throw error;
  }
};

const obtenerTodas = async ({
  nombre = "",
  descripcion = "",
  recursoId = "",
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

  const recursoIdLimpio =
    normalizarTexto(
      recursoId
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

  if (recursoIdLimpio) {
    if (
      !mongoose.Types.ObjectId.isValid(
        recursoIdLimpio
      )
    ) {
      const error =
        new Error(
          "El ID del recurso no es válido"
        );

      error.statusCode = 400;

      throw error;
    }

    filtro.recursosAsociados =
      recursoIdLimpio;
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
      await GrupoRecurso.find(
        filtro
      )
        .populate(
          "recursosAsociados"
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
    await GrupoRecurso.countDocuments(
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
    await GrupoRecurso.find(
      filtro
    )
      .populate(
        "recursosAsociados"
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
        "El ID del grupo no es válido"
      );

    error.statusCode = 400;

    throw error;
  }

  const grupo =
    await GrupoRecurso.findById(
      id
    ).populate(
      "recursosAsociados"
    );

  if (!grupo) {
    const error =
      new Error(
        "Grupo de recursos no encontrado"
      );

    error.statusCode = 404;

    throw error;
  }

  return grupo;
};

const crear = async (
  datosGrupo
) => {
  const grupoExistente =
    await GrupoRecurso.findOne({
      nombre:
        datosGrupo.nombre,
    });

  if (grupoExistente) {
    const error =
      new Error(
        "Ya existe un grupo con ese nombre"
      );

    error.statusCode = 409;

    throw error;
  }

  await validarRecursosAsociados(
    datosGrupo.recursosAsociados
  );

  const nuevoGrupo =
    new GrupoRecurso(
      datosGrupo
    );

  const grupoGuardado =
    await nuevoGrupo.save();

  return await GrupoRecurso.findById(
    grupoGuardado._id
  ).populate(
    "recursosAsociados"
  );
};

const actualizar = async (
  id,
  datosGrupo
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      id
    )
  ) {
    const error =
      new Error(
        "El ID del grupo no es válido"
      );

    error.statusCode = 400;

    throw error;
  }

  if (datosGrupo.nombre) {
    const grupoConMismoNombre =
      await GrupoRecurso.findOne({
        nombre:
          datosGrupo.nombre,
        _id: {
          $ne: id,
        },
      });

    if (
      grupoConMismoNombre
    ) {
      const error =
        new Error(
          "Ya existe otro grupo con ese nombre"
        );

      error.statusCode = 409;

      throw error;
    }
  }

  await validarRecursosAsociados(
    datosGrupo.recursosAsociados
  );

  const grupoActualizado =
    await GrupoRecurso.findByIdAndUpdate(
      id,
      datosGrupo,
      {
        new: true,
        runValidators: true,
      }
    ).populate(
      "recursosAsociados"
    );

  if (!grupoActualizado) {
    const error =
      new Error(
        "Grupo de recursos no encontrado"
      );

    error.statusCode = 404;

    throw error;
  }

  return grupoActualizado;
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
        "El ID del grupo no es válido"
      );

    error.statusCode = 400;

    throw error;
  }

  const grupoEliminado =
    await GrupoRecurso.findByIdAndDelete(
      id
    );

  if (!grupoEliminado) {
    const error =
      new Error(
        "Grupo de recursos no encontrado"
      );

    error.statusCode = 404;

    throw error;
  }

  return grupoEliminado;
};

export {
  obtenerTodas,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
};
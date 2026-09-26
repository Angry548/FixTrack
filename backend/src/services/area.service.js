import mongoose from "mongoose";
import Area from "../models/area.model.js";
import Departamento from "../models/departamento.model.js";

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

const obtenerTodas = async ({
  nombre = "",
  descripcion = "",
  ubicacion = "",
  departamentoId = "",
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

  const ubicacionLimpia =
    normalizarTexto(
      ubicacion
    );

  const departamentoIdLimpio =
    normalizarTexto(
      departamentoId
    );

  const busquedaGeneral =
    normalizarTexto(
      search
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

  if (ubicacionLimpia) {
    filtro.ubicacion = {
      $regex:
        escaparRegex(
          ubicacionLimpia
        ),
      $options: "i",
    };
  }

  if (departamentoIdLimpio) {
    if (
      !mongoose.Types.ObjectId.isValid(
        departamentoIdLimpio
      )
    ) {
      const error =
        new Error(
          "El ID del departamento no es válido"
        );

      error.statusCode = 400;

      throw error;
    }

    filtro.departamentoId =
      departamentoIdLimpio;
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
      {
        ubicacion: {
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
      await Area.find(
        filtro
      )
        .populate(
          "departamentoId",
          "nombre descripcion empresaId"
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
    await Area.countDocuments(
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
    await Area.find(
      filtro
    )
      .populate(
        "departamentoId",
        "nombre descripcion empresaId"
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
        "El ID del área no es válido"
      );

    error.statusCode = 400;

    throw error;
  }

  const area =
    await Area.findById(
      id
    ).populate(
      "departamentoId",
      "nombre descripcion empresaId"
    );

  if (!area) {
    const error =
      new Error(
        "Área no encontrada"
      );

    error.statusCode = 404;

    throw error;
  }

  return area;
};

const crear = async (
  datosArea
) => {
  const {
    departamentoId,
  } = datosArea;

  if (
    !mongoose.Types.ObjectId.isValid(
      departamentoId
    )
  ) {
    const error =
      new Error(
        "El ID del departamento no es válido"
      );

    error.statusCode = 400;

    throw error;
  }

  const departamentoExiste =
    await Departamento.findById(
      departamentoId
    );

  if (!departamentoExiste) {
    const error =
      new Error(
        "No se puede crear el área porque el departamento no existe"
      );

    error.statusCode = 404;

    throw error;
  }

  const nuevaArea =
    new Area(
      datosArea
    );

  const areaGuardada =
    await nuevaArea.save();

  return await Area.findById(
    areaGuardada._id
  ).populate(
    "departamentoId",
    "nombre descripcion empresaId"
  );
};

const actualizar = async (
  id,
  datosArea
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      id
    )
  ) {
    const error =
      new Error(
        "El ID del área no es válido"
      );

    error.statusCode = 400;

    throw error;
  }

  if (
    datosArea.departamentoId
  ) {
    if (
      !mongoose.Types.ObjectId.isValid(
        datosArea.departamentoId
      )
    ) {
      const error =
        new Error(
          "El ID del departamento no es válido"
        );

      error.statusCode = 400;

      throw error;
    }

    const departamentoExiste =
      await Departamento.findById(
        datosArea.departamentoId
      );

    if (!departamentoExiste) {
      const error =
        new Error(
          "No se puede actualizar el área porque el departamento no existe"
        );

      error.statusCode = 404;

      throw error;
    }
  }

  const areaActualizada =
    await Area.findByIdAndUpdate(
      id,
      datosArea,
      {
        new: true,
        runValidators: true,
      }
    ).populate(
      "departamentoId",
      "nombre descripcion empresaId"
    );

  if (!areaActualizada) {
    const error =
      new Error(
        "Área no encontrada"
      );

    error.statusCode = 404;

    throw error;
  }

  return areaActualizada;
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
        "El ID del área no es válido"
      );

    error.statusCode = 400;

    throw error;
  }

  const areaEliminada =
    await Area.findByIdAndDelete(
      id
    );

  if (!areaEliminada) {
    const error =
      new Error(
        "Área no encontrada"
      );

    error.statusCode = 404;

    throw error;
  }

  return areaEliminada;
};

const obtenerPorDepartamento = async (
  departamentoId
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      departamentoId
    )
  ) {
    const error =
      new Error(
        "El ID del departamento no es válido"
      );

    error.statusCode = 400;

    throw error;
  }

  const departamentoExiste =
    await Departamento.findById(
      departamentoId
    );

  if (!departamentoExiste) {
    const error =
      new Error(
        "Departamento no encontrado"
      );

    error.statusCode = 404;

    throw error;
  }

  return await Area.find({
    departamentoId,
  })
    .populate(
      "departamentoId",
      "nombre descripcion empresaId"
    )
    .sort({
      nombre: 1,
    });
};

export {
  obtenerTodas,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  obtenerPorDepartamento,
};
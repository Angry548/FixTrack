import mongoose from "mongoose";
import Departamento from "../models/departamento.model.js";
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

// Validar page.
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

// Validar limit.
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

  // Protección para evitar
  // consultas demasiado grandes.
  return Math.min(
    limite,
    50
  );
};

const obtenerTodos = async ({
  nombre = "",
  descripcion = "",
  empresaId = "",
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

  const empresaIdLimpio =
    normalizarTexto(
      empresaId
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

  if (empresaIdLimpio) {
    if (
      !mongoose.Types.ObjectId.isValid(
        empresaIdLimpio
      )
    ) {
      const error =
        new Error(
          "El ID de la empresa no es válido"
        );

      error.statusCode = 400;

      throw error;
    }

    filtro.empresaId =
      empresaIdLimpio;
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
      await Departamento.find(
        filtro
      )
        .populate(
          "empresaId",
          "nombre nitORuc"
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
    await Departamento.countDocuments(
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
    await Departamento.find(
      filtro
    )
      .populate(
        "empresaId",
        "nombre nitORuc"
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

// Obtener departamento por ID.
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
        "El ID del departamento no es válido"
      );

    error.statusCode = 400;

    throw error;
  }

  const departamento =
    await Departamento.findById(
      id
    ).populate(
      "empresaId",
      "nombre nitORuc"
    );

  if (!departamento) {
    const error =
      new Error(
        "Departamento no encontrado"
      );

    error.statusCode = 404;

    throw error;
  }

  return departamento;
};

// Crear departamento.
const crear = async (
  datosDepartamento
) => {
  const {
    empresaId,
  } = datosDepartamento;

  // Validar formato
  // del ObjectId.
  if (
    !mongoose.Types.ObjectId.isValid(
      empresaId
    )
  ) {
    const error =
      new Error(
        "El ID de la empresa no es válido"
      );

    error.statusCode = 400;

    throw error;
  }

  // Comprobar que la
  // empresa exista.
  const empresaExiste =
    await Empresa.findById(
      empresaId
    );

  if (!empresaExiste) {
    const error =
      new Error(
        "No se puede crear el departamento porque la empresa no existe"
      );

    error.statusCode = 404;

    throw error;
  }

  const nuevoDepartamento =
    new Departamento(
      datosDepartamento
    );

  const departamentoGuardado =
    await nuevoDepartamento.save();

  return await Departamento.findById(
    departamentoGuardado._id
  ).populate(
    "empresaId",
    "nombre nitORuc"
  );
};

// Actualizar departamento.
const actualizar = async (
  id,
  datosDepartamento
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      id
    )
  ) {
    const error =
      new Error(
        "El ID del departamento no es válido"
      );

    error.statusCode = 400;

    throw error;
  }

  // Si se intenta cambiar
  // la empresa.
  if (
    datosDepartamento.empresaId
  ) {
    if (
      !mongoose.Types.ObjectId.isValid(
        datosDepartamento.empresaId
      )
    ) {
      const error =
        new Error(
          "El ID de la empresa no es válido"
        );

      error.statusCode = 400;

      throw error;
    }

    const empresaExiste =
      await Empresa.findById(
        datosDepartamento.empresaId
      );

    if (!empresaExiste) {
      const error =
        new Error(
          "No se puede actualizar el departamento porque la empresa no existe"
        );

      error.statusCode = 404;

      throw error;
    }
  }

  const departamentoActualizado =
    await Departamento.findByIdAndUpdate(
      id,
      datosDepartamento,
      {
        new: true,
        runValidators: true,
      }
    ).populate(
      "empresaId",
      "nombre nitORuc"
    );

  if (
    !departamentoActualizado
  ) {
    const error =
      new Error(
        "Departamento no encontrado"
      );

    error.statusCode = 404;

    throw error;
  }

  return departamentoActualizado;
};

// Eliminar departamento.
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
        "El ID del departamento no es válido"
      );

    error.statusCode = 400;

    throw error;
  }

  const departamentoEliminado =
    await Departamento.findByIdAndDelete(
      id
    );

  if (
    !departamentoEliminado
  ) {
    const error =
      new Error(
        "Departamento no encontrado"
      );

    error.statusCode = 404;

    throw error;
  }

  return departamentoEliminado;
};

// Obtener departamentos
// pertenecientes a una empresa.
const obtenerPorEmpresa = async (
  empresaId
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      empresaId
    )
  ) {
    const error =
      new Error(
        "El ID de la empresa no es válido"
      );

    error.statusCode = 400;

    throw error;
  }

  const empresaExiste =
    await Empresa.findById(
      empresaId
    );

  if (!empresaExiste) {
    const error =
      new Error(
        "Empresa no encontrada"
      );

    error.statusCode = 404;

    throw error;
  }

  return await Departamento.find({
    empresaId,
  })
    .populate(
      "empresaId",
      "nombre nitORuc"
    )
    .sort({
      nombre: 1,
    });
};

export {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  obtenerPorEmpresa,
};
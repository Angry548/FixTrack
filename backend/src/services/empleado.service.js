import mongoose from "mongoose";
import Empleado from "../models/empleado.model.js";
import Area from "../models/area.model.js";
import Recurso from "../models/recurso.model.js";
import Usuario from "../models/usuario.model.js";

const escaparRegex = (texto = "") => {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const normalizarTexto = (valor) => {
  if (typeof valor !== "string") {
    return "";
  }

  return valor.trim();
};

const obtenerPaginaValida = (page) => {
  if (page === undefined || page === null || page === "") {
    return null;
  }

  const pagina = Number(page);

  if (!Number.isInteger(pagina) || pagina <= 0) {
    const error = new Error(
      "La página debe ser un número entero mayor que 0"
    );
    error.statusCode = 400;
    throw error;
  }

  return pagina;
};

const obtenerLimiteValido = (limit) => {
  if (limit === undefined || limit === null || limit === "") {
    return null;
  }

  const limite = Number(limit);

  if (!Number.isInteger(limite) || limite <= 0) {
    const error = new Error(
      "El límite debe ser un número entero mayor que 0"
    );
    error.statusCode = 400;
    throw error;
  }

  return Math.min(limite, 50);
};

const obtenerActivoValido = (activo) => {
  if (activo === undefined || activo === null || activo === "") {
    return null;
  }

  if (activo === true || activo === "true") {
    return true;
  }

  if (activo === false || activo === "false") {
    return false;
  }

  const error = new Error(
    "El filtro activo debe ser true o false"
  );
  error.statusCode = 400;
  throw error;
};

const obtenerSoloTecnicosValido = (soloTecnicos) => {
  if (
    soloTecnicos === undefined ||
    soloTecnicos === null ||
    soloTecnicos === ""
  ) {
    return false;
  }

  if (soloTecnicos === true || soloTecnicos === "true") {
    return true;
  }

  if (soloTecnicos === false || soloTecnicos === "false") {
    return false;
  }

  const error = new Error(
    "El filtro soloTecnicos debe ser true o false"
  );
  error.statusCode = 400;
  throw error;
};

const validarObjectIdFiltro = (valor, mensaje) => {
  if (!valor) {
    return null;
  }

  if (!mongoose.Types.ObjectId.isValid(valor)) {
    const error = new Error(mensaje);
    error.statusCode = 400;
    throw error;
  }

  return valor;
};

const obtenerIdsTecnicosActivos = async () => {
  const usuariosTecnicos = await Usuario.find({
    rol: "tecnico",
    activo: true,
    empleadoId: {
      $ne: null,
    },
  }).select("empleadoId");

  return usuariosTecnicos
    .filter((usuario) => usuario.empleadoId)
    .map((usuario) => usuario.empleadoId);
};

const poblarEmpleado = (consulta) => {
  return consulta
    .populate(
      "areaId",
      "nombre ubicacion departamentoId"
    )
    .populate(
      "asignaciones.recursoId",
      "nombre codigo existenciaTotal cantidadPrestada cantidadEnReparacion cantidadDesecho activo"
    );
};

const obtenerTodos = async ({
  nombres = "",
  apellidos = "",
  codigoEmpleado = "",
  correo = "",
  telefono = "",
  cargo = "",
  areaId = "",
  activo = "",
  soloTecnicos = "",
  search = "",
  page,
  limit,
} = {}) => {
  const filtro = {};

  const nombresLimpios = normalizarTexto(nombres);
  const apellidosLimpios = normalizarTexto(apellidos);
  const codigoLimpio = normalizarTexto(codigoEmpleado);
  const correoLimpio = normalizarTexto(correo);
  const telefonoLimpio = normalizarTexto(telefono);
  const cargoLimpio = normalizarTexto(cargo);
  const areaIdLimpio = normalizarTexto(areaId);
  const busquedaGeneral = normalizarTexto(search);

  const activoValido = obtenerActivoValido(activo);
  const soloTecnicosValido =
    obtenerSoloTecnicosValido(soloTecnicos);

  if (nombresLimpios) {
    filtro.nombres = {
      $regex: escaparRegex(nombresLimpios),
      $options: "i",
    };
  }

  if (apellidosLimpios) {
    filtro.apellidos = {
      $regex: escaparRegex(apellidosLimpios),
      $options: "i",
    };
  }

  if (codigoLimpio) {
    filtro.codigoEmpleado = {
      $regex: escaparRegex(codigoLimpio),
      $options: "i",
    };
  }

  if (correoLimpio) {
    filtro.correo = {
      $regex: escaparRegex(correoLimpio),
      $options: "i",
    };
  }

  if (telefonoLimpio) {
    filtro.telefono = {
      $regex: escaparRegex(telefonoLimpio),
      $options: "i",
    };
  }

  if (cargoLimpio) {
    filtro.cargo = {
      $regex: escaparRegex(cargoLimpio),
      $options: "i",
    };
  }

  if (areaIdLimpio) {
    filtro.areaId = validarObjectIdFiltro(
      areaIdLimpio,
      "El ID del área no es válido"
    );
  }

  if (activoValido !== null) {
    filtro.activo = activoValido;
  }

  if (soloTecnicosValido) {
    const idsTecnicos = await obtenerIdsTecnicosActivos();

    filtro._id = {
      $in: idsTecnicos,
    };
  }

  if (busquedaGeneral) {
    const textoSeguro = escaparRegex(busquedaGeneral);

    filtro.$or = [
      {
        nombres: {
          $regex: textoSeguro,
          $options: "i",
        },
      },
      {
        apellidos: {
          $regex: textoSeguro,
          $options: "i",
        },
      },
      {
        codigoEmpleado: {
          $regex: textoSeguro,
          $options: "i",
        },
      },
      {
        correo: {
          $regex: textoSeguro,
          $options: "i",
        },
      },
      {
        cargo: {
          $regex: textoSeguro,
          $options: "i",
        },
      },
    ];
  }

  const pagina = obtenerPaginaValida(page);
  const limite = obtenerLimiteValido(limit);

  const paginado =
    pagina !== null ||
    limite !== null;

  const paginaFinal = pagina || 1;
  const limiteFinal =
    limite ||
    (paginado ? 10 : null);

  if (!paginado) {
    const registros = await poblarEmpleado(
      Empleado.find(filtro).sort({
        apellidos: 1,
        nombres: 1,
      })
    );

    return {
      registros,
      total: registros.length,
      page: 1,
      limit: registros.length,
      totalPages: 1,
      paginado: false,
    };
  }

  const total =
    await Empleado.countDocuments(filtro);

  const totalPages = Math.max(
    1,
    Math.ceil(total / limiteFinal)
  );

  const salto =
    (paginaFinal - 1) *
    limiteFinal;

  const registros = await poblarEmpleado(
    Empleado.find(filtro)
      .sort({
        apellidos: 1,
        nombres: 1,
      })
      .skip(salto)
      .limit(limiteFinal)
  );

  return {
    registros,
    total,
    page: paginaFinal,
    limit: limiteFinal,
    totalPages,
    paginado: true,
  };
};

const obtenerPorId = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(
      "El ID del empleado no es válido"
    );
    error.statusCode = 400;
    throw error;
  }

  const empleado = await poblarEmpleado(
    Empleado.findById(id)
  );

  if (!empleado) {
    const error = new Error(
      "Empleado no encontrado"
    );
    error.statusCode = 404;
    throw error;
  }

  return empleado;
};

const crear = async (datosEmpleado) => {
  const {
    areaId,
    codigoEmpleado,
    correo,
  } = datosEmpleado;

  if (!mongoose.Types.ObjectId.isValid(areaId)) {
    const error = new Error(
      "El ID del área no es válido"
    );
    error.statusCode = 400;
    throw error;
  }

  const areaExiste =
    await Area.findById(areaId);

  if (!areaExiste) {
    const error = new Error(
      "No se puede crear el empleado porque el área no existe"
    );
    error.statusCode = 404;
    throw error;
  }

  const codigoExistente =
    await Empleado.findOne({
      codigoEmpleado,
    });

  if (codigoExistente) {
    const error = new Error(
      "Ya existe un empleado con ese código"
    );
    error.statusCode = 409;
    throw error;
  }

  const correoExistente =
    await Empleado.findOne({
      correo,
    });

  if (correoExistente) {
    const error = new Error(
      "Ya existe un empleado con ese correo"
    );
    error.statusCode = 409;
    throw error;
  }

  const nuevoEmpleado =
    new Empleado(datosEmpleado);

  const empleadoGuardado =
    await nuevoEmpleado.save();

  return await poblarEmpleado(
    Empleado.findById(
      empleadoGuardado._id
    )
  );
};

const actualizar = async (
  id,
  datosEmpleado
) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(
      "El ID del empleado no es válido"
    );
    error.statusCode = 400;
    throw error;
  }

  if (datosEmpleado.areaId) {
    if (
      !mongoose.Types.ObjectId.isValid(
        datosEmpleado.areaId
      )
    ) {
      const error = new Error(
        "El ID del área no es válido"
      );
      error.statusCode = 400;
      throw error;
    }

    const areaExiste =
      await Area.findById(
        datosEmpleado.areaId
      );

    if (!areaExiste) {
      const error = new Error(
        "El área indicada no existe"
      );
      error.statusCode = 404;
      throw error;
    }
  }

  if (datosEmpleado.codigoEmpleado) {
    const codigoExistente =
      await Empleado.findOne({
        codigoEmpleado:
          datosEmpleado.codigoEmpleado,
        _id: {
          $ne: id,
        },
      });

    if (codigoExistente) {
      const error = new Error(
        "Ya existe otro empleado con ese código"
      );
      error.statusCode = 409;
      throw error;
    }
  }

  if (datosEmpleado.correo) {
    const correoExistente =
      await Empleado.findOne({
        correo:
          datosEmpleado.correo,
        _id: {
          $ne: id,
        },
      });

    if (correoExistente) {
      const error = new Error(
        "Ya existe otro empleado con ese correo"
      );
      error.statusCode = 409;
      throw error;
    }
  }

  const empleadoActualizado =
    await poblarEmpleado(
      Empleado.findByIdAndUpdate(
        id,
        datosEmpleado,
        {
          new: true,
          runValidators: true,
        }
      )
    );

  if (!empleadoActualizado) {
    const error = new Error(
      "Empleado no encontrado"
    );
    error.statusCode = 404;
    throw error;
  }

  return empleadoActualizado;
};

const eliminar = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(
      "El ID del empleado no es válido"
    );
    error.statusCode = 400;
    throw error;
  }

  const empleado =
    await Empleado.findById(id);

  if (!empleado) {
    const error = new Error(
      "Empleado no encontrado"
    );
    error.statusCode = 404;
    throw error;
  }

  if (
    Array.isArray(
      empleado.asignaciones
    ) &&
    empleado.asignaciones.length > 0
  ) {
    const error = new Error(
      "No se puede eliminar el empleado mientras tenga recursos asignados"
    );
    error.statusCode = 409;
    throw error;
  }

  await empleado.deleteOne();

  return empleado;
};

const obtenerPorArea = async (areaId) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      areaId
    )
  ) {
    const error = new Error(
      "El ID del área no es válido"
    );
    error.statusCode = 400;
    throw error;
  }

  const areaExiste =
    await Area.findById(areaId);

  if (!areaExiste) {
    const error = new Error(
      "Área no encontrada"
    );
    error.statusCode = 404;
    throw error;
  }

  return await poblarEmpleado(
    Empleado.find({
      areaId,
    }).sort({
      apellidos: 1,
      nombres: 1,
    })
  );
};

const asignarRecurso = async (
  empleadoId,
  datosAsignacion
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      empleadoId
    )
  ) {
    const error = new Error(
      "El ID del empleado no es válido"
    );
    error.statusCode = 400;
    throw error;
  }

  const {
    recursoId,
    cantidad,
  } = datosAsignacion;

  if (
    !mongoose.Types.ObjectId.isValid(
      recursoId
    )
  ) {
    const error = new Error(
      "El ID del recurso no es válido"
    );
    error.statusCode = 400;
    throw error;
  }

  const cantidadNumerica =
    Number(cantidad);

  if (
    !Number.isInteger(
      cantidadNumerica
    ) ||
    cantidadNumerica <= 0
  ) {
    const error = new Error(
      "La cantidad asignada debe ser un número entero mayor a 0"
    );
    error.statusCode = 400;
    throw error;
  }

  const empleado =
    await Empleado.findById(
      empleadoId
    );

  if (!empleado) {
    const error = new Error(
      "Empleado no encontrado"
    );
    error.statusCode = 404;
    throw error;
  }

  const recurso =
    await Recurso.findById(
      recursoId
    );

  if (!recurso) {
    const error = new Error(
      "Recurso no encontrado"
    );
    error.statusCode = 404;
    throw error;
  }

  const disponible =
    recurso.existenciaTotal -
    recurso.cantidadPrestada -
    recurso.cantidadEnReparacion -
    recurso.cantidadDesecho;

  if (
    cantidadNumerica >
    disponible
  ) {
    const error = new Error(
      `Stock insuficiente. Disponibilidad actual: ${disponible}`
    );
    error.statusCode = 400;
    throw error;
  }

  empleado.asignaciones.push({
    recursoId,
    cantidad:
      cantidadNumerica,
    fechaAsignacion:
      new Date(),
  });

  recurso.cantidadPrestada +=
    cantidadNumerica;

  try {
    await recurso.save();

    try {
      await empleado.save();
    } catch (error) {
      recurso.cantidadPrestada -=
        cantidadNumerica;

      await recurso.save();

      throw error;
    }
  } catch (error) {
    throw error;
  }

  return await poblarEmpleado(
    Empleado.findById(
      empleadoId
    )
  );
};

const devolverRecurso = async (
  empleadoId,
  asignacionId
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      empleadoId
    )
  ) {
    const error = new Error(
      "El ID del empleado no es válido"
    );
    error.statusCode = 400;
    throw error;
  }

  if (
    !mongoose.Types.ObjectId.isValid(
      asignacionId
    )
  ) {
    const error = new Error(
      "El ID de la asignación no es válido"
    );
    error.statusCode = 400;
    throw error;
  }

  const empleado =
    await Empleado.findById(
      empleadoId
    );

  if (!empleado) {
    const error = new Error(
      "Empleado no encontrado"
    );
    error.statusCode = 404;
    throw error;
  }

  const asignacion =
    empleado.asignaciones.id(
      asignacionId
    );

  if (!asignacion) {
    const error = new Error(
      "Asignación no encontrada"
    );
    error.statusCode = 404;
    throw error;
  }

  const recurso =
    await Recurso.findById(
      asignacion.recursoId
    );

  if (!recurso) {
    const error = new Error(
      "No se puede devolver el recurso porque ya no existe"
    );
    error.statusCode = 409;
    throw error;
  }

  const cantidad =
    Number(
      asignacion.cantidad
    );

  if (
    recurso.cantidadPrestada <
    cantidad
  ) {
    const error = new Error(
      "No se puede devolver la asignación porque la cantidad prestada del recurso está inconsistente"
    );
    error.statusCode = 409;
    throw error;
  }

  recurso.cantidadPrestada -=
    cantidad;

  asignacion.deleteOne();

  try {
    await recurso.save();

    try {
      await empleado.save();
    } catch (error) {
      recurso.cantidadPrestada +=
        cantidad;

      await recurso.save();

      throw error;
    }
  } catch (error) {
    throw error;
  }

  return await poblarEmpleado(
    Empleado.findById(
      empleadoId
    )
  );
};

export {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  obtenerPorArea,
  asignarRecurso,
  devolverRecurso,
};
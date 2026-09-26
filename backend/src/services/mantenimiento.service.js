import mongoose from "mongoose";
import Mantenimiento from "../models/mantenimiento.model.js";
import Recurso from "../models/recurso.model.js";
import Empleado from "../models/empleado.model.js";
import Proveedor from "../models/proveedor.model.js";
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

const validarFecha = (valor, mensaje) => {
  if (!valor) {
    return null;
  }

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    const error = new Error(mensaje);
    error.statusCode = 400;
    throw error;
  }

  return fecha;
};

const obtenerMensajeValidacion = (error) => {
  if (error?.name === "ValidationError") {
    const errores = Object.values(error.errors || {});

    if (errores.length > 0) {
      return (
        errores[0].message ||
        "Los datos del mantenimiento no son válidos"
      );
    }
  }

  if (error?.name === "CastError") {
    return `El valor enviado para ${error.path} no es válido`;
  }

  return null;
};

const lanzarErrorMongoose = (error) => {
  const mensaje = obtenerMensajeValidacion(error);

  if (!mensaje) {
    throw error;
  }

  const nuevoError = new Error(mensaje);
  nuevoError.statusCode = 400;
  throw nuevoError;
};

const aplicarSesion = (consulta, session) => {
  if (session) {
    consulta.session(session);
  }

  return consulta;
};

const normalizarDatos = (data) => {
  const datos = {
    ...data,
  };

  if (datos.proveedorId === "") {
    datos.proveedorId = null;
  }

  if (datos.tecnicoAsignadoId === "") {
    datos.tecnicoAsignadoId = null;
  }

  if (datos.cantidad !== undefined && datos.cantidad !== "") {
    datos.cantidad = Number(datos.cantidad);
  }

  if (typeof datos.descripcionProblema === "string") {
    datos.descripcionProblema = datos.descripcionProblema.trim();
  }

  if (datos.tipo === "incidencia") {
    datos.detallePreventivo = undefined;
    datos.detalleCorrectivo = undefined;
  }

  if (datos.tipo === "preventivo") {
    datos.detalleCorrectivo = undefined;
  }

  if (datos.tipo === "correctivo") {
    datos.detallePreventivo = undefined;
  }

  return datos;
};

const validarCamposPrincipales = (data, esCreacion = false) => {
  if (esCreacion && !data.recursoId) {
    const error = new Error("Debe seleccionar un recurso");
    error.statusCode = 400;
    throw error;
  }

  if (esCreacion && !data.empleadoReportaId) {
    const error = new Error(
      "Debe seleccionar al empleado que reporta"
    );
    error.statusCode = 400;
    throw error;
  }

  if (esCreacion && !data.tipo) {
    const error = new Error(
      "Debe seleccionar el tipo de mantenimiento"
    );
    error.statusCode = 400;
    throw error;
  }

  if (
    esCreacion &&
    !normalizarTexto(data.descripcionProblema)
  ) {
    const error = new Error(
      "La descripción del problema es obligatoria"
    );
    error.statusCode = 400;
    throw error;
  }

  if (
    data.descripcionProblema !== undefined &&
    !normalizarTexto(data.descripcionProblema)
  ) {
    const error = new Error(
      "La descripción del problema es obligatoria"
    );
    error.statusCode = 400;
    throw error;
  }

  if (esCreacion && data.cantidad === undefined) {
    data.cantidad = 1;
  }

  if (data.cantidad !== undefined) {
    const cantidad = Number(data.cantidad);

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      const error = new Error(
        "La cantidad en mantenimiento debe ser un número entero mayor a 0"
      );
      error.statusCode = 400;
      throw error;
    }

    data.cantidad = cantidad;
  }

  if (
    data.tipo === "correctivo" &&
    data.detalleCorrectivo
  ) {
    const costo = data.detalleCorrectivo.costoRepuestos;

    if (costo === "" || costo === null || costo === undefined) {
      const error = new Error(
        "El costo de repuestos es obligatorio"
      );
      error.statusCode = 400;
      throw error;
    }

    const costoNumerico = Number(costo);

    if (Number.isNaN(costoNumerico)) {
      const error = new Error(
        "El costo de repuestos debe ser un número válido"
      );
      error.statusCode = 400;
      throw error;
    }

    if (costoNumerico < 0) {
      const error = new Error(
        "El costo de repuestos no puede ser negativo"
      );
      error.statusCode = 400;
      throw error;
    }
  }
};

const validarTecnico = async (
  tecnicoAsignadoId,
  session = null
) => {
  if (
    tecnicoAsignadoId === undefined ||
    tecnicoAsignadoId === null ||
    tecnicoAsignadoId === ""
  ) {
    return null;
  }

  if (!mongoose.Types.ObjectId.isValid(tecnicoAsignadoId)) {
    const error = new Error(
      "El ID del técnico asignado no es válido"
    );
    error.statusCode = 400;
    throw error;
  }

  const empleado = await aplicarSesion(
    Empleado.findById(tecnicoAsignadoId),
    session
  );

  if (!empleado) {
    const error = new Error(
      "El técnico asignado no existe como empleado"
    );
    error.statusCode = 404;
    throw error;
  }

  if (!empleado.activo) {
    const error = new Error(
      "El empleado seleccionado como técnico se encuentra inactivo"
    );
    error.statusCode = 400;
    throw error;
  }

  const usuarioTecnico = await aplicarSesion(
    Usuario.findOne({
      empleadoId: tecnicoAsignadoId,
      rol: "tecnico",
      activo: true,
    }),
    session
  );

  if (!usuarioTecnico) {
    const error = new Error(
      "El empleado seleccionado no tiene una cuenta activa con rol técnico"
    );
    error.statusCode = 400;
    throw error;
  }

  return empleado;
};

const validarReferencias = async (
  data,
  esCreacion = false,
  session = null
) => {
  if (esCreacion || data.recursoId !== undefined) {
    if (!data.recursoId) {
      const error = new Error("Debe seleccionar un recurso");
      error.statusCode = 400;
      throw error;
    }

    if (!mongoose.Types.ObjectId.isValid(data.recursoId)) {
      const error = new Error("El ID del recurso no es válido");
      error.statusCode = 400;
      throw error;
    }

    const recursoExiste = await aplicarSesion(
      Recurso.findById(data.recursoId),
      session
    );

    if (!recursoExiste) {
      const error = new Error("El recurso indicado no existe");
      error.statusCode = 404;
      throw error;
    }
  }

  if (esCreacion || data.empleadoReportaId !== undefined) {
    if (!data.empleadoReportaId) {
      const error = new Error(
        "Debe seleccionar al empleado que reporta"
      );
      error.statusCode = 400;
      throw error;
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        data.empleadoReportaId
      )
    ) {
      const error = new Error(
        "El ID del empleado no es válido"
      );
      error.statusCode = 400;
      throw error;
    }

    const empleadoExiste = await aplicarSesion(
      Empleado.findById(data.empleadoReportaId),
      session
    );

    if (!empleadoExiste) {
      const error = new Error(
        "El empleado indicado no existe"
      );
      error.statusCode = 404;
      throw error;
    }
  }

  if (data.tecnicoAsignadoId !== undefined) {
    await validarTecnico(
      data.tecnicoAsignadoId,
      session
    );
  }

  if (
    data.proveedorId !== undefined &&
    data.proveedorId !== null &&
    data.proveedorId !== ""
  ) {
    if (
      !mongoose.Types.ObjectId.isValid(
        data.proveedorId
      )
    ) {
      const error = new Error(
        "El ID del proveedor no es válido"
      );
      error.statusCode = 400;
      throw error;
    }

    const proveedorExiste = await aplicarSesion(
      Proveedor.findById(data.proveedorId),
      session
    );

    if (!proveedorExiste) {
      const error = new Error(
        "El proveedor indicado no existe"
      );
      error.statusCode = 404;
      throw error;
    }
  }
};

const aplicarReglaTecnicoEstadoCreacion = (datos) => {
  if (datos.tecnicoAsignadoId && !datos.estado) {
    datos.estado = "en_proceso";
  }

  if (
    datos.estado === "en_proceso" &&
    !datos.tecnicoAsignadoId
  ) {
    const error = new Error(
      "Debe asignar un técnico antes de poner el mantenimiento en proceso"
    );
    error.statusCode = 400;
    throw error;
  }
};

const aplicarReglaTecnicoEstadoActualizacion = (
  mantenimiento,
  datos
) => {
  const tecnicoActual = mantenimiento.tecnicoAsignadoId
    ? String(mantenimiento.tecnicoAsignadoId)
    : null;

  const seEnvioTecnico =
    datos.tecnicoAsignadoId !== undefined;

  const tecnicoNuevo = seEnvioTecnico
    ? datos.tecnicoAsignadoId
      ? String(datos.tecnicoAsignadoId)
      : null
    : tecnicoActual;

  if (
    seEnvioTecnico &&
    tecnicoNuevo &&
    tecnicoNuevo !== tecnicoActual &&
    datos.estado === undefined
  ) {
    datos.estado = "en_proceso";
  }

  if (
    seEnvioTecnico &&
    !tecnicoNuevo &&
    datos.estado === undefined &&
    mantenimiento.estado === "en_proceso"
  ) {
    datos.estado = "notificado";
  }

  const estadoFinal =
    datos.estado !== undefined
      ? datos.estado
      : mantenimiento.estado;

  if (
    estadoFinal === "en_proceso" &&
    !tecnicoNuevo
  ) {
    const error = new Error(
      "Debe asignar un técnico antes de poner el mantenimiento en proceso"
    );
    error.statusCode = 400;
    throw error;
  }
};

const ajustarCantidadEnReparacion = async (
  recursoId,
  diferencia,
  session
) => {
  if (!diferencia) {
    return;
  }

  const recurso = await Recurso.findById(
    recursoId
  ).session(session);

  if (!recurso) {
    const error = new Error(
      "No se puede actualizar el mantenimiento porque el recurso ya no existe"
    );
    error.statusCode = 409;
    throw error;
  }

  if (diferencia > 0) {
    const disponible =
      recurso.existenciaTotal -
      recurso.cantidadPrestada -
      recurso.cantidadEnReparacion -
      recurso.cantidadDesecho;

    if (diferencia > disponible) {
      const error = new Error(
        `Stock insuficiente para enviar a reparación el recurso ${recurso.nombre}. Disponible: ${disponible}`
      );
      error.statusCode = 400;
      throw error;
    }

    recurso.cantidadEnReparacion += diferencia;
  }

  if (diferencia < 0) {
    const cantidadARestar = Math.abs(diferencia);

    if (
      recurso.cantidadEnReparacion <
      cantidadARestar
    ) {
      const error = new Error(
        `La cantidad en reparación del recurso ${recurso.nombre} está inconsistente`
      );
      error.statusCode = 409;
      throw error;
    }

    recurso.cantidadEnReparacion -= cantidadARestar;
  }

  await recurso.save({
    session,
  });
};

const sincronizarCantidadEnReparacion = async ({
  estadoAnterior,
  recursoAnteriorId,
  cantidadAnterior,
  estadoNuevo,
  recursoNuevoId,
  cantidadNueva,
  session,
}) => {
  const estabaEnReparacion =
    estadoAnterior === "en_proceso";

  const quedaraEnReparacion =
    estadoNuevo === "en_proceso";

  const recursoAnterior = String(
    recursoAnteriorId
  );

  const recursoNuevo = String(
    recursoNuevoId
  );

  if (
    estabaEnReparacion &&
    quedaraEnReparacion &&
    recursoAnterior === recursoNuevo
  ) {
    const diferencia =
      Number(cantidadNueva) -
      Number(cantidadAnterior);

    await ajustarCantidadEnReparacion(
      recursoNuevoId,
      diferencia,
      session
    );

    return;
  }

  if (estabaEnReparacion) {
    await ajustarCantidadEnReparacion(
      recursoAnteriorId,
      -Number(cantidadAnterior),
      session
    );
  }

  if (quedaraEnReparacion) {
    await ajustarCantidadEnReparacion(
      recursoNuevoId,
      Number(cantidadNueva),
      session
    );
  }
};

const serializarMantenimiento = (mantenimiento) => {
  if (!mantenimiento) {
    return mantenimiento;
  }

  const objeto =
    typeof mantenimiento.toObject === "function"
      ? mantenimiento.toObject()
      : {
          ...mantenimiento,
        };

  const costo =
    objeto.detalleCorrectivo?.costoRepuestos;

  if (costo !== undefined && costo !== null) {
    if (
      typeof costo === "object" &&
      costo.$numberDecimal !== undefined
    ) {
      objeto.detalleCorrectivo.costoRepuestos =
        costo.$numberDecimal;
    } else if (
      typeof costo.toString === "function"
    ) {
      objeto.detalleCorrectivo.costoRepuestos =
        costo.toString();
    }
  }

  return objeto;
};

const poblarMantenimiento = (consulta) => {
  return consulta
    .populate(
      "recursoId",
      "nombre codigo existenciaTotal cantidadPrestada cantidadEnReparacion cantidadDesecho activo"
    )
    .populate(
      "empleadoReportaId",
      "nombres apellidos codigoEmpleado correo cargo activo"
    )
    .populate(
      "tecnicoAsignadoId",
      "nombres apellidos codigoEmpleado correo cargo activo"
    )
    .populate(
      "proveedorId",
      "nombre nitORuc correo telefono activo"
    );
};

export const crearMantenimiento = async (data) => {
  const datos = normalizarDatos(data);

  aplicarReglaTecnicoEstadoCreacion(datos);
  validarCamposPrincipales(datos, true);

  const session =
    await mongoose.startSession();

  let mantenimientoId = null;

  try {
    await session.withTransaction(async () => {
      await validarReferencias(
        datos,
        true,
        session
      );

      if (datos.estado === "en_proceso") {
        await ajustarCantidadEnReparacion(
          datos.recursoId,
          datos.cantidad,
          session
        );
      }

      const nuevoMantenimiento =
        new Mantenimiento(datos);

      const guardado =
        await nuevoMantenimiento.save({
          session,
        });

      mantenimientoId =
        guardado._id;
    });
  } catch (error) {
    lanzarErrorMongoose(error);
  } finally {
    await session.endSession();
  }

  const mantenimiento =
    await poblarMantenimiento(
      Mantenimiento.findById(
        mantenimientoId
      )
    );

  return serializarMantenimiento(
    mantenimiento
  );
};

export const obtenerMantenimientos = async ({
  tipo = "",
  estado = "",
  descripcionProblema = "",
  recursoId = "",
  empleadoReportaId = "",
  tecnicoAsignadoId = "",
  proveedorId = "",
  fechaDesde = "",
  fechaHasta = "",
  search = "",
  page,
  limit,
} = {}) => {
  const filtro = {};

  const tipoLimpio =
    normalizarTexto(tipo);

  const estadoLimpio =
    normalizarTexto(estado);

  const descripcionLimpia =
    normalizarTexto(
      descripcionProblema
    );

  const recursoIdLimpio =
    normalizarTexto(recursoId);

  const empleadoIdLimpio =
    normalizarTexto(
      empleadoReportaId
    );

  const tecnicoIdLimpio =
    normalizarTexto(
      tecnicoAsignadoId
    );

  const proveedorIdLimpio =
    normalizarTexto(proveedorId);

  const busquedaGeneral =
    normalizarTexto(search);

  if (tipoLimpio) {
    filtro.tipo = tipoLimpio;
  }

  if (estadoLimpio) {
    filtro.estado = estadoLimpio;
  }

  if (descripcionLimpia) {
    filtro.descripcionProblema = {
      $regex:
        escaparRegex(
          descripcionLimpia
        ),
      $options: "i",
    };
  }

  if (recursoIdLimpio) {
    filtro.recursoId =
      validarObjectIdFiltro(
        recursoIdLimpio,
        "El ID del recurso no es válido"
      );
  }

  if (empleadoIdLimpio) {
    filtro.empleadoReportaId =
      validarObjectIdFiltro(
        empleadoIdLimpio,
        "El ID del empleado no es válido"
      );
  }

  if (tecnicoIdLimpio) {
    filtro.tecnicoAsignadoId =
      validarObjectIdFiltro(
        tecnicoIdLimpio,
        "El ID del técnico asignado no es válido"
      );
  }

  if (proveedorIdLimpio) {
    filtro.proveedorId =
      validarObjectIdFiltro(
        proveedorIdLimpio,
        "El ID del proveedor no es válido"
      );
  }

  if (busquedaGeneral) {
    const textoSeguro =
      escaparRegex(busquedaGeneral);

    filtro.$or = [
      {
        descripcionProblema: {
          $regex: textoSeguro,
          $options: "i",
        },
      },
      {
        tipo: {
          $regex: textoSeguro,
          $options: "i",
        },
      },
      {
        estado: {
          $regex: textoSeguro,
          $options: "i",
        },
      },
    ];
  }

  const desde = validarFecha(
    fechaDesde,
    "La fecha inicial no es válida"
  );

  const hasta = validarFecha(
    fechaHasta,
    "La fecha final no es válida"
  );

  if (desde || hasta) {
    filtro.fechaCreacion = {};

    if (desde) {
      filtro.fechaCreacion.$gte =
        desde;
    }

    if (hasta) {
      const fechaFin =
        new Date(hasta);

      fechaFin.setHours(
        23,
        59,
        59,
        999
      );

      filtro.fechaCreacion.$lte =
        fechaFin;
    }
  }

  const pagina =
    obtenerPaginaValida(page);

  const limite =
    obtenerLimiteValido(limit);

  const paginado =
    pagina !== null ||
    limite !== null;

  const paginaFinal =
    pagina || 1;

  const limiteFinal =
    limite ||
    (paginado ? 10 : null);

  if (!paginado) {
    const registros =
      await poblarMantenimiento(
        Mantenimiento.find(
          filtro
        ).sort({
          createdAt: -1,
        })
      );

    const registrosSerializados =
      registros.map(
        serializarMantenimiento
      );

    return {
      registros:
        registrosSerializados,
      total:
        registrosSerializados.length,
      page: 1,
      limit:
        registrosSerializados.length,
      totalPages: 1,
      paginado: false,
    };
  }

  const total =
    await Mantenimiento.countDocuments(
      filtro
    );

  const totalPages = Math.max(
    1,
    Math.ceil(
      total / limiteFinal
    )
  );

  const salto =
    (paginaFinal - 1) *
    limiteFinal;

  const registros =
    await poblarMantenimiento(
      Mantenimiento.find(filtro)
        .sort({
          createdAt: -1,
        })
        .skip(salto)
        .limit(limiteFinal)
    );

  return {
    registros:
      registros.map(
        serializarMantenimiento
      ),
    total,
    page: paginaFinal,
    limit: limiteFinal,
    totalPages,
    paginado: true,
  };
};

export const obtenerMantenimientoPorId = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(
      "El ID del mantenimiento no es válido"
    );
    error.statusCode = 400;
    throw error;
  }

  const mantenimiento =
    await poblarMantenimiento(
      Mantenimiento.findById(id)
    );

  return serializarMantenimiento(
    mantenimiento
  );
};

export const actualizarMantenimiento = async (
  id,
  data
) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(
      "El ID del mantenimiento no es válido"
    );
    error.statusCode = 400;
    throw error;
  }

  const session =
    await mongoose.startSession();

  let mantenimientoId = null;
  let encontrado = true;

  try {
    await session.withTransaction(async () => {
      const mantenimiento =
        await Mantenimiento.findById(
          id
        ).session(session);

      if (!mantenimiento) {
        encontrado = false;
        return;
      }

      const datos =
        normalizarDatos(data);

      aplicarReglaTecnicoEstadoActualizacion(
        mantenimiento,
        datos
      );

      validarCamposPrincipales(
        datos,
        false
      );

      await validarReferencias(
        datos,
        false,
        session
      );

      const estadoAnterior =
        mantenimiento.estado;

      const recursoAnteriorId =
        mantenimiento.recursoId;

      const cantidadAnterior =
        mantenimiento.cantidad || 1;

      const estadoNuevo =
        datos.estado !== undefined
          ? datos.estado
          : mantenimiento.estado;

      const recursoNuevoId =
        datos.recursoId !== undefined
          ? datos.recursoId
          : mantenimiento.recursoId;

      const cantidadNueva =
        datos.cantidad !== undefined
          ? datos.cantidad
          : mantenimiento.cantidad || 1;

      await sincronizarCantidadEnReparacion({
        estadoAnterior,
        recursoAnteriorId,
        cantidadAnterior,
        estadoNuevo,
        recursoNuevoId,
        cantidadNueva,
        session,
      });

      Object.assign(
        mantenimiento,
        datos
      );

      const actualizado =
        await mantenimiento.save({
          session,
        });

      mantenimientoId =
        actualizado._id;
    });
  } catch (error) {
    lanzarErrorMongoose(error);
  } finally {
    await session.endSession();
  }

  if (!encontrado) {
    return null;
  }

  const mantenimiento =
    await poblarMantenimiento(
      Mantenimiento.findById(
        mantenimientoId
      )
    );

  return serializarMantenimiento(
    mantenimiento
  );
};

export const eliminarMantenimiento = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(
      "El ID del mantenimiento no es válido"
    );
    error.statusCode = 400;
    throw error;
  }

  const session =
    await mongoose.startSession();

  let eliminado = null;

  try {
    await session.withTransaction(async () => {
      const mantenimiento =
        await Mantenimiento.findById(
          id
        ).session(session);

      if (!mantenimiento) {
        return;
      }

      if (
        mantenimiento.estado ===
        "en_proceso"
      ) {
        await ajustarCantidadEnReparacion(
          mantenimiento.recursoId,
          -(mantenimiento.cantidad || 1),
          session
        );
      }

      eliminado =
        mantenimiento.toObject();

      await mantenimiento.deleteOne({
        session,
      });
    });
  } catch (error) {
    lanzarErrorMongoose(error);
  } finally {
    await session.endSession();
  }

  return serializarMantenimiento(
    eliminado
  );
};
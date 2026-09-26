import mongoose from "mongoose";
import AjusteInventario from "../models/ajusteInventario.model.js";
import CategoriaAjuste from "../models/categoriaAjuste.model.js";
import Proveedor from "../models/proveedor.model.js";
import Recurso from "../models/recurso.model.js";

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

const normalizarDatosAjuste = (datos) => {
  const resultado = {
    ...datos,
  };

  if (typeof resultado.numeroDocumento === "string") {
    resultado.numeroDocumento = resultado.numeroDocumento
      .trim()
      .toUpperCase();
  }

  if (typeof resultado.justificacion === "string") {
    resultado.justificacion = resultado.justificacion.trim();
  }

  if (typeof resultado.proveedor === "string") {
    resultado.proveedor = resultado.proveedor.trim();
  }

  if (resultado.proveedorId === "") {
    resultado.proveedorId = null;
  }

  if (Array.isArray(resultado.detalleAjuste)) {
    resultado.detalleAjuste = resultado.detalleAjuste.map(
      (detalle) => ({
        ...detalle,
        cantidad: Number(detalle.cantidad),
        costoUnitario:
          detalle.costoUnitario === "" ||
          detalle.costoUnitario === null ||
          detalle.costoUnitario === undefined
            ? 0
            : detalle.costoUnitario,
      })
    );
  }

  return resultado;
};

const obtenerMensajeValidacion = (error) => {
  if (error?.name === "ValidationError") {
    const errores = Object.values(error.errors || {});

    if (errores.length > 0) {
      return (
        errores[0].message ||
        "Los datos del ajuste no son válidos"
      );
    }
  }

  if (error?.name === "CastError") {
    return `El valor enviado para ${error.path} no es válido`;
  }

  if (error?.code === 11000) {
    if (error.keyPattern?.numeroDocumento) {
      return "Ya existe un ajuste con ese número de documento";
    }

    return "Ya existe un registro con uno de los valores enviados";
  }

  return null;
};

const lanzarErrorMongoose = (error) => {
  const mensaje = obtenerMensajeValidacion(error);

  if (!mensaje) {
    throw error;
  }

  const nuevoError = new Error(mensaje);

  nuevoError.statusCode =
    error?.code === 11000 ? 409 : 400;

  throw nuevoError;
};

const poblarAjuste = (consulta) => {
  return consulta
    .populate(
      "categoriaAjusteId",
      "nombre descripcion afectaDesecho activo"
    )
    .populate(
      "proveedorId",
      "nombre nitORuc telefono correo activo"
    )
    .populate(
      "detalleAjuste.recursoId",
      "nombre codigo existenciaTotal cantidadPrestada cantidadEnReparacion cantidadDesecho activo"
    );
};

const serializarAjuste = (ajuste) => {
  if (!ajuste) {
    return ajuste;
  }

  const objeto =
    typeof ajuste.toObject === "function"
      ? ajuste.toObject()
      : {
          ...ajuste,
        };

  if (Array.isArray(objeto.detalleAjuste)) {
    objeto.detalleAjuste = objeto.detalleAjuste.map(
      (detalle) => {
        const resultado = {
          ...detalle,
        };

        const costo = resultado.costoUnitario;

        if (costo !== undefined && costo !== null) {
          if (
            typeof costo === "object" &&
            costo.$numberDecimal !== undefined
          ) {
            resultado.costoUnitario =
              costo.$numberDecimal;
          } else if (
            typeof costo.toString === "function"
          ) {
            resultado.costoUnitario =
              costo.toString();
          }
        }

        return resultado;
      }
    );
  }

  return objeto;
};

const validarCategoria = async (
  categoriaAjusteId,
  session = null
) => {
  if (!categoriaAjusteId) {
    const error = new Error(
      "Debe seleccionar una categoría de ajuste"
    );
    error.statusCode = 400;
    throw error;
  }

  if (
    !mongoose.Types.ObjectId.isValid(
      categoriaAjusteId
    )
  ) {
    const error = new Error(
      "El ID de la categoría de ajuste no es válido"
    );
    error.statusCode = 400;
    throw error;
  }

  const consulta = CategoriaAjuste.findById(
    categoriaAjusteId
  );

  if (session) {
    consulta.session(session);
  }

  const categoria = await consulta;

  if (!categoria) {
    const error = new Error(
      "La categoría de ajuste no existe"
    );
    error.statusCode = 404;
    throw error;
  }

  if (!categoria.activo) {
    const error = new Error(
      "La categoría de ajuste se encuentra inactiva"
    );
    error.statusCode = 400;
    throw error;
  }

  return categoria;
};

const validarProveedor = async (
  proveedorId,
  session = null
) => {
  if (!proveedorId) {
    return null;
  }

  if (!mongoose.Types.ObjectId.isValid(proveedorId)) {
    const error = new Error(
      "El ID del proveedor no es válido"
    );
    error.statusCode = 400;
    throw error;
  }

  const consulta = Proveedor.findById(proveedorId);

  if (session) {
    consulta.session(session);
  }

  const proveedor = await consulta;

  if (!proveedor) {
    const error = new Error(
      "El proveedor no existe"
    );
    error.statusCode = 404;
    throw error;
  }

  return proveedor;
};

const validarDetalle = async (
  detalle,
  session = null
) => {
  const {
    recursoId,
    tipoMovimiento,
    cantidad,
    costoUnitario,
  } = detalle;

  if (!recursoId) {
    const error = new Error(
      "Debe seleccionar un recurso en cada detalle"
    );
    error.statusCode = 400;
    throw error;
  }

  if (!mongoose.Types.ObjectId.isValid(recursoId)) {
    const error = new Error(
      "El ID del recurso no es válido"
    );
    error.statusCode = 400;
    throw error;
  }

  if (
    !["entrada", "salida"].includes(
      tipoMovimiento
    )
  ) {
    const error = new Error(
      "El tipo de movimiento debe ser entrada o salida"
    );
    error.statusCode = 400;
    throw error;
  }

  const cantidadNumerica = Number(cantidad);

  if (
    !Number.isInteger(cantidadNumerica) ||
    cantidadNumerica <= 0
  ) {
    const error = new Error(
      "La cantidad del movimiento debe ser un número entero mayor a 0"
    );
    error.statusCode = 400;
    throw error;
  }

  const costoNumerico =
    costoUnitario === "" ||
    costoUnitario === null ||
    costoUnitario === undefined
      ? 0
      : Number(costoUnitario);

  if (!Number.isFinite(costoNumerico)) {
    const error = new Error(
      "El costo unitario debe ser un número válido"
    );
    error.statusCode = 400;
    throw error;
  }

  if (costoNumerico < 0) {
    const error = new Error(
      "El costo unitario no puede ser negativo"
    );
    error.statusCode = 400;
    throw error;
  }

  const consulta = Recurso.findById(recursoId);

  if (session) {
    consulta.session(session);
  }

  const recurso = await consulta;

  if (!recurso) {
    const error = new Error(
      "El recurso indicado no existe"
    );
    error.statusCode = 404;
    throw error;
  }

  return {
    recurso,
    cantidad: cantidadNumerica,
  };
};

const obtenerDisponible = (recurso) => {
  return (
    recurso.existenciaTotal -
    recurso.cantidadPrestada -
    recurso.cantidadEnReparacion -
    recurso.cantidadDesecho
  );
};

const aplicarMovimiento = async ({
  detalle,
  categoria,
  session,
}) => {
  const { recurso, cantidad } =
    await validarDetalle(
      detalle,
      session
    );

  const afectaDesecho =
    categoria.afectaDesecho === true;

  if (
    afectaDesecho &&
    detalle.tipoMovimiento !== "salida"
  ) {
    const error = new Error(
      "Una categoría de desecho solo puede utilizar movimientos de salida"
    );
    error.statusCode = 400;
    throw error;
  }

  if (detalle.tipoMovimiento === "entrada") {
    recurso.existenciaTotal += cantidad;
  }

  if (
    detalle.tipoMovimiento === "salida" &&
    !afectaDesecho
  ) {
    const disponible = obtenerDisponible(recurso);

    if (cantidad > disponible) {
      const error = new Error(
        `Stock insuficiente para el recurso ${recurso.nombre}. Disponible: ${disponible}`
      );
      error.statusCode = 400;
      throw error;
    }

    recurso.existenciaTotal -= cantidad;
  }

  if (
    detalle.tipoMovimiento === "salida" &&
    afectaDesecho
  ) {
    const disponible = obtenerDisponible(recurso);

    if (cantidad > disponible) {
      const error = new Error(
        `Stock insuficiente para enviar a desecho el recurso ${recurso.nombre}. Disponible: ${disponible}`
      );
      error.statusCode = 400;
      throw error;
    }

    recurso.cantidadDesecho += cantidad;
  }

  await recurso.save({
    session,
  });
};

const revertirMovimiento = async ({
  detalle,
  categoria,
  session,
}) => {
  const consulta = Recurso.findById(
    detalle.recursoId
  ).session(session);

  const recurso = await consulta;

  if (!recurso) {
    const error = new Error(
      "No se puede revertir el ajuste porque uno de los recursos ya no existe"
    );
    error.statusCode = 409;
    throw error;
  }

  const cantidad = Number(
    detalle.cantidad
  );

  const afectaDesecho =
    categoria.afectaDesecho === true;

  if (detalle.tipoMovimiento === "entrada") {
    const disponible = obtenerDisponible(recurso);

    if (cantidad > disponible) {
      const error = new Error(
        `No se puede eliminar el ajuste porque ya se utilizó parte del inventario de ${recurso.nombre}`
      );
      error.statusCode = 409;
      throw error;
    }

    recurso.existenciaTotal -= cantidad;
  }

  if (
    detalle.tipoMovimiento === "salida" &&
    !afectaDesecho
  ) {
    recurso.existenciaTotal += cantidad;
  }

  if (
    detalle.tipoMovimiento === "salida" &&
    afectaDesecho
  ) {
    if (recurso.cantidadDesecho < cantidad) {
      const error = new Error(
        `No se puede revertir el desecho de ${recurso.nombre} porque la cantidad en desecho está inconsistente`
      );
      error.statusCode = 409;
      throw error;
    }

    recurso.cantidadDesecho -= cantidad;
  }

  await recurso.save({
    session,
  });
};

const obtenerTodos = async ({
  numeroDocumento = "",
  justificacion = "",
  categoriaAjusteId = "",
  proveedorId = "",
  recursoId = "",
  tipoMovimiento = "",
  fechaDesde = "",
  fechaHasta = "",
  search = "",
  page,
  limit,
} = {}) => {
  const filtro = {};

  const numeroLimpio =
    normalizarTexto(numeroDocumento);

  const justificacionLimpia =
    normalizarTexto(justificacion);

  const categoriaIdLimpio =
    normalizarTexto(categoriaAjusteId);

  const proveedorIdLimpio =
    normalizarTexto(proveedorId);

  const recursoIdLimpio =
    normalizarTexto(recursoId);

  const tipoLimpio =
    normalizarTexto(tipoMovimiento);

  const busquedaGeneral =
    normalizarTexto(search);

  if (numeroLimpio) {
    filtro.numeroDocumento = {
      $regex: escaparRegex(numeroLimpio),
      $options: "i",
    };
  }

  if (justificacionLimpia) {
    filtro.justificacion = {
      $regex: escaparRegex(
        justificacionLimpia
      ),
      $options: "i",
    };
  }

  if (categoriaIdLimpio) {
    filtro.categoriaAjusteId =
      validarObjectIdFiltro(
        categoriaIdLimpio,
        "El ID de la categoría de ajuste no es válido"
      );
  }

  if (proveedorIdLimpio) {
    filtro.proveedorId =
      validarObjectIdFiltro(
        proveedorIdLimpio,
        "El ID del proveedor no es válido"
      );
  }

  if (recursoIdLimpio) {
    filtro["detalleAjuste.recursoId"] =
      validarObjectIdFiltro(
        recursoIdLimpio,
        "El ID del recurso no es válido"
      );
  }

  if (tipoLimpio) {
    if (
      !["entrada", "salida"].includes(
        tipoLimpio
      )
    ) {
      const error = new Error(
        "El tipo de movimiento debe ser entrada o salida"
      );
      error.statusCode = 400;
      throw error;
    }

    filtro["detalleAjuste.tipoMovimiento"] =
      tipoLimpio;
  }

  if (busquedaGeneral) {
    const textoSeguro =
      escaparRegex(busquedaGeneral);

    filtro.$or = [
      {
        numeroDocumento: {
          $regex: textoSeguro,
          $options: "i",
        },
      },
      {
        justificacion: {
          $regex: textoSeguro,
          $options: "i",
        },
      },
      {
        proveedor: {
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
    filtro.fecha = {};

    if (desde) {
      filtro.fecha.$gte = desde;
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

      filtro.fecha.$lte = fechaFin;
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
      await poblarAjuste(
        AjusteInventario.find(
          filtro
        ).sort({
          fecha: -1,
          createdAt: -1,
        })
      );

    const serializados =
      registros.map(
        serializarAjuste
      );

    return {
      registros: serializados,
      total: serializados.length,
      page: 1,
      limit: serializados.length,
      totalPages: 1,
      paginado: false,
    };
  }

  const total =
    await AjusteInventario.countDocuments(
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
    await poblarAjuste(
      AjusteInventario.find(filtro)
        .sort({
          fecha: -1,
          createdAt: -1,
        })
        .skip(salto)
        .limit(limiteFinal)
    );

  return {
    registros:
      registros.map(
        serializarAjuste
      ),
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
      "El ID del ajuste de inventario no es válido"
    );
    error.statusCode = 400;
    throw error;
  }

  const ajuste =
    await poblarAjuste(
      AjusteInventario.findById(id)
    );

  if (!ajuste) {
    const error = new Error(
      "Ajuste de inventario no encontrado"
    );
    error.statusCode = 404;
    throw error;
  }

  return serializarAjuste(ajuste);
};

const crear = async (datosAjuste) => {
  const datos =
    normalizarDatosAjuste(
      datosAjuste
    );

  if (!datos.numeroDocumento) {
    const error = new Error(
      "El número de documento es obligatorio"
    );
    error.statusCode = 400;
    throw error;
  }

  if (!datos.justificacion) {
    const error = new Error(
      "La justificación es obligatoria"
    );
    error.statusCode = 400;
    throw error;
  }

  if (
    !Array.isArray(
      datos.detalleAjuste
    ) ||
    datos.detalleAjuste.length === 0
  ) {
    const error = new Error(
      "El ajuste debe contener al menos un detalle"
    );
    error.statusCode = 400;
    throw error;
  }

  const documentoExistente =
    await AjusteInventario.findOne({
      numeroDocumento:
        datos.numeroDocumento,
    });

  if (documentoExistente) {
    const error = new Error(
      "Ya existe un ajuste con ese número de documento"
    );
    error.statusCode = 409;
    throw error;
  }

  const session =
    await mongoose.startSession();

  let ajusteId = null;

  try {
    await session.withTransaction(
      async () => {
        const categoria =
          await validarCategoria(
            datos.categoriaAjusteId,
            session
          );

        await validarProveedor(
          datos.proveedorId,
          session
        );

        for (
          const detalle of
          datos.detalleAjuste
        ) {
          await aplicarMovimiento({
            detalle,
            categoria,
            session,
          });
        }

        const nuevoAjuste =
          new AjusteInventario(
            datos
          );

        const guardado =
          await nuevoAjuste.save({
            session,
          });

        ajusteId =
          guardado._id;
      }
    );
  } catch (error) {
    lanzarErrorMongoose(error);
  } finally {
    await session.endSession();
  }

  return await obtenerPorId(
    ajusteId
  );
};

const actualizar = async (
  id,
  datosAjuste
) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(
      "El ID del ajuste de inventario no es válido"
    );
    error.statusCode = 400;
    throw error;
  }

  const datos =
    normalizarDatosAjuste(
      datosAjuste
    );

  if (
    datos.detalleAjuste !==
    undefined
  ) {
    const error = new Error(
      "Los movimientos del inventario no pueden modificarse mediante este endpoint"
    );
    error.statusCode = 400;
    throw error;
  }

  const ajusteActual =
    await AjusteInventario.findById(
      id
    );

  if (!ajusteActual) {
    const error = new Error(
      "Ajuste de inventario no encontrado"
    );
    error.statusCode = 404;
    throw error;
  }

  if (datos.numeroDocumento) {
    const existente =
      await AjusteInventario.findOne({
        numeroDocumento:
          datos.numeroDocumento,
        _id: {
          $ne: id,
        },
      });

    if (existente) {
      const error = new Error(
        "Ya existe otro ajuste con ese número de documento"
      );
      error.statusCode = 409;
      throw error;
    }
  }

  if (
    datos.categoriaAjusteId !==
    undefined
  ) {
    const categoriaAnterior =
      await CategoriaAjuste.findById(
        ajusteActual.categoriaAjusteId
      );

    if (!categoriaAnterior) {
      const error = new Error(
        "La categoría original del ajuste ya no existe"
      );
      error.statusCode = 409;
      throw error;
    }

    const categoriaNueva =
      await validarCategoria(
        datos.categoriaAjusteId
      );

    const comportamientoAnterior =
      categoriaAnterior.afectaDesecho ===
      true;

    const comportamientoNuevo =
      categoriaNueva.afectaDesecho ===
      true;

    if (
      comportamientoAnterior !==
      comportamientoNuevo
    ) {
      const error = new Error(
        "No se puede cambiar la categoría del ajuste porque alteraría el efecto ya aplicado sobre el inventario"
      );
      error.statusCode = 409;
      throw error;
    }

    if (comportamientoNuevo) {
      const tieneEntradas =
        ajusteActual.detalleAjuste.some(
          (detalle) =>
            detalle.tipoMovimiento ===
            "entrada"
        );

      if (tieneEntradas) {
        const error = new Error(
          "No se puede utilizar una categoría de desecho en un ajuste que contiene movimientos de entrada"
        );
        error.statusCode = 409;
        throw error;
      }
    }
  }

  if (
    datos.proveedorId !==
    undefined
  ) {
    await validarProveedor(
      datos.proveedorId
    );
  }

  try {
    const actualizado =
      await AjusteInventario.findByIdAndUpdate(
        id,
        datos,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!actualizado) {
      const error = new Error(
        "Ajuste de inventario no encontrado"
      );
      error.statusCode = 404;
      throw error;
    }

    return await obtenerPorId(id);
  } catch (error) {
    lanzarErrorMongoose(error);
  }
};

const eliminar = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(
      "El ID del ajuste de inventario no es válido"
    );
    error.statusCode = 400;
    throw error;
  }

  const session =
    await mongoose.startSession();

  let ajusteEliminado = null;

  try {
    await session.withTransaction(
      async () => {
        const ajuste =
          await AjusteInventario.findById(
            id
          ).session(session);

        if (!ajuste) {
          const error = new Error(
            "Ajuste de inventario no encontrado"
          );
          error.statusCode = 404;
          throw error;
        }

        const categoria =
          await CategoriaAjuste.findById(
            ajuste.categoriaAjusteId
          ).session(session);

        if (!categoria) {
          const error = new Error(
            "No se puede revertir el ajuste porque su categoría ya no existe"
          );
          error.statusCode = 409;
          throw error;
        }

        for (
          const detalle of
          ajuste.detalleAjuste
        ) {
          await revertirMovimiento({
            detalle,
            categoria,
            session,
          });
        }

        ajusteEliminado =
          ajuste.toObject();

        await ajuste.deleteOne({
          session,
        });
      }
    );
  } finally {
    await session.endSession();
  }

  return serializarAjuste(
    ajusteEliminado
  );
};

const obtenerPorCategoria = async (
  categoriaAjusteId
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      categoriaAjusteId
    )
  ) {
    const error = new Error(
      "El ID de la categoría de ajuste no es válido"
    );
    error.statusCode = 400;
    throw error;
  }

  const categoria =
    await CategoriaAjuste.findById(
      categoriaAjusteId
    );

  if (!categoria) {
    const error = new Error(
      "Categoría de ajuste no encontrada"
    );
    error.statusCode = 404;
    throw error;
  }

  const ajustes =
    await poblarAjuste(
      AjusteInventario.find({
        categoriaAjusteId,
      }).sort({
        fecha: -1,
      })
    );

  return ajustes.map(
    serializarAjuste
  );
};

export {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  obtenerPorCategoria,
};
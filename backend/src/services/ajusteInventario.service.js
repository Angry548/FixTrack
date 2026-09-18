import mongoose from "mongoose";
import AjusteInventario from "../models/ajusteInventario.model.js";
import CategoriaAjuste from "../models/categoriaAjuste.model.js";
import Proveedor from "../models/proveedor.model.js";
import Recurso from "../models/recurso.model.js";

const obtenerTodos = async () => {
  return await AjusteInventario.find()
    .populate("categoriaAjusteId", "nombre descripcion activo")
    .populate("proveedorId", "nombre nitORuc telefono correo")
    .populate(
      "detalleAjuste.recursoId",
      "nombre codigo existenciaTotal cantidadPrestada cantidadEnReparacion cantidadDesecho"
    )
    .sort({ createdAt: -1 });
};

const obtenerPorId = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("El ID del ajuste de inventario no es válido");
    error.statusCode = 400;
    throw error;
  }

  const ajuste = await AjusteInventario.findById(id)
    .populate("categoriaAjusteId", "nombre descripcion activo")
    .populate("proveedorId", "nombre nitORuc telefono correo")
    .populate(
      "detalleAjuste.recursoId",
      "nombre codigo existenciaTotal cantidadPrestada cantidadEnReparacion cantidadDesecho"
    );

  if (!ajuste) {
    const error = new Error("Ajuste de inventario no encontrado");
    error.statusCode = 404;
    throw error;
  }

  return ajuste;
};

const validarCategoria = async (categoriaAjusteId) => {
  if (!mongoose.Types.ObjectId.isValid(categoriaAjusteId)) {
    const error = new Error("El ID de la categoría de ajuste no es válido");
    error.statusCode = 400;
    throw error;
  }

  const categoria = await CategoriaAjuste.findById(categoriaAjusteId);

  if (!categoria) {
    const error = new Error("La categoría de ajuste no existe");
    error.statusCode = 404;
    throw error;
  }

  if (!categoria.activo) {
    const error = new Error("La categoría de ajuste se encuentra inactiva");
    error.statusCode = 400;
    throw error;
  }

  return categoria;
};

const validarProveedor = async (proveedorId) => {
  if (!proveedorId) {
    return null;
  }

  if (!mongoose.Types.ObjectId.isValid(proveedorId)) {
    const error = new Error("El ID del proveedor no es válido");
    error.statusCode = 400;
    throw error;
  }

  const proveedor = await Proveedor.findById(proveedorId);

  if (!proveedor) {
    const error = new Error("El proveedor no existe");
    error.statusCode = 404;
    throw error;
  }

  return proveedor;
};

const crear = async (datosAjuste) => {
  const {
    numeroDocumento,
    categoriaAjusteId,
    proveedorId,
    detalleAjuste,
  } = datosAjuste;

  const documentoExistente = await AjusteInventario.findOne({
    numeroDocumento,
  });

  if (documentoExistente) {
    const error = new Error(
      "Ya existe un ajuste con ese número de documento"
    );
    error.statusCode = 409;
    throw error;
  }

  await validarCategoria(categoriaAjusteId);
  await validarProveedor(proveedorId);

  if (!Array.isArray(detalleAjuste) || detalleAjuste.length === 0) {
    const error = new Error(
      "El ajuste debe contener al menos un detalle"
    );
    error.statusCode = 400;
    throw error;
  }

  const recursosProcesados = [];

  try {
    for (const detalle of detalleAjuste) {
      const { recursoId, tipoMovimiento, cantidad } = detalle;

      if (!mongoose.Types.ObjectId.isValid(recursoId)) {
        const error = new Error("El ID del recurso no es válido");
        error.statusCode = 400;
        throw error;
      }

      if (!["entrada", "salida"].includes(tipoMovimiento)) {
        const error = new Error(
          "El tipo de movimiento debe ser entrada o salida"
        );
        error.statusCode = 400;
        throw error;
      }

      if (!Number.isFinite(Number(cantidad)) || Number(cantidad) <= 0) {
        const error = new Error(
          "La cantidad del movimiento debe ser mayor a 0"
        );
        error.statusCode = 400;
        throw error;
      }

      const recurso = await Recurso.findById(recursoId);

      if (!recurso) {
        const error = new Error(
          `No existe el recurso con ID ${recursoId}`
        );
        error.statusCode = 404;
        throw error;
      }

      const cantidadMovimiento = Number(cantidad);

      if (tipoMovimiento === "entrada") {
        recurso.existenciaTotal += cantidadMovimiento;
      }

      if (tipoMovimiento === "salida") {
        const disponible =
          recurso.existenciaTotal -
          recurso.cantidadPrestada -
          recurso.cantidadEnReparacion -
          recurso.cantidadDesecho;

        if (cantidadMovimiento > disponible) {
          const error = new Error(
            `Stock insuficiente para el recurso ${recurso.nombre}. Disponible: ${disponible}`
          );
          error.statusCode = 400;
          throw error;
        }

        recurso.existenciaTotal -= cantidadMovimiento;
      }

      await recurso.save();

      recursosProcesados.push({
        recurso,
        tipoMovimiento,
        cantidad: cantidadMovimiento,
      });
    }

    const nuevoAjuste = new AjusteInventario(datosAjuste);

    const ajusteGuardado = await nuevoAjuste.save();

    return await obtenerPorId(ajusteGuardado._id);
  } catch (error) {
    for (const proceso of recursosProcesados.reverse()) {
      if (proceso.tipoMovimiento === "entrada") {
        proceso.recurso.existenciaTotal -= proceso.cantidad;
      }

      if (proceso.tipoMovimiento === "salida") {
        proceso.recurso.existenciaTotal += proceso.cantidad;
      }

      await proceso.recurso.save();
    }

    throw error;
  }
};

const actualizar = async (id, datosAjuste) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("El ID del ajuste de inventario no es válido");
    error.statusCode = 400;
    throw error;
  }

  if (datosAjuste.detalleAjuste) {
    const error = new Error(
      "Los movimientos del inventario no pueden modificarse mediante este endpoint"
    );
    error.statusCode = 400;
    throw error;
  }

  if (datosAjuste.numeroDocumento) {
    const existente = await AjusteInventario.findOne({
      numeroDocumento: datosAjuste.numeroDocumento,
      _id: { $ne: id },
    });

    if (existente) {
      const error = new Error(
        "Ya existe otro ajuste con ese número de documento"
      );
      error.statusCode = 409;
      throw error;
    }
  }

  if (datosAjuste.categoriaAjusteId) {
    await validarCategoria(datosAjuste.categoriaAjusteId);
  }

  if (datosAjuste.proveedorId) {
    await validarProveedor(datosAjuste.proveedorId);
  }

  const ajusteActualizado =
    await AjusteInventario.findByIdAndUpdate(
      id,
      datosAjuste,
      {
        new: true,
        runValidators: true,
      }
    );

  if (!ajusteActualizado) {
    const error = new Error("Ajuste de inventario no encontrado");
    error.statusCode = 404;
    throw error;
  }

  return await obtenerPorId(id);
};

const eliminar = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("El ID del ajuste de inventario no es válido");
    error.statusCode = 400;
    throw error;
  }

  const ajuste = await AjusteInventario.findById(id);

  if (!ajuste) {
    const error = new Error("Ajuste de inventario no encontrado");
    error.statusCode = 404;
    throw error;
  }

  const recursosProcesados = [];

  try {
    for (const detalle of ajuste.detalleAjuste) {
      const recurso = await Recurso.findById(detalle.recursoId);

      if (!recurso) {
        const error = new Error(
          "No se puede revertir el ajuste porque uno de los recursos ya no existe"
        );
        error.statusCode = 409;
        throw error;
      }

      const cantidad = Number(detalle.cantidad);

      if (detalle.tipoMovimiento === "entrada") {
        const disponible =
          recurso.existenciaTotal -
          recurso.cantidadPrestada -
          recurso.cantidadEnReparacion -
          recurso.cantidadDesecho;

        if (cantidad > disponible) {
          const error = new Error(
            `No se puede eliminar el ajuste porque ya se utilizó parte del inventario de ${recurso.nombre}`
          );
          error.statusCode = 409;
          throw error;
        }

        recurso.existenciaTotal -= cantidad;
      }

      if (detalle.tipoMovimiento === "salida") {
        recurso.existenciaTotal += cantidad;
      }

      await recurso.save();

      recursosProcesados.push({
        recurso,
        tipoMovimiento: detalle.tipoMovimiento,
        cantidad,
      });
    }

    await AjusteInventario.findByIdAndDelete(id);

    return ajuste;
  } catch (error) {
    for (const proceso of recursosProcesados.reverse()) {
      if (proceso.tipoMovimiento === "entrada") {
        proceso.recurso.existenciaTotal += proceso.cantidad;
      }

      if (proceso.tipoMovimiento === "salida") {
        proceso.recurso.existenciaTotal -= proceso.cantidad;
      }

      await proceso.recurso.save();
    }

    throw error;
  }
};

const obtenerPorCategoria = async (categoriaAjusteId) => {
  if (!mongoose.Types.ObjectId.isValid(categoriaAjusteId)) {
    const error = new Error(
      "El ID de la categoría de ajuste no es válido"
    );
    error.statusCode = 400;
    throw error;
  }

  const categoria = await CategoriaAjuste.findById(categoriaAjusteId);

  if (!categoria) {
    const error = new Error("Categoría de ajuste no encontrada");
    error.statusCode = 404;
    throw error;
  }

  return await AjusteInventario.find({
    categoriaAjusteId,
  })
    .populate("categoriaAjusteId", "nombre descripcion activo")
    .populate("proveedorId", "nombre nitORuc")
    .populate("detalleAjuste.recursoId", "nombre codigo")
    .sort({ fecha: -1 });
};

export {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  obtenerPorCategoria,
};
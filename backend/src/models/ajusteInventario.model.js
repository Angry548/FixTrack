import mongoose from "mongoose";

const detalleAjusteSchema = new mongoose.Schema(
  {
    recursoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recurso",
      required: [true, "El recurso es obligatorio"],
    },

    tipoMovimiento: {
      type: String,
      enum: {
        values: ["entrada", "salida"],
        message: "El tipo de movimiento debe ser entrada o salida",
      },
      required: [true, "El tipo de movimiento es obligatorio"],
    },

    cantidad: {
      type: Number,
      required: [true, "La cantidad es obligatoria"],
      min: [1, "La cantidad debe ser mayor a 0"],
    },

    costoUnitario: {
      type: mongoose.Schema.Types.Decimal128,
      min: [0, "El costo unitario no puede ser negativo"],
      default: 0,
    },
  },
  {
    _id: true,
  }
);

const ajusteInventarioSchema = new mongoose.Schema(
  {
    numeroDocumento: {
      type: String,
      required: [true, "El número de documento es obligatorio"],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [50, "El número de documento no puede superar 50 caracteres"],
    },

    fecha: {
      type: Date,
      default: Date.now,
    },

    justificacion: {
      type: String,
      required: [true, "La justificación es obligatoria"],
      trim: true,
      maxlength: [500, "La justificación no puede superar 500 caracteres"],
    },

    categoriaAjusteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CategoriaAjuste",
      required: [true, "La categoría de ajuste es obligatoria"],
    },

    proveedorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proveedor",
      default: null,
    },

    proveedor: {
      type: String,
      trim: true,
      maxlength: [150, "El proveedor no puede superar 150 caracteres"],
    },

    detalleAjuste: {
      type: [detalleAjusteSchema],
      validate: {
        validator: function (detalles) {
          return Array.isArray(detalles) && detalles.length > 0;
        },
        message: "Debe existir al menos un detalle de ajuste",
      },
    },
  },
  {
    timestamps: true,
  }
);

const AjusteInventario = mongoose.model(
  "AjusteInventario",
  ajusteInventarioSchema
);

export default AjusteInventario;
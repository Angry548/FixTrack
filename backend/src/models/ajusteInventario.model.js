const mongoose = require('mongoose');

const detalleAjusteSchema = new mongoose.Schema(
  {
    recursoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recurso',
      required: [true, 'El recurso es obligatorio']
    },

    tipoMovimiento: {
      type: String,
      required: [true, 'El tipo de movimiento es obligatorio'],
      enum: {
        values: ['entrada', 'salida'],
        message: 'El tipo de movimiento debe ser entrada o salida'
      }
    },

    cantidad: {
      type: Number,
      required: [true, 'La cantidad es obligatoria'],
      min: [1, 'La cantidad debe ser mayor que 0'],
      validate: {
        validator: Number.isInteger,
        message: 'La cantidad debe ser un número entero'
      }
    },

    costoUnitario: {
      type: mongoose.Schema.Types.Decimal128,
      required: [true, 'El costo unitario es obligatorio'],
      min: [0, 'El costo unitario no puede ser negativo']
    }
  },
  {
    _id: false
  }
);

const ajusteInventarioSchema = new mongoose.Schema(
  {
    numeroDocumento: {
      type: String,
      required: [true, 'El número de documento es obligatorio'],
      unique: true,
      trim: true,
      maxlength: [50, 'El número de documento no puede superar 50 caracteres']
    },

    fecha: {
      type: Date,
      required: [true, 'La fecha es obligatoria'],
      default: Date.now
    },

    justificacion: {
      type: String,
      required: [true, 'La justificación es obligatoria'],
      trim: true,
      minlength: [5, 'La justificación debe tener al menos 5 caracteres'],
      maxlength: [500, 'La justificación no puede superar 500 caracteres']
    },

    categoriaAjusteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CategoriaAjuste',
      required: [true, 'La categoría de ajuste es obligatoria']
    },

    proveedorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proveedor',
      default: null
    },

    detalleAjuste: {
      type: [detalleAjusteSchema],
      required: [true, 'Debe existir al menos un detalle de ajuste'],
      validate: {
        validator: function (detalles) {
          return Array.isArray(detalles) && detalles.length >= 1;
        },
        message: 'El ajuste debe contener al menos un detalle'
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  'AjusteInventario',
  ajusteInventarioSchema
);
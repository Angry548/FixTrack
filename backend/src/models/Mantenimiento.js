const mongoose = require('mongoose');

const detallePreventivoSchema = new mongoose.Schema(
  {
    frecuenciaDias: {
      type: Number,
      required: [true, 'La frecuencia en días es obligatoria'],
      min: [1, 'La frecuencia debe ser mayor que 0'],
      validate: {
        validator: Number.isInteger,
        message: 'La frecuencia debe ser un número entero'
      }
    },

    proximaFechaProgramada: {
      type: Date,
      required: [true, 'La próxima fecha programada es obligatoria']
    }
  },
  {
    _id: false
  }
);

const detalleCorrectivoSchema = new mongoose.Schema(
  {
    horasTrabajadas: {
      type: Number,
      required: [true, 'Las horas trabajadas son obligatorias'],
      min: [0, 'Las horas trabajadas no pueden ser negativas']
    },

    costoRepuestos: {
      type: mongoose.Schema.Types.Decimal128,
      required: [true, 'El costo de repuestos es obligatorio'],
      min: [0, 'El costo de repuestos no puede ser negativo']
    },

    detallesTecnicos: {
      type: String,
      required: [true, 'Los detalles técnicos son obligatorios'],
      trim: true,
      maxlength: [1000, 'Los detalles técnicos no pueden superar 1000 caracteres']
    },

    resolucionTecnica: {
      type: String,
      required: [true, 'La resolución técnica es obligatoria'],
      trim: true,
      maxlength: [1000, 'La resolución técnica no puede superar 1000 caracteres']
    }
  },
  {
    _id: false
  }
);

const mantenimientoSchema = new mongoose.Schema(
  {
    recursoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recurso',
      required: [true, 'El recurso es obligatorio']
    },

    empleadoReportaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Empleado',
      required: [true, 'El empleado que reporta es obligatorio']
    },

    tipo: {
      type: String,
      required: [true, 'El tipo de mantenimiento es obligatorio'],
      enum: {
        values: ['incidencia', 'preventivo', 'correctivo'],
        message:
          'El tipo debe ser incidencia, preventivo o correctivo'
      }
    },

    estado: {
      type: String,
      required: [true, 'El estado es obligatorio'],
      enum: {
        values: [
          'notificado',
          'en_proceso',
          'corregido',
          'programado'
        ],
        message:
          'El estado debe ser notificado, en_proceso, corregido o programado'
      },
      default: 'notificado'
    },

    descripcionProblema: {
      type: String,
      required: [true, 'La descripción del problema es obligatoria'],
      trim: true,
      minlength: [5, 'La descripción debe tener al menos 5 caracteres'],
      maxlength: [1000, 'La descripción no puede superar 1000 caracteres']
    },

    fechaCreacion: {
      type: Date,
      required: true,
      default: Date.now
    },

    fechaInicio: {
      type: Date
    },

    fechaFinalizacion: {
      type: Date
    },

    detallePreventivo: {
      type: detallePreventivoSchema,
      default: undefined
    },

    detalleCorrectivo: {
      type: detalleCorrectivoSchema,
      default: undefined
    }
  },
  {
    timestamps: true
  }
);

/*
 * Validaciones relacionadas entre campos.
 */
mantenimientoSchema.pre('validate', function (next) {
  if (this.fechaInicio && this.fechaInicio < this.fechaCreacion) {
    this.invalidate(
      'fechaInicio',
      'La fecha de inicio no puede ser anterior a la fecha de creación'
    );
  }

  if (
    this.fechaFinalizacion &&
    this.fechaInicio &&
    this.fechaFinalizacion < this.fechaInicio
  ) {
    this.invalidate(
      'fechaFinalizacion',
      'La fecha de finalización no puede ser anterior a la fecha de inicio'
    );
  }

  if (this.tipo === 'preventivo') {
    if (!this.detallePreventivo) {
      this.invalidate(
        'detallePreventivo',
        'El detalle preventivo es obligatorio para un mantenimiento preventivo'
      );
    }

    if (this.detalleCorrectivo) {
      this.invalidate(
        'detalleCorrectivo',
        'Un mantenimiento preventivo no debe tener detalle correctivo'
      );
    }
  }

  if (this.tipo === 'correctivo') {
    if (!this.detalleCorrectivo) {
      this.invalidate(
        'detalleCorrectivo',
        'El detalle correctivo es obligatorio para un mantenimiento correctivo'
      );
    }

    if (this.detallePreventivo) {
      this.invalidate(
        'detallePreventivo',
        'Un mantenimiento correctivo no debe tener detalle preventivo'
      );
    }
  }

  if (this.tipo === 'incidencia') {
    if (this.detallePreventivo) {
      this.invalidate(
        'detallePreventivo',
        'Una incidencia no debe tener detalle preventivo'
      );
    }

    if (this.detalleCorrectivo) {
      this.invalidate(
        'detalleCorrectivo',
        'Una incidencia no debe tener detalle correctivo'
      );
    }
  }

  next();
});

module.exports = mongoose.model('Mantenimiento', mantenimientoSchema);
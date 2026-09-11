const mongoose = require('mongoose');

const asignacionSchema = new mongoose.Schema(
  {
    recursoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recurso',
      required: [true, 'El recurso es obligatorio']
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

    fechaAsignacion: {
      type: Date,
      required: [true, 'La fecha de asignación es obligatoria'],
      default: Date.now
    }
  },
  {
    _id: true
  }
);

const empleadoSchema = new mongoose.Schema(
  {
    nombres: {
      type: String,
      required: [true, 'Los nombres son obligatorios'],
      trim: true,
      minlength: [2, 'Los nombres deben tener al menos 2 caracteres'],
      maxlength: [100, 'Los nombres no pueden superar 100 caracteres']
    },

    apellidos: {
      type: String,
      required: [true, 'Los apellidos son obligatorios'],
      trim: true,
      minlength: [2, 'Los apellidos deben tener al menos 2 caracteres'],
      maxlength: [100, 'Los apellidos no pueden superar 100 caracteres']
    },

    codigoEmpleado: {
      type: String,
      required: [true, 'El código del empleado es obligatorio'],
      unique: true,
      trim: true,
      maxlength: [50, 'El código no puede superar 50 caracteres']
    },

    correo: {
      type: String,
      required: [true, 'El correo es obligatorio'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Debe proporcionar un correo electrónico válido'
      ]
    },

    telefono: {
      type: String,
      required: [true, 'El teléfono es obligatorio'],
      trim: true,
      maxlength: [20, 'El teléfono no puede superar 20 caracteres']
    },

    cargo: {
      type: String,
      required: [true, 'El cargo es obligatorio'],
      trim: true,
      maxlength: [100, 'El cargo no puede superar 100 caracteres']
    },

    areaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Area',
      required: [true, 'El área es obligatoria']
    },

    activo: {
      type: Boolean,
      default: true
    },

    asignaciones: {
      type: [asignacionSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Empleado', empleadoSchema);
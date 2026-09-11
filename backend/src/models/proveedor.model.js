const mongoose = require('mongoose');

const proveedorSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del proveedor es obligatorio'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
      maxlength: [150, 'El nombre no puede superar 150 caracteres']
    },

    nitORuc: {
      type: String,
      required: [true, 'El NIT/RUC es obligatorio'],
      unique: true,
      trim: true,
      maxlength: [30, 'El NIT/RUC no puede superar 30 caracteres']
    },

    telefono: {
      type: String,
      required: [true, 'El teléfono es obligatorio'],
      trim: true,
      maxlength: [20, 'El teléfono no puede superar 20 caracteres']
    },

    correo: {
      type: String,
      required: [true, 'El correo es obligatorio'],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Debe proporcionar un correo electrónico válido'
      ]
    },

    direccion: {
      type: String,
      required: [true, 'La dirección es obligatoria'],
      trim: true,
      maxlength: [250, 'La dirección no puede superar 250 caracteres']
    },

    activo: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Proveedor', proveedorSchema);
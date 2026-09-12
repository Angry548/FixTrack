import mongoose from "mongoose";

const recursoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del recurso es obligatorio"],
      trim: true,
      minlength: [2, "El nombre debe tener al menos 2 caracteres"],
      maxlength: [150, "El nombre no puede superar 150 caracteres"],
    },

    codigo: {
      type: String,
      required: [true, "El código del recurso es obligatorio"],
      unique: true,
      trim: true,
      maxlength: [50, "El código no puede superar 50 caracteres"],
    },

    descripcion: {
      type: String,
      trim: true,
      maxlength: [500, "La descripción no puede superar 500 caracteres"],
    },

    areaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Area",
      required: [true, "El área es obligatoria"],
    },

    categoriaRecursoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CategoriaRecurso",
      required: [true, "La categoría del recurso es obligatoria"],
    },

    existenciaTotal: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "La existencia total no puede ser negativa"],
      validate: {
        validator: Number.isInteger,
        message: "La existencia total debe ser un número entero",
      },
    },

    cantidadPrestada: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "La cantidad prestada no puede ser negativa"],
      validate: {
        validator: Number.isInteger,
        message: "La cantidad prestada debe ser un número entero",
      },
    },

    cantidadEnReparacion: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "La cantidad en reparación no puede ser negativa"],
      validate: {
        validator: Number.isInteger,
        message: "La cantidad en reparación debe ser un número entero",
      },
    },

    cantidadDesecho: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "La cantidad en desecho no puede ser negativa"],
      validate: {
        validator: Number.isInteger,
        message: "La cantidad en desecho debe ser un número entero",
      },
    },

    metadatos: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Recurso = mongoose.model("Recurso", recursoSchema);

export default Recurso;
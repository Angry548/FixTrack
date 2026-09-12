import mongoose from "mongoose";

const categoriaRecursoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre de la categoría es obligatorio"],
      trim: true,
      unique: true,
      minlength: [2, "El nombre debe tener al menos 2 caracteres"],
      maxlength: [100, "El nombre no puede superar 100 caracteres"],
    },

    descripcion: {
      type: String,
      trim: true,
      maxlength: [300, "La descripción no puede superar 300 caracteres"],
    },

    camposObligatorios: {
      type: [String],
      default: [],
      validate: {
        validator: function (campos) {
          return campos.every(
            (campo) =>
              typeof campo === "string" &&
              campo.trim().length > 0
          );
        },
        message: "Los campos obligatorios deben ser textos válidos",
      },
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

const CategoriaRecurso = mongoose.model(
  "CategoriaRecurso",
  categoriaRecursoSchema
);

export default CategoriaRecurso;
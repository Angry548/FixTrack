import mongoose from "mongoose";

const categoriaAjusteSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre de la categoría de ajuste es obligatorio"],
      trim: true,
      minlength: [2, "El nombre debe tener al menos 2 caracteres"],
      maxlength: [100, "El nombre no puede superar 100 caracteres"],
      unique: true,
    },

    descripcion: {
      type: String,
      trim: true,
      maxlength: [300, "La descripción no puede superar 300 caracteres"],
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

const CategoriaAjuste = mongoose.model(
  "CategoriaAjuste",
  categoriaAjusteSchema
);

export default CategoriaAjuste;
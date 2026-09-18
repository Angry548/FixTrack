import mongoose from "mongoose";

const grupoRecursoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del grupo es obligatorio"],
      trim: true,
      minlength: [2, "El nombre debe tener al menos 2 caracteres"],
      maxlength: [100, "El nombre no puede superar 100 caracteres"],
    },

    descripcion: {
      type: String,
      trim: true,
      maxlength: [300, "La descripción no puede superar 300 caracteres"],
    },

    recursosAsociados: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recurso",
      },
    ],

    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Se corrige "grupoRecursosSchema" por "grupoRecursoSchema"
const GrupoRecurso = mongoose.model("GrupoRecurso", grupoRecursoSchema);

export default GrupoRecurso;
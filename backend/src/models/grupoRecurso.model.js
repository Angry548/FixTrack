import mongoose from "mongoose";

const grupoRecursosSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del grupo es obligatorio"],
      trim: true,
      minlength: [2, "El nombre debe tener al menos 2 caracteres"],
      maxlength: [150, "El nombre no puede superar 150 caracteres"],
    },

    descripcion: {
      type: String,
      trim: true,
      maxlength: [500, "La descripción no puede superar 500 caracteres"],
    },

    recursosAsociados: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Recurso",
        },
      ],
      default: [],
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

const GrupoRecursos = mongoose.model("GrupoRecursos", grupoRecursosSchema);

export default GrupoRecursos;
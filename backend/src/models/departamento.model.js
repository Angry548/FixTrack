import mongoose from "mongoose";

const departamentoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del departamento es obligatorio"],
      trim: true,
      minlength: [2, "El nombre debe tener al menos 2 caracteres"],
      maxlength: [100, "El nombre no puede superar 100 caracteres"],
    },

    descripcion: {
      type: String,
      trim: true,
      maxlength: [300, "La descripción no puede superar 300 caracteres"],
    },

    empresaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Empresa",
      required: [true, "La empresa es obligatoria"],
    },
  },
  {
    timestamps: true,
  }
);

const Departamento = mongoose.model("Departamento", departamentoSchema);

export default Departamento;
import mongoose from "mongoose";

const empresaSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre de la empresa es obligatorio"],
      trim: true,
      minlength: [2, "El nombre debe tener al menos 2 caracteres"],
      maxlength: [150, "El nombre no puede superar 150 caracteres"],
    },

    direccion: {
      type: String,
      required: [true, "La dirección es obligatoria"],
      trim: true,
      maxlength: [250, "La dirección no puede superar 250 caracteres"],
    },

    telefono: {
      type: String,
      required: [true, "El teléfono es obligatorio"],
      trim: true,
      maxlength: [20, "El teléfono no puede superar 20 caracteres"],
    },

    nitORuc: {
      type: String,
      required: [true, "El NIT/RUC es obligatorio"],
      unique: true,
      trim: true,
      maxlength: [30, "El NIT/RUC no puede superar 30 caracteres"],
    },
  },
  {
    timestamps: true,
  }
);

const Empresa = mongoose.model("Empresa", empresaSchema);

export default Empresa;
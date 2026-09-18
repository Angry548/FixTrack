import mongoose from "mongoose";

const areaSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del área es obligatorio"],
      trim: true,
      minlength: [2, "El nombre debe tener al menos 2 caracteres"],
      maxlength: [100, "El nombre no puede superar 100 caracteres"],
    },

    descripcion: {
      type: String,
      trim: true,
      maxlength: [300, "La descripción no puede superar 300 caracteres"],
    },

    ubicacion: {
      type: String,
      required: [true, "La ubicación del área es obligatoria"],
      trim: true,
      maxlength: [200, "La ubicación no puede superar 200 caracteres"],
    },

    departamentoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Departamento",
      required: [true, "El departamento es obligatorio"],
    },
  },
  {
    timestamps: true,
  }
);

const Area = mongoose.model("Area", areaSchema);

export default Area;
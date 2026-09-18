import mongoose from "mongoose";

const asignacionSchema = new mongoose.Schema(
  {
    recursoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recurso",
      required: [true, "El recurso es obligatorio"],
    },

    cantidad: {
      type: Number,
      required: [true, "La cantidad asignada es obligatoria"],
      min: [1, "La cantidad debe ser mayor a 0"],
    },

    fechaAsignacion: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
);

const empleadoSchema = new mongoose.Schema(
  {
    nombres: {
      type: String,
      required: [true, "Los nombres del empleado son obligatorios"],
      trim: true,
      minlength: [2, "Los nombres deben tener al menos 2 caracteres"],
      maxlength: [100, "Los nombres no pueden superar 100 caracteres"],
    },

    apellidos: {
      type: String,
      required: [true, "Los apellidos del empleado son obligatorios"],
      trim: true,
      minlength: [2, "Los apellidos deben tener al menos 2 caracteres"],
      maxlength: [100, "Los apellidos no pueden superar 100 caracteres"],
    },

    codigoEmpleado: {
      type: String,
      required: [true, "El código del empleado es obligatorio"],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [50, "El código no puede superar 50 caracteres"],
    },

    correo: {
      type: String,
      required: [true, "El correo del empleado es obligatorio"],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [150, "El correo no puede superar 150 caracteres"],
    },

    telefono: {
      type: String,
      trim: true,
      maxlength: [20, "El teléfono no puede superar 20 caracteres"],
    },

    cargo: {
      type: String,
      required: [true, "El cargo del empleado es obligatorio"],
      trim: true,
      maxlength: [100, "El cargo no puede superar 100 caracteres"],
    },

    areaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Area",
      required: [true, "El área es obligatoria"],
    },

    activo: {
      type: Boolean,
      default: true,
    },

    asignaciones: {
      type: [asignacionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Empleado = mongoose.model("Empleado", empleadoSchema);

export default Empleado;
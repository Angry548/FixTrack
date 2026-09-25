import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del usuario es obligatorio"],
      trim: true,
      minlength: [2, "El nombre debe tener al menos 2 caracteres"],
      maxlength: [100, "El nombre no puede superar 100 caracteres"],
    },

    correo: {
      type: String,
      required: [true, "El correo es obligatorio"],
      trim: true,
      lowercase: true,
      unique: true,
      maxlength: [150, "El correo no puede superar 150 caracteres"],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "El correo proporcionado no es válido",
      ],
    },

    passwordHash: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      select: false,
    },

    rol: {
      type: String,
      required: [true, "El rol es obligatorio"],
      enum: {
        values: [
          "administrador",
          "inventario",
          "tecnico",
          "consulta",
        ],
        message:
          "El rol debe ser administrador, inventario, tecnico o consulta",
      },
      default: "consulta",
    },

    empleadoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Empleado",
      unique: true,
      sparse: true,
    },

    activo: {
      type: Boolean,
      default: true,
    },

    ultimoAcceso: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.passwordHash;
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

export default mongoose.model("Usuario", usuarioSchema);
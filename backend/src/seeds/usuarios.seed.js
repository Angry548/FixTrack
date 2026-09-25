import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Usuario from "../models/usuario.model.js";
import * as usuarioService from "../services/usuario.service.js";

dotenv.config();

const obtenerUsuariosIniciales = () => {
  const usuarios = [
    {
      nombre: "Administrador FixTrack",
      correo:
        process.env.SEED_ADMIN_EMAIL ||
        "admin@fixtrack.com",
      password:
        process.env.SEED_ADMIN_PASSWORD,
      rol: "administrador",
    },

    {
      nombre: "Encargado de Inventario",
      correo:
        process.env.SEED_INVENTARIO_EMAIL ||
        "inventario@fixtrack.com",
      password:
        process.env.SEED_INVENTARIO_PASSWORD,
      rol: "inventario",
    },

    {
      nombre: "Técnico FixTrack",
      correo:
        process.env.SEED_TECNICO_EMAIL ||
        "tecnico@fixtrack.com",
      password:
        process.env.SEED_TECNICO_PASSWORD,
      rol: "tecnico",
    },

    {
      nombre: "Usuario de Consulta",
      correo:
        process.env.SEED_CONSULTA_EMAIL ||
        "consulta@fixtrack.com",
      password:
        process.env.SEED_CONSULTA_PASSWORD,
      rol: "consulta",
    },
  ];

  for (const usuario of usuarios) {
    if (!usuario.password) {
      throw new Error(
        `Falta configurar la contraseña para ${usuario.correo}`
      );
    }
  }

  return usuarios;
};

const ejecutarSeed = async () => {
  try {
    await connectDB();

    const usuariosIniciales =
      obtenerUsuariosIniciales();

    for (const datos of usuariosIniciales) {
      const existente = await Usuario.findOne({
        correo: datos.correo.toLowerCase(),
      });

      if (!existente) {
        await usuarioService.crearUsuario({
          ...datos,
          activo: true,
        });

        console.log(
          `✅ Usuario creado: ${datos.correo} - ${datos.rol}`
        );
      } else {
        await usuarioService.actualizarUsuario(
          existente._id,
          {
            nombre: datos.nombre,
            correo: datos.correo,
            password: datos.password,
            rol: datos.rol,
            activo: true,
          }
        );

        console.log(
          `🔄 Usuario actualizado: ${datos.correo} - ${datos.rol}`
        );
      }
    }

    console.log(
      "================================="
    );
    console.log(
      "✅ Seed de usuarios completado"
    );
    console.log(
      "================================="
    );
  } catch (error) {
    console.error(
      "❌ Error ejecutando seed de usuarios:"
    );

    console.error(error.message);

    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

ejecutarSeed();
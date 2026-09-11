import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Conectar con MongoDB
    await connectDB();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log("=================================");
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      console.log(`🌐 http://localhost:${PORT}`);
      console.log("=================================");
    });

  } catch (error) {
    console.error("❌ Error al iniciar el servidor:");
    console.error(error.message);

    process.exit(1);
  }
};

startServer();
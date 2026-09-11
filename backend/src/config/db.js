import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI);

    console.log("=================================");
    console.log("✅ MongoDB conectado correctamente");
    console.log(`📦 Base de datos: ${connection.connection.name}`);
    console.log(`🌐 Host: ${connection.connection.host}`);
    console.log("=================================");
  } catch (error) {
    console.error("❌ Error al conectar con MongoDB:");
    console.error(error.message);

    process.exit(1);
  }
};

export default connectDB;
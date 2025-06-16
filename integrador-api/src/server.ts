import dotenv from 'dotenv';
import { app } from './app';     
import { connectDB } from './utils/database';

dotenv.config();

const PORT: number = Number(process.env.PORT) || 3000;

const startServer = async (): Promise<void> => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
};

startServer();

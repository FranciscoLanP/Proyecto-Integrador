import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI!;

  mongoose.set('strictPopulate', false);

  await mongoose.connect(uri);
  console.log('✅ MongoDB conectada a', uri);
};

import mongoose from "mongoose";

export const dbConnect = async () => {
  try {
    // const uri = process.env.D_MONGO_URI;
    const uri = process.env.P_MONGO_URI;
    const { connection } = await mongoose.connect(uri);
    console.log(
      `${connection.name.replace("b", "B")} database connected to host: ${
        connection.host
      }`
    );
  } catch (error) {
    console.log(`MONGODB connection error: ${error}`);
    process.exit(1);
  }
};

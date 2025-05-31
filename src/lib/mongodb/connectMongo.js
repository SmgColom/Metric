import mongoose from "mongoose";

const connectMongo = async () => {
  try {
    // Pass connection string to connect function
    const connectionResult = await mongoose.connect(process.env.MONGO_ATLAS_CONNECTION_URI);
    if(connectionResult) console.log("Connection to MongoDb 🌏");

  } catch(err) {
    (err) => console.error("Connection failed", err);
  }
}

export default connectMongo;


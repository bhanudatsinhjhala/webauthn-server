import express from "express";
import cors from "cors";
import { envConfig } from "./config/env.config.js";
import router from "./routes/index.js";
import mongoose from "mongoose";
import { errorConverter, errorHandler } from "./middelware/error.js";

(async () => {
  try {
    await mongoose.connect(envConfig.mongodbUrl);
    console.log("Mongoose connected successfully");
  } catch (error) {
    console.log("error", error);
  }
})();
// create a server
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", router);
app.use(errorConverter);
app.use(errorHandler);

// listen server
app.listen(envConfig.port, () =>
  console.log(`Server is running on port ~ ${envConfig.port}`)
);

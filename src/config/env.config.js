import * as dotenv from "dotenv";
dotenv.config();

export const envConfig = {
  port: process.env.PORT,
  mongodbUrl: process.env.MONGODB_URL,
  jwtSecret: process.env.JWT_SECRET,
};

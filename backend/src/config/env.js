import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  RPC_URL: process.env.RPC_URL,
  TOKEN_ADDRESS: process.env.TOKEN_ADDRESS,
  TREASURY_ADDRESS: process.env.TREASURY_ADDRESS,
  MONGODB_URI: process.env.MONGODB_URI

};
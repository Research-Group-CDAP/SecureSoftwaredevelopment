import { ServerApiVersion } from "mongodb";
import mongoose from "mongoose";
import path from "path";
import { logger } from "../utils";

let database;
const certificate = path.join(__dirname, "..", "..", "X509-cert-2998647950915982855.pem");

export const dbConnect = () => {
  if (database) return;

  mongoose
    .connect(process.env.MONGODB_URI, {
      ssl: true,
      sslKey: certificate,
      sslCert: certificate,
      serverApi: ServerApiVersion.v1,
    })
    .then((connection) => {
      database = connection.connection;
      logger.info(`Database synced`);
    })
    .catch((error) => {
      logger.error(`Database connection error: ${error.message}`);
    });
};

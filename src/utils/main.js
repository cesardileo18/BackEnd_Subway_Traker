import winston from "winston";
import { connect } from "mongoose";
import env from "../config/enviroment.config.js";
// MONGOOSE
export async function connectMongo() {
  try {
    await connect(process.env.MONGO_URL,
			{
				dbName: "SubwayTraker",
			});
    logger.info("Conexión exitosa a la base de datos.");
  } catch (e) {
    logger.error("Falló la conexión a la base de datos.");
    throw "Falló la conexion";
  }
}

export const logger = winston.createLogger({
    transports: [
      new winston.transports.Console({
        level: "info",
        format: winston.format.colorize({ all: true }),
      }),
      new winston.transports.File({
        filename: "./errors.log",
        level: "warn",
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} ${level}: ${message}`;
          }),
        ),
      }),
    ],
  });
import express from 'express';
import cors from "cors";
import "express-async-errors";
import { errorHandler } from './middlewares/main.js'
import CustomError from './services/errors/custom-error.js';
import { logger, connectMongo } from './utils/main.js';
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUiExpress from "swagger-ui-express";
import subwayRouter from './routes/subway.router.js';
import { dirname } from "path";
import { fileURLToPath } from "url";
import Errors from './services/errors/enums.js';


const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9000
connectMongo()
// Middleware para analizar el cuerpo de las solicitudes JSON
app.use(express.json());
// Middleware para analizar el cuerpo de las solicitudes URL-encoded
app.use(express.urlencoded({ extended: true }));
// Habilita CORS
app.use(cors());

// Middleware para servir la documentación de Swagger
app.listen(PORT, () => {
  logger.info(`Servidor en funcionamiento http://localhost:${PORT}`);
});
const swaggerOptions = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "Documentación Subway Traker",
      description: "Subway Traker",
      version: "1.0.0",
    },
  },
  apis: [`${__dirname}/docs/**/*.yaml`], // Ruta a tus archivos de documentación YAML
};
const specs = swaggerJSDoc(swaggerOptions);
app.get('/', (req, res) => {
  const version = 'version: 1.0.0'; // Define la versión de la API
  res.status(200).json({ version });
});

app.use("/api/doc", swaggerUiExpress.serve, swaggerUiExpress.setup(specs));
app.use("/api", subwayRouter)

app.get("*", (req, res, next) => {
  try {
    CustomError.createError({
      name: "Page Not Found",
      cause: "Non existent path",
      message: "The path you are trying to access does not exist",
      code: Errors.ROUTING_ERROR,
    });
  } catch (error) {
    next(error);
  }
});
app.use(errorHandler);
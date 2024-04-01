import swaggerJSDoc from "swagger-jsdoc";
import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

const swaggerOptions = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "Documentación Bicycle Traker",
      description: "Bicycle Traker",
      version: "1.0.0",
    },
  },
  apis: [`${__dirname}/docs/**/*.yaml`], // Ruta a tus archivos de documentación YAML
};

const specs = swaggerJSDoc(swaggerOptions);

export default specs;

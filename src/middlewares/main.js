import Errors from "../services/errors/enums.js";
import { logger } from "../utils/main.js";

export function errorHandler(error, req, res, next) {
  switch (error.code) {
    case Errors.ROUTING_ERROR:
      const notFound = "Esta página no existe";
      logger.error(`error: ${notFound}`);
      return res.status(404).json({ error: notFound });
    case Errors.ID_ERROR:
      const errorId = "El ID ingresado no existe";
      logger.error(`error: ${errorId}`);
      return res.status(404).json({ error: errorId });
    default:
      logger.error(`status: error, ${error}`);
      res.status(500).json({ status: "error", error: "Unhandled error" });
      break;
  }
}

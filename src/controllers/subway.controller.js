import { subwayServices } from '../services/subway.services.js'
import { logger } from '../utils/main.js';

class SubwayController {
  async getSubwayStatus(req, res) {
    try {
      const data = await subwayServices.getSubwayStatus();
      logger.info('getSubwayStatus, retorno de datos')
      res.status(200).json(data);
    } catch (error) {
      logger.error(`Error: ${error}`);
      res.status(500).json({ error: "Ha ocurrido un error al obtener el estado del subte." });
    }
  };
  async getSubwayInformation(req, res) {
    try {
      const data = await subwayServices.getSubwayInformation();
      logger.info('getSubwayInformation, retorno de datos')
      res.status(200).json(data);
    } catch (error) {
      logger.error(`Error: ${error}`);
      res.status(500).json({ error: "Ha ocurrido un error al obtener información del subte." });
    }
  };

  async postSubwayPrice(req, res) {
    try {
      const data = await subwayServices.postSubwayPrice()
      logger.info('postSubwayPrice, retorno de datos')
      res.status(200).json(data);
    } catch (error) {
      logger.error(`Error_postSubwayPrice: ${error}`);
      res.status(500).json({ error: "Ha ocurrido un error al insertar la información." });
    }
  }
  async putSubwayPrice(req, res) {
    try {
      const data = await subwayServices.putSubwayPrice();
      logger.info('putSubwayPrice, retorno de datos');
      // res.status(200).json(data);
      res && res.status(200) ? res.status(200).json(data):data;

    } catch (error) {
      logger.error(`Error_putSubwayPrice: ${error}`);
      res.status(500).json({ error: "Ha ocurrido un error al actualizar información." });

    }
  }
  async getSubwayPrice(req, res) {
    try {
      const data = await subwayServices.getSubwayPrice();
      logger.info('getSubwayPrice, retorno de datos')
      res.status(200).json(data);
    } catch (error) {
      logger.error(`Error: ${error}`);
      res.status(500).json({ error: "Ha ocurrido un error." });
    }
  }
  async subwayPriceDelete(req, res) {
    try {
      const { _id } = req.params;
      const data = await subwayServices.subwayPriceDelete(_id);
      logger.info('subwayPriceDelete, retorno de datos')
      if (data?.deletedCount > 0) {
        return res.status(200).json({
          status: "success",
          msg: "Colección eliminada",
        });
      } else {
        return res.status(404).json({
          status: "error",
          msg: "user not found",
          payload: {},
        });
      }
    } catch (error) {
      logger.error(`Error: ${error}`);
      res.status(500).json({ error: "Ha ocurrido un error." });
    }
  };
  async subwayPriceDeleteAutomatic(req, res) {
    try {
      const data = await subwayServices.subwayPriceDeleteAutomatic();
      if (data && data.msg === "No existen datos a eliminar") {
        logger.info('subwayPriceDeleteAutomatic, retorno de datos');
        return res.status(404).json({
          status: "error",
          msg: "No existen datos a eliminar",
        });
      } else if (data) {
        logger.info('subwayPriceDeleteAutomatic, retorno de datos');
        return res.status(200).json({
          status: "success",
          msg: "Colección eliminada",
        });
      } else {
        return res.status(500).json({
          status: "error",
          msg: "Error interno del servidor",
        });
      }
    } catch (error) {
      logger.error(`Error: ${error}`);
      res.status(500).json({ error: "Ha ocurrido un error." });
    }
  };
}
export const subwayController = new SubwayController()
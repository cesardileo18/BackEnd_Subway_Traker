import { SubwayPriceMongoose } from "./model/subway.mongoose.js";
import { logger } from "../utils/main.js";

class SubwayModel {
    async postPrice(price) {
        try {
            const priceCreated = await SubwayPriceMongoose.create(price);
            return priceCreated;
        } catch (error) {
            if (error.name === 'ValidationError') {
                // Manejar errores de validación de Mongoose
                const validationErrors = Object.values(error.errors).map(error => error.message);
                logger.error(`Error de validación al crear el precio, al insertar en la base de datos: ${validationErrors.join(', ')}`);
                return { error: 'Error de validación al crear el precio, al insertar en la base de datos', validationErrors };
            } else {
                // Manejar otros errores
                logger.error('Error al insertar en la base de datos', error);
                return { error: 'Error al insertar en la base de datos' };
            }
        }
    }
    async getPrice() {
        try {
            const price = await SubwayPriceMongoose.find({});
            return price;
        } catch (error) {
            logger.error(error)
        }
    }    async getPriceById() {
        try {
            const price = await SubwayPriceMongoose.findById({});
            return price;
        } catch (error) {
            logger.error(error)
        }
    }
    async updatePrice(id, updatedData) {
        try {
            const updatedPrice = await SubwayPriceMongoose.findByIdAndUpdate(id, updatedData, { new: true });
            return updatedPrice;
        } catch (error) {
            logger.error(error);
        }
    }
    async deleteOne (_id){
        try {
            const updatedPrice = await SubwayPriceMongoose.deleteOne({_id: _id})
            return updatedPrice;
        } catch (error) {
            logger.error(error);
        }
    }
}
export const subwayModel = new SubwayModel()
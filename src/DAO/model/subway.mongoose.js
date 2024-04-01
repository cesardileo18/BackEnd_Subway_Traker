import { Schema, model } from "mongoose";

// Define el esquema de Mongoose para la tarifa
const TarifaSchema = new Schema({
	titulo: String
});
// Define el esquema principal de PreciosSubte
const PreciosSubteSchema = new Schema({
	tituloTarifa: [TarifaSchema],
	preciosPorViaje: [{
		rango: String,
		precio: String
	}],
	fecha: { type: String }
});
// Añadir el identificador único (ID) automáticamente generado
PreciosSubteSchema.add({ _id: { type: Schema.Types.ObjectId, auto: true } });
export const SubwayPriceMongoose = model('SubwayPrice', PreciosSubteSchema)
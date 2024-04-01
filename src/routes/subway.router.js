import express from "express";
import { subwayController } from "../controllers/subway.controller.js";
import cron from 'node-cron';

const subwayRouter = express.Router();
// Obtiene el estado de una línea del metro con eventos
subwayRouter.get('/subway-status', subwayController.getSubwayStatus);
// Obtiene información de todas las líneas del metro y sus estaciones con horarios
subwayRouter.get('/subway-information', subwayController.getSubwayInformation);
 // Obtiene información sobre los precios del metro
subwayRouter.get('/subway-prices', subwayController.getSubwayPrice);
// Realiza scraping para extraer información de precios
subwayRouter.get('/scraped-data', subwayController.postSubwayPrice)
 // Realiza scraping para extraer información de precios (solo ejecutable desde Postman o formulario)
subwayRouter.post('/scraped-data', subwayController.postSubwayPrice)
// Actualiza los datos de precios desde el navegador
subwayRouter.get('/update-scraped-data', subwayController.putSubwayPrice)
// Actualiza los datos de precios desde un formulario
subwayRouter.put('/update-scraped-data', subwayController.putSubwayPrice)
 // Elimina un registro de la base de datos por ID
subwayRouter.delete('/scraped-data/:_id', subwayController.subwayPriceDelete)
// Elimina el último registro de la base de datos de manera automatizada
subwayRouter.get('/delete-latest-scraped-data', subwayController.subwayPriceDeleteAutomatic)

// Configurar tarea programada para ejecutar cada 3 días
cron.schedule('0 0 */3 * *', async () => {
    try {
        console.log('Ejecutando la tarea programada para actualizar el precio del subte cada 3 días...');
        await subwayController.putSubwayPrice();
        console.log('Tarea programada completada.');
    } catch (error) {
        console.error('Error al ejecutar la tarea programada:', error);
    }
});

export default subwayRouter;



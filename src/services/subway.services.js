import fetch from 'node-fetch';
import { InfomationSubway, SubwayAlert} from '../entity/infomationSubway.entity.js';
import puppeteer from 'puppeteer';
import { subwayModel } from '../DAO/subway.model.js';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { logger } from '../utils/main.js';
import { DateTime } from 'luxon';

class SubwayServices {
    constructor() {
        // Especificar la zona horaria predeterminada
        this.defaultTimeZone = 'America/Argentina/Buenos_Aires';
    }
    convertirTiempo = (tiempoSegundos) => {
        // Convertir el tiempo en segundos a una instancia de DateTime de Luxon
        const fecha = DateTime.fromSeconds(tiempoSegundos, { zone: this.defaultTimeZone });
        // Formatear la fecha y hora en el formato deseado
        const fechaFormateada = fecha.toFormat('dd/MM/yyyy HH:mm:ss');
        return fechaFormateada;
    };
    // Función para convertir retraso en formato legible
    convertirRetraso = (retrasoSegundos) => {
        const minutos = Math.floor(retrasoSegundos / 60);
        const segundos = retrasoSegundos % 60;
        return `${minutos} minutos y ${segundos} segundos`;
    };
    async getSubwayStatus(req, res) {
        const url = `https://apitransporte.buenosaires.gob.ar/subtes/serviceAlerts?json=1&client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            // Crear un objeto SubwayAlert con los datos obtenidos
            const subwayAlert = new SubwayAlert(data);
            // Obtener las propiedades requeridas del objeto SubwayAlert
            const timestamp = subwayAlert.header.timestamp;
            const entitiesInfo = subwayAlert.entity.map(e => ({
                idLinea: e.id,
                linea: e.alert.informed_entity.map(entity => entity.route_id),
                alerta: e.alert.description_text.translation.map(translation => translation.text)
            }));

            return { timestamp, entitiesInfo }; // Devolver solo las propiedades requeridas
        } catch (error) {
            console.error('Error fetching data:', error);
            throw new Error('Internal server error');
        }
    };
    async getSubwayInformation(req, res) {
        const url = `https://apitransporte.buenosaires.gob.ar/subtes/forecastGTFS?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            // Crear un objeto para almacenar el primer elemento de cada línea
            const primerosElementos = {};
            // Crear un objeto para almacenar el segundo elemento de cada línea
            const segundosElementos = {};
            // Recorrer la colección Entity
            data.Entity.forEach(item => {
                // Obtener el primer elemento de cada línea y agregarlo al objeto si no existe
                const id = item.ID.split('_')[0]; // Obtener el identificador de la línea
                if (!primerosElementos[id]) {
                    primerosElementos[id] = {
                        ID: item.ID,
                        Linea: item.Linea
                    };
                }
            });
            // Recorrer la colección Entity
            data.Entity.forEach(item => {
                // Obtener el segundo elemento de cada línea y agregarlo al objeto si existe el primero
                const id = item.ID.split('_')[0]; // Obtener el identificador de la línea
                if (primerosElementos[id]) {
                    segundosElementos[id] = {
                        ID: item.ID,
                        Linea: item.Linea
                    };
                }
            });
            // // Convertir el objeto en un array
            const primerosElementosArray = Object.values(primerosElementos);
            primerosElementosArray.forEach(primerElemento => {
                // Obtener el primer valor de "arrival" y "departure" del primer objeto de cada línea
                const firstArrivalTime = primerElemento.Linea.Estaciones[0].arrival.time;
                const firstDepartureTime = primerElemento.Linea.Estaciones[0].departure.time;

                // Almacenar estos valores en variables
                let arrivalTime = firstArrivalTime;
                let departureTime = firstDepartureTime;

                // Iterar sobre los objetos de la línea y actualizar los valores de "arrival" y "departure"
                primerElemento.Linea.Estaciones.forEach(estacion => {
                    // Convertir los tiempos de llegada y salida a instancias de DateTime de Luxon
                    const arrivalDateTime = DateTime.fromSeconds(arrivalTime, { zone: 'America/Argentina/Buenos_Aires' });
                    const departureDateTime = DateTime.fromSeconds(departureTime, { zone: 'America/Argentina/Buenos_Aires' });

                    // Sumar 1 minuto y 36 segundos a los valores de "arrival" y "departure"
                    arrivalTime = arrivalDateTime.plus({ minutes: 1, seconds: 36 }).toSeconds();
                    departureTime = departureDateTime.plus({ minutes: 1, seconds: 36 }).toSeconds();

                    // Actualizar los valores de "arrival" y "departure" en cada iteración
                    estacion.arrival.time = this.convertirTiempo(arrivalTime);
                    estacion.departure.time =  this.convertirTiempo(departureTime);
                    estacion.arrival.delay =  this.convertirRetraso(estacion.arrival.delay);
                    estacion.departure.delay = this.convertirRetraso(estacion.departure.delay);
                });
            });
            const segundosElementosArray = Object.values(segundosElementos);
            segundosElementosArray.forEach(primerElemento => {
                // Obtener el primer valor de "arrival" y "departure" del primer objeto de cada línea
                const firstArrivalTime = primerElemento.Linea.Estaciones[0].arrival.time;
                const firstDepartureTime = primerElemento.Linea.Estaciones[0].departure.time;

                // Almacenar estos valores en variables
                let arrivalTime = firstArrivalTime;
                let departureTime = firstDepartureTime;

                // Iterar sobre los objetos de la línea y actualizar los valores de "arrival" y "departure"
                primerElemento.Linea.Estaciones.forEach(estacion => {
                    // Convertir los tiempos de llegada y salida a instancias de DateTime de Luxon
                    const arrivalDateTime = DateTime.fromSeconds(arrivalTime, { zone: 'America/Argentina/Buenos_Aires' });
                    const departureDateTime = DateTime.fromSeconds(departureTime, { zone: 'America/Argentina/Buenos_Aires' });

                    // Sumar 1 minuto y 36 segundos a los valores de "arrival" y "departure"
                    arrivalTime = arrivalDateTime.plus({ minutes: 1, seconds: 36 }).toSeconds();
                    departureTime = departureDateTime.plus({ minutes: 1, seconds: 36 }).toSeconds();

                    // Actualizar los valores de "arrival" y "departure" en cada iteración
                    estacion.arrival.time = this.convertirTiempo(arrivalTime);
                    estacion.departure.time =  this.convertirTiempo(departureTime);
                    estacion.arrival.delay =  this.convertirRetraso(estacion.arrival.delay);
                    estacion.departure.delay = this.convertirRetraso(estacion.departure.delay);
                });
            });
            const EstacionesSubte = {
                ida: primerosElementosArray.map(data => new InfomationSubway(data)),
                vuelta: segundosElementosArray.map(data => new InfomationSubway(data))
            };
            return EstacionesSubte;
  
        } catch (error) {
            console.error('Error fetching data:', error);
            throw new Error('Internal server error');
        }
    }
    async postSubwayPrice(req, res) {
        try {

            const browser = await puppeteer.launch({
                headless: 'shell',
                executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath(),
            });
            const page = await browser.newPage();
            const url = 'https://buenosaires.gob.ar/subte/tarifas-pases-y-abonos/tarifas';

            // Intentamos cargar la página hasta 5 veces con tiempos de espera incrementales
            let precios;
            for (let i = 0; i < 60; i++) {
                try {
                    await page.goto(url);
                    await page.waitForSelector('.content', { timeout: 60000 + i * 30000 }); // Incrementamos el tiempo de espera en cada intento
                    precios = await page.evaluate(() => {
                        const elementoContent = document.querySelector('.content');
                        if (elementoContent) {
                            const contenidoHTML = elementoContent.innerHTML;
                            // Buscar el texto específico 
                            const regex = /Tarifa según cantidad de viajes:([\s\S]*?)Premetro/g;
                            const match = regex.exec(contenidoHTML);
                            let tituloTarifa = [];
                            let preciosPorViaje = []
                            if (match) {
                                const datos = match[0].trim().split(':</em></p>');
                                datos.forEach((tarifa, index) => {
                                    if (index === 0) {
                                        tituloTarifa.push({ titulo: tarifa })
                                    } else {
                                        // Dividir por <br> para obtener líneas individuales
                                        const lineas = tarifa.split('<br>');
                                        lineas.forEach(linea => {
                                            // Eliminar etiquetas HTML
                                            const lineaSinTags = linea.replace(/<[^>]*>/g, '');
                                            // Eliminar "Premetro"
                                            const lineaLimpia = lineaSinTags.trim().replace(/\s*Premetro\s*/, '');
                                            // Dividir en rango y precio
                                            const partes = lineaLimpia.split(': $');
                                            if (partes.length === 2) {
                                                preciosPorViaje.push({
                                                    rango: partes[0],
                                                    precio: partes[1]
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                            return { tituloTarifa, preciosPorViaje };
                        } else {
                            return null;
                        }
                    });
                    break; // Si tuvimos éxito, salimos del bucle
                } catch (error) {
                    console.error(`Error al intentar cargar la página (intento ${i + 1}): ${error.message}`);
                    if (i < 60) {
                        console.log('Reintentando...');
                        await new Promise(resolve => setTimeout(resolve, 3000)); // Esperamos 3 segundos antes de reintentar
                    } else {
                        await browser.close(); // Cerramos el navegador si fallan todos los intentos
                        throw error; // Lanzamos el error si fallan todos los intentos
                    }
                }
            }
            // Cerramos el navegador
            await browser.close();
            const formattedDate = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es });
            const preciosSubte = { ...precios, fecha: formattedDate }; // Agregar la propiedad fecha al objeto preciosSubte
            const collectioMongo = await subwayModel.getPrice()
            if (collectioMongo.length === 0) {
                await subwayModel.postPrice(preciosSubte);
                const collectioMongoInsert = await subwayModel.getPrice()
                return collectioMongoInsert
            } else {
                let preciosIguales = true;
                // Verificar si los precios son iguales
                for (let i = 0; i < preciosSubte.preciosPorViaje.length; i++) {
                    if (preciosSubte.preciosPorViaje[i].precio !== collectioMongo[0].preciosPorViaje[i].precio || preciosSubte.preciosPorViaje[i].rango !== collectioMongo[0].preciosPorViaje[i].rango) {
                        preciosIguales = false;
                        break;
                    }
                }
                if (preciosIguales) {
                    console.log('Iguales_post')
                    return collectioMongo;
                } else {
                    console.log('Distintos_post')
                    // Construir el objeto de actualización con los nuevos precios y fecha
                    await subwayModel.postPrice(preciosSubte);
                    return preciosSubte;
                }
            }
        } catch (error) {
            console.error('Error al obtener los precios:', error);
        }
    }
    async getSubwayPrice(req, res) {
        try {
            const data = await subwayModel.getPrice();
            return data;
        } catch (error) {
            console.error('Error al obtener los precios de la base de datos:', error);
        }
    }
    async putSubwayPrice(req, res) {
        try {

            const browser = await puppeteer.launch({
                headless: 'shell',
                executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath(),
            });
            const page = await browser.newPage();
            const url = 'https://buenosaires.gob.ar/subte/tarifas-pases-y-abonos/tarifas';

            // Intentamos cargar la página hasta 5 veces con tiempos de espera incrementales
            let precios;
            for (let i = 0; i < 60; i++) {
                try {
                    await page.goto(url);
                    await page.waitForSelector('.content', { timeout: 60000 + i * 30000 }); // Incrementamos el tiempo de espera en cada intento
                    precios = await page.evaluate(() => {
                        const elementoContent = document.querySelector('.content');
                        if (elementoContent) {
                            const contenidoHTML = elementoContent.innerHTML;
                            // Buscar el texto específico 
                            const regex = /Tarifa según cantidad de viajes:([\s\S]*?)Premetro/g;
                            const match = regex.exec(contenidoHTML);
                            let tituloTarifa = [];
                            let preciosPorViaje = []
                            if (match) {
                                const datos = match[0].trim().split(':</em></p>');
                                datos.forEach((tarifa, index) => {
                                    if (index === 0) {
                                        tituloTarifa.push({ titulo: tarifa })
                                    } else {
                                        // Dividir por <br> para obtener líneas individuales
                                        const lineas = tarifa.split('<br>');
                                        lineas.forEach(linea => {
                                            // Eliminar etiquetas HTML
                                            const lineaSinTags = linea.replace(/<[^>]*>/g, '');
                                            // Eliminar "Premetro"
                                            const lineaLimpia = lineaSinTags.trim().replace(/\s*Premetro\s*/, '');
                                            // Dividir en rango y precio
                                            const partes = lineaLimpia.split(': $');
                                            if (partes.length === 2) {
                                                preciosPorViaje.push({
                                                    rango: partes[0],
                                                    precio: partes[1]
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                            return { tituloTarifa, preciosPorViaje };
                        } else {
                            return null;
                        }
                    });
                    break; // Si tuvimos éxito, salimos del bucle
                } catch (error) {
                    console.error(`Error al intentar cargar la página (intento ${i + 1}): ${error.message}`);
                    if (i < 60) {
                        console.log('Reintentando...');
                        await new Promise(resolve => setTimeout(resolve, 3000)); // Esperamos 3 segundos antes de reintentar
                    } else {
                        await browser.close(); // Cerramos el navegador si fallan todos los intentos
                        throw error; // Lanzamos el error si fallan todos los intentos
                    }
                }
            }
            // Cerramos el navegador
            await browser.close();
            const collectioMongo = await subwayModel.getPrice()
            const formattedDate = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es });
            const preciosSubte = { ...precios, fecha: formattedDate }; // Agregar la propiedad fecha al objeto preciosSubte
            // await subwayModel.postPrice(preciosSubte);
            let preciosIguales = true;
            // Verificar si los precios son iguales
            for (let i = 0; i < preciosSubte.preciosPorViaje.length; i++) {
                if (preciosSubte.preciosPorViaje[i].precio !== collectioMongo[0].preciosPorViaje[i].precio || preciosSubte.preciosPorViaje[i].rango !== collectioMongo[0].preciosPorViaje[i].rango) {
                    preciosIguales = false;
                    break;
                }
            }
            // Verificar si la fecha es igual
            // if (preciosIguales && preciosSubte.fecha !== collectioMongo[0].fecha) {
            //     preciosIguales = false;
            // }
            if (preciosIguales) {
                console.log('Iguales_Put')
                return collectioMongo;
            } else {
                console.log('Distintos_Put_Actualizado')
                // Construir el objeto de actualización con los nuevos precios y fecha
                const updateObj = {
                    $set: {
                        preciosPorViaje: preciosSubte.preciosPorViaje,
                        fecha: preciosSubte.fecha
                    }
                };
                await subwayModel.updatePrice(collectioMongo[0]._id, updateObj);
                // Devolver la colección actualizada
                return await subwayModel.getPrice();
            }
        } catch (error) {
            console.error('Error al obtener los precios:', error);
        }
    }
    async subwayPriceDelete(_id) {
        try {
            const priceDelete = await subwayModel.delteOne(_id)
            return priceDelete;
        } catch (error) {
            console.error('subwayPriceDelete data:', error);
            logger.error('subwayPriceDelete data:', error)
            throw new Error('Internal server error');
        }
    };
    async subwayPriceDeleteAutomatic() {
        try {
            const collectioMongo = await subwayModel.getPrice();
            if (collectioMongo.length === 0) {
                return { msg: "No existen datos a eliminar" };
            } else {
                const latestId = collectioMongo[collectioMongo.length - 1]._id;
                const result = await subwayModel.deleteOne(latestId);
                return result;
            }
        } catch (error) {
            console.error('subwayPriceDelete data:', error);
            logger.error('subwayPriceDelete data:', error);
            throw new Error('Internal server error');
        }
    };
}
export const subwayServices = new SubwayServices()

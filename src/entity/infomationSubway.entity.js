export class InfomationSubway {
    constructor(data) {
        this.id = data.ID;
        this.line = {
            tripId: data.Linea.Trip_Id,
            routeId: data.Linea.Route_Id,
            directionId: data.Linea.Direction_ID,
            startTime: data.Linea.start_time,
            startDate: data.Linea.start_date
        };
        this.stations = data.Linea.Estaciones.map(station => ({
            stopId: station.stop_id,
            stopName: station.stop_name,
            arrival: {
                time: station.arrival.time,
                delay: station.arrival.delay
            },
            departure: {
                time: station.departure.time,
                delay: station.departure.delay
            }
        }));
    }
}
export class SubwayAlert {
    constructor(data) {
        this.header = {
            gtfs_realtime_version: data.header.gtfs_realtime_version,
            incrementality: data.header.incrementality,
            timestamp: data.header.timestamp
        };

        this.entity = data.entity.map(entity => ({
            id: entity.id,
            is_deleted: entity.is_deleted,
            trip_update: entity.trip_update,
            vehicle: entity.vehicle,
            alert: {
                active_period: entity.alert.active_period,
                informed_entity: entity.alert.informed_entity.map(informedEntity => ({
                    agency_id: informedEntity.agency_id,
                    route_id: informedEntity.route_id,
                    route_type: informedEntity.route_type,
                    trip: informedEntity.trip,
                    stop_id: informedEntity.stop_id
                })),
                cause: entity.alert.cause,
                effect: entity.alert.effect,
                url: entity.alert.url,
                header_text: {
                    translation: entity.alert.header_text.translation.map(translation => ({
                        text: translation.text,
                        language: translation.language
                    }))
                },
                description_text: {
                    translation: entity.alert.description_text.translation.map(translation => ({
                        text: translation.text,
                        language: translation.language
                    }))
                }
            }
        }));
    }
}
export class PreciosSubte {
    constructor(data) {
        this.tituloTarifa = data.tituloTarifa.map(tarifa => ({
            titulo: tarifa.titulo
        }));

        this.preciosPorViaje = data.preciosPorViaje.map(precio => ({
            rango: precio.rango,
            precio: precio.precio
        }));
    }
}


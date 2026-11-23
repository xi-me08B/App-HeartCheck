/**
 * Módulo de consumo de API pública (Open-Meteo)
 * Patrón de integración B: Mis datos + datos externos
 * Complementa los registros cardíacos del usuario en Tarija con variables climáticas
 * que impactan en la presión arterial (temperatura, humedad y presión atmosférica).
 */

export interface WeatherData {
  temperatura: number;
  humedad: number;
  presionAtmosferica: number;
  sensacionTermica: number;
  codigoClima: number;
  descripcionClima: string;
  ciudad: string;
  horaConsulta: string;
}

// Coordenadas de Tarija, Bolivia: Latitud -21.5355, Longitud -64.7296
const TARIJA_LAT = -21.5355;
const TARIJA_LON = -64.7296;
const API_URL = `https://api.open-meteo.com/v1/forecast?latitude=${TARIJA_LAT}&longitude=${TARIJA_LON}&current=temperature_2m,relative_humidity_2m,weather_code,apparent_temperature,pressure_msl&timezone=America%2FLa_Paz`;

function interpretarCodigoClima(code: number): string {
  if (code === 0) return 'Despejado / Soleado';
  if (code === 1 || code === 2) return 'Parcialmente nublado';
  if (code === 3) return 'Nublado';
  if (code >= 45 && code <= 48) return 'Niebla / Neblina';
  if (code >= 51 && code <= 55) return 'Llovizna leve';
  if (code >= 61 && code <= 65) return 'Lluvia moderada';
  if (code >= 80 && code <= 82) return 'Chubascos';
  if (code >= 95) return 'Tormenta eléctrica';
  return 'Condición templada';
}

/**
 * Obtener datos meteorológicos actuales de Tarija desde Open-Meteo
 * Implementa fetch, async/await, revisión de respuesta.ok y try/catch
 */
export async function obtenerClimaTarija(): Promise<WeatherData> {
  const respuesta = await fetch(API_URL);

  if (!respuesta.ok) {
    throw new Error(`Error en el servidor de clima (HTTP ${respuesta.status})`);
  }

  const datos = await respuesta.json();

  if (!datos || !datos.current) {
    throw new Error('Respuesta inválida de la API meteorológica');
  }

  const current = datos.current;

  return {
    temperatura: current.temperature_2m,
    humedad: current.relative_humidity_2m,
    presionAtmosferica: current.pressure_msl,
    sensacionTermica: current.apparent_temperature,
    codigoClima: current.weather_code,
    descripcionClima: interpretarCodigoClima(current.weather_code),
    ciudad: 'Tarija, Bolivia',
    horaConsulta: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

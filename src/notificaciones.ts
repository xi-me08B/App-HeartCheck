import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configurar cómo se presentan las notificaciones cuando la app está en primer plano
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (e) {
  console.warn('Notifications handler init:', e);
}

/**
 * Solicita permisos de notificación al usuario
 */
export async function solicitarPermisoNotificaciones(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  } catch (e) {
    console.warn('Error solicitando permisos:', e);
    return false;
  }
}

/**
 * Dispara una notificación inmediata de confirmación
 */
export async function notificarInmediata(titulo: string, cuerpo: string): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  try {
    const granted = await solicitarPermisoNotificaciones();
    if (!granted) return null;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: titulo,
        body: cuerpo,
        sound: true,
        data: { tipo: 'inmediata' },
      },
      trigger: null, // trigger null envía la notificación inmediatamente
    });
    return id;
  } catch (e) {
    console.warn('Error notificando:', e);
    return null;
  }
}

/**
 * Programa un recordatorio para el día y hora de la cita
 */
export async function programarRecordatorioCita(
  doctor: string,
  servicio: string,
  fecha: string,
  hora: string
): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  try {
    const granted = await solicitarPermisoNotificaciones();
    if (!granted) return null;

    // Se programa un aviso en 5 segundos para que sea demostrable en clase / Expo Go
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `🩺 Recordatorio de Cita Médica`,
        body: `Tienes tu cita de ${servicio} con ${doctor} programada para el ${fecha} a las ${hora}.`,
        sound: true,
        data: { tipo: 'cita', doctor, servicio, fecha, hora },
      },
      trigger: {
        seconds: 5,
      } as any,
    });
    return id;
  } catch (e) {
    console.warn('Error programando cita:', e);
    return null;
  }
}

/**
 * Programa recordatorio de alimentación saludable (dieta baja en sodio)
 */
export async function programarRecordatorioComida(): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  try {
    const granted = await solicitarPermisoNotificaciones();
    if (!granted) return null;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `🥗 Hora de comer saludable (HeartCheck)`,
        body: `Recuerda ingerir alimentos bajos en sodio, abundantes vegetales y beber suficiente agua para cuidar tu presión.`,
        sound: true,
        data: { tipo: 'alimentacion' },
      },
      trigger: {
        seconds: 6,
      } as any,
    });
    return id;
  } catch (e) {
    console.warn('Error programando comida:', e);
    return null;
  }
}

/**
 * Programa recordatorio de entrenamiento o caminata diaria
 */
export async function programarRecordatorioEntrenamiento(): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  try {
    const granted = await solicitarPermisoNotificaciones();
    if (!granted) return null;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `🏃‍♂️ Momento de Actividad Física`,
        body: `Completa tu caminata diaria de 30 minutos a paso moderado para mantener tu corazón fuerte y sano.`,
        sound: true,
        data: { tipo: 'entrenamiento' },
      },
      trigger: {
        seconds: 7,
      } as any,
    });
    return id;
  } catch (e) {
    console.warn('Error programando entrenamiento:', e);
    return null;
  }
}

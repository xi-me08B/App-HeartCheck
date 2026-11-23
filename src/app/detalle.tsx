import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';

export default function DetalleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    sistolica: string;
    diastolica: string;
    pulso: string;
    fecha: string;
    hora: string;
    estado: string;
    temperatura_clima: string;
    humedad_clima: string;
    descripcionClima: string;
  }>();

  const sistolica = Number(params.sistolica) || 120;
  const diastolica = Number(params.diastolica) || 80;
  const pulso = Number(params.pulso) || 72;
  const fecha = params.fecha || 'Hoy';
  const hora = params.hora || '08:30';
  const estado = params.estado || 'Normal';
  const temperatura = params.temperatura_clima ? `${params.temperatura_clima}°C` : '18.5°C';
  const humedad = params.humedad_clima ? `${params.humedad_clima}%` : '90%';
  const climaDesc = params.descripcionClima || 'Clima Tarija registrado';

  const compartirMedicion = async () => {
    try {
      await Share.share({
        message: `Reporte HeartCheck Tarija:\nLectura de Presión Arterial: ${sistolica}/${diastolica} mmHg\nPulso: ${pulso} BPM\nEstado: ${estado}\nFecha y Hora: ${fecha} - ${hora}\nClima Tarija: ${temperatura} (${humedad} humedad)\nRegistrado en la app HeartCheck.`,
      });
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Top Navbar */}
        <View style={styles.navbar}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#2A2421" />
            <Text style={styles.backText}>Volver</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>Ficha de Medición #{params.id}</Text>
          <TouchableOpacity onPress={compartirMedicion}>
            <Ionicons name="share-social-outline" size={22} color={Theme.colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Card Principal */}
          <View style={styles.heroCard}>
            <Text style={styles.cardHeader}>VALORES CARDIOVASCULARES</Text>
            <View style={styles.mainValuesRow}>
              <View>
                <Text style={styles.bigNumbers}>
                  {sistolica}/{diastolica}
                </Text>
                <Text style={styles.unitLabel}>Presión Arterial (mmHg)</Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  estado === 'Hipertensión'
                    ? { backgroundColor: '#FEE2E2' }
                    : estado === 'Hipotensión'
                    ? { backgroundColor: '#DBEAFE' }
                    : { backgroundColor: '#DCFCE7' },
                ]}>
                <Text
                  style={[
                    styles.statusBadgeText,
                    estado === 'Hipertensión'
                      ? { color: '#DC2626' }
                      : estado === 'Hipotensión'
                      ? { color: '#2563EB' }
                      : { color: '#16A34A' },
                  ]}>
                  {estado}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.secondaryGrid}>
              <View style={styles.secondaryItem}>
                <Ionicons name="heart" size={20} color={Theme.colors.primary} />
                <Text style={styles.secValue}>{pulso} BPM</Text>
                <Text style={styles.secLabel}>Frecuencia Cardíaca</Text>
              </View>
              <View style={styles.secondaryItem}>
                <Ionicons name="time-outline" size={20} color="#7C736C" />
                <Text style={styles.secValue}>{hora}</Text>
                <Text style={styles.secLabel}>Hora de registro</Text>
              </View>
              <View style={styles.secondaryItem}>
                <Ionicons name="calendar-outline" size={20} color="#7C736C" />
                <Text style={styles.secValue}>{fecha}</Text>
                <Text style={styles.secLabel}>Fecha</Text>
              </View>
            </View>
          </View>

          {/* Complemento de la API Externa (Patrón B: Mis datos + datos externos) */}
          <View style={styles.weatherBox}>
            <View style={styles.weatherBoxHeader}>
              <Ionicons name="cloudy-outline" size={20} color="#0284C7" />
              <Text style={styles.weatherBoxTitle}>Contexto Ambiental (API Open-Meteo)</Text>
            </View>
            <Text style={styles.weatherBoxDesc}>
              El clima en Tarija al momento del registro fue de {temperatura} con {humedad} de humedad relativa ({climaDesc}). Las bajas temperaturas pueden contraer los vasos sanguíneos y elevar la presión.
            </Text>
          </View>

          {/* Recomendaciones médicas automáticas */}
          <View style={styles.recommendationCard}>
            <Text style={styles.recTitle}>Evaluación Automática y Consejos</Text>
            {estado === 'Hipertensión' ? (
              <Text style={styles.recText}>
                ⚠️ Tu lectura excede los valores de referencia (120/80 mmHg). Reposa 10 minutos, evita café o tabaco, y repite la toma. Si experimentas dolor en el pecho o mareo persistente, acude al centro médico.
              </Text>
            ) : estado === 'Hipotensión' ? (
              <Text style={styles.recText}>
                ℹ️ Tu presión se encuentra por debajo de 90/60 mmHg. Procura mantenerte hidratado, ingiere líquidos con electrolitos y levántate lentamente de la cama o asiento.
              </Text>
            ) : (
              <Text style={styles.recText}>
                ✅ Tu presión y pulso se encuentran dentro del rango cardiovascular óptimo. Sigue manteniendo tu dieta baja en sodio y tus caminatas diarias.
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F6F4',
  },
  container: {
    flex: 1,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECE2D8',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2A2421',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2A2421',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ECE2D8',
  },
  cardHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C736C',
    letterSpacing: 0.8,
  },
  mainValuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  bigNumbers: {
    fontSize: 38,
    fontWeight: '900',
    color: '#2A2421',
  },
  unitLabel: {
    fontSize: 12,
    color: '#7C736C',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#ECE2D8',
    marginVertical: 16,
  },
  secondaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  secValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2A2421',
    marginTop: 4,
  },
  secLabel: {
    fontSize: 11,
    color: '#7C736C',
    marginTop: 2,
    textAlign: 'center',
  },
  weatherBox: {
    backgroundColor: '#F0F9FF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  weatherBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  weatherBoxTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0369A1',
  },
  weatherBoxDesc: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  recommendationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECE2D8',
  },
  recTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2A2421',
    marginBottom: 8,
  },
  recText: {
    fontSize: 13,
    color: '#4A3E39',
    lineHeight: 19,
  },
});

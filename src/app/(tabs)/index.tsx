import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { Theme } from '@/constants/theme';
import { useHeartCheck } from '@/context/HeartCheckContext';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const {
    user,
    currentBpm,
    medirPulso,
    isMeasuringBpm,
    bpRecords,
    appointments,
    lifestyle,
    medications,
  } = useHeartCheck();

  const ultimaLectura = bpRecords[0] || { sistolica: 120, diastolica: 80, pulso: 72 };
  const proximaCita = appointments[0];

  const getGreeting = () => {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) return '¡Buenos días';
    if (hora >= 12 && hora < 19) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.greetingText}>
              {getGreeting()}, {user?.nombre?.split(' ')[0] || 'Elena'} 👋
            </Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={14} color={Theme.colors.primary} />
              <Text style={styles.locationText}>{user?.ciudad || 'Tarija, Bolivia'}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.notificationBtn}
            onPress={() =>
              Alert.alert(
                'Recordatorios activos',
                `Tienes 1 recordatorio de medicación pendiente para hoy: ${
                  medications.find((m) => m.estadoHoy === 'pendiente')?.nombre || 'Todos al día'
                }.`
              )
            }>
            <Ionicons name="notifications-outline" size={22} color="#2A2421" />
            <View style={styles.notifBadge} />
          </TouchableOpacity>
        </View>

        {/* Heart Rate / BPM Hero Card */}
        <View style={styles.bpmCard}>
          <View style={styles.bpmHeader}>
            <View style={styles.bpmTitleRow}>
              <Ionicons name="heart" size={20} color="#FFFFFF" />
              <Text style={styles.bpmCardTitle}>FRECUENCIA CARDÍACA</Text>
            </View>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>Ritmo Sinusal</Text>
            </View>
          </View>

          <View style={styles.bpmValueRow}>
            {isMeasuringBpm ? (
              <View style={styles.measuringBox}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.measuringText}>Midiendo pulso cardíaco...</Text>
              </View>
            ) : (
              <>
                <Text style={styles.bpmNumber}>{currentBpm}</Text>
                <View style={styles.bpmUnitBox}>
                  <Text style={styles.bpmUnit}>LPM</Text>
                  <Text style={styles.bpmSub}>Latidos por minuto</Text>
                </View>
              </>
            )}
          </View>

          <TouchableOpacity
            style={styles.measureBtn}
            onPress={medirPulso}
            disabled={isMeasuringBpm}
            activeOpacity={0.85}>
            <MaterialCommunityIcons name="heart-pulse" size={18} color={Theme.colors.primary} />
            <Text style={styles.measureBtnText}>
              {isMeasuringBpm ? 'Sincronizando...' : 'MEDIR AHORA'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Next Appointment Card */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Próxima Cita de Control</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/servicios')}>
            <Text style={styles.seeAllText}>Agendar nueva</Text>
          </TouchableOpacity>
        </View>

        {proximaCita ? (
          <View style={styles.appointmentCard}>
            <View style={styles.appCardHeader}>
              <View style={styles.appIconBox}>
                <Ionicons name="calendar" size={20} color={Theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.appService}>{proximaCita.servicio}</Text>
                <Text style={styles.appDoctor}>{proximaCita.doctor}</Text>
              </View>
              <View style={styles.appBadge}>
                <Text style={styles.appBadgeText}>{proximaCita.estado}</Text>
              </View>
            </View>

            <View style={styles.appDivider} />

            <View style={styles.appDetailsRow}>
              <View style={styles.appDetailItem}>
                <Ionicons name="time-outline" size={15} color="#7C736C" />
                <Text style={styles.appDetailText}>
                  {proximaCita.fecha} · {proximaCita.hora}
                </Text>
              </View>
              <View style={styles.appDetailItem}>
                <Ionicons name="business-outline" size={15} color="#7C736C" />
                <Text style={styles.appDetailText} numberOfLines={1}>
                  {proximaCita.lugar}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.emptyAppCard}
            onPress={() => router.push('/(tabs)/servicios')}>
            <Ionicons name="add-circle-outline" size={32} color={Theme.colors.primary} />
            <Text style={styles.emptyAppTitle}>No tienes turnos programados</Text>
            <Text style={styles.emptyAppSub}>Toca aquí para solicitar tu control cardiológico</Text>
          </TouchableOpacity>
        )}

        {/* Diario de Salud - Quick Access Grid */}
        <Text style={styles.sectionTitle}>Diario de Salud</Text>

        <View style={styles.gridContainer}>
          {/* Presión Arterial */}
          <TouchableOpacity
            style={styles.gridItem}
            activeOpacity={0.85}
            onPress={() => router.push('/(tabs)/salud')}>
            <View style={[styles.gridIconCircle, { backgroundColor: '#FFEBE7' }]}>
              <MaterialCommunityIcons name="speedometer" size={24} color="#F77062" />
            </View>
            <Text style={styles.gridItemTitle}>Presión Arterial</Text>
            <Text style={styles.gridItemValue}>
              {ultimaLectura.sistolica}/{ultimaLectura.diastolica}
            </Text>
            <Text style={styles.gridItemSub}>mmHg · {ultimaLectura.estado}</Text>
          </TouchableOpacity>

          {/* Glucosa / Signos */}
          <TouchableOpacity
            style={styles.gridItem}
            activeOpacity={0.85}
            onPress={() =>
              Alert.alert(
                'Nivel de Glucosa',
                'Último registro en ayunas: 94 mg/dL (Rango Normal: 70 - 100 mg/dL).'
              )
            }>
            <View style={[styles.gridIconCircle, { backgroundColor: '#E0F2FE' }]}>
              <MaterialCommunityIcons name="water-percent" size={24} color="#0284C7" />
            </View>
            <Text style={styles.gridItemTitle}>Glucosa en Sangre</Text>
            <Text style={styles.gridItemValue}>94 mg/dL</Text>
            <Text style={styles.gridItemSub}>Ayunas · Normal</Text>
          </TouchableOpacity>

          {/* Estilo de Vida */}
          <TouchableOpacity
            style={styles.gridItem}
            activeOpacity={0.85}
            onPress={() => router.push('/(tabs)/salud')}>
            <View style={[styles.gridIconCircle, { backgroundColor: '#DCFCE7' }]}>
              <FontAwesome5 name="walking" size={22} color="#16A34A" />
            </View>
            <Text style={styles.gridItemTitle}>Estilo de Vida</Text>
            <Text style={styles.gridItemValue}>
              {lifestyle.diasCompletados}/{lifestyle.totalDias} días
            </Text>
            <Text style={styles.gridItemSub}>{lifestyle.actividadMinutos} min caminata hoy</Text>
          </TouchableOpacity>

          {/* Mi Tratamiento */}
          <TouchableOpacity
            style={styles.gridItem}
            activeOpacity={0.85}
            onPress={() => router.push('/(tabs)/salud')}>
            <View style={[styles.gridIconCircle, { backgroundColor: '#FEF3C7' }]}>
              <MaterialCommunityIcons name="pill" size={24} color="#D97706" />
            </View>
            <Text style={styles.gridItemTitle}>Mi Tratamiento</Text>
            <Text style={styles.gridItemValue}>
              {medications.filter((m) => m.estadoHoy === 'tomada').length}/{medications.length}
            </Text>
            <Text style={styles.gridItemSub}>Tomas declaradas hoy</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Nav Footer Cards */}
        <Text style={styles.sectionTitle}>Asistencia y Orientación</Text>

        <TouchableOpacity
          style={styles.actionBanner}
          activeOpacity={0.85}
          onPress={() => router.push('/(tabs)/estudios')}>
          <View style={[styles.bannerIconBox, { backgroundColor: '#E0F2FE' }]}>
            <MaterialCommunityIcons name="file-upload-outline" size={24} color="#0284C7" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Adjuntar Estudio Clínico</Text>
            <Text style={styles.bannerSub}>Fotografía o sube tu ECG o ecocardiograma</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#A89F97" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBanner}
          activeOpacity={0.85}
          onPress={() => router.push('/(tabs)/perfil')}>
          <View style={[styles.bannerIconBox, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="call" size={22} color="#DC2626" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Emergencias y Asistencia</Text>
            <Text style={styles.bannerSub}>Contacto rápido con centros médicos en Tarija</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#A89F97" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 14,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#26201E',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  locationText: {
    fontSize: 13,
    color: '#766D66',
    fontWeight: '500',
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8DFD7',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...Theme.shadows.soft,
  },
  notifBadge: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.primary,
  },
  bpmCard: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 24,
    padding: 22,
    marginVertical: 10,
    ...Theme.shadows.button,
  },
  bpmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bpmTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bpmCardTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  statusPill: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  bpmValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 16,
  },
  bpmNumber: {
    fontSize: 54,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 60,
  },
  bpmUnitBox: {
    marginLeft: 10,
  },
  bpmUnit: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bpmSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
  },
  measuringBox: {
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  measuringText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  measureBtn: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 9999,
  },
  measureBtnText: {
    color: Theme.colors.primary,
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#26201E',
    marginTop: 18,
    marginBottom: 10,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.primary,
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFE7E0',
    ...Theme.shadows.soft,
  },
  appCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFE9E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appService: {
    fontSize: 15,
    fontWeight: '700',
    color: '#24201E',
  },
  appDoctor: {
    fontSize: 13,
    color: '#766D66',
    marginTop: 2,
  },
  appBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  appBadgeText: {
    color: '#2E7D32',
    fontSize: 11.5,
    fontWeight: '700',
  },
  appDivider: {
    height: 1,
    backgroundColor: '#F0E8E1',
    marginVertical: 12,
  },
  appDetailsRow: {
    gap: 6,
  },
  appDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appDetailText: {
    fontSize: 13,
    color: '#655D57',
  },
  emptyAppCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#E8DED6',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyAppTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#342E2A',
    marginTop: 6,
  },
  emptyAppSub: {
    fontSize: 13,
    color: '#7C736C',
    marginTop: 2,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: (width - 40 - 12) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFE7E0',
    ...Theme.shadows.soft,
  },
  gridIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  gridItemTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#282320',
  },
  gridItemValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Theme.colors.primary,
    marginTop: 4,
  },
  gridItemSub: {
    fontSize: 11.5,
    color: '#7E766F',
    marginTop: 2,
  },
  actionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFE7E0',
    marginBottom: 10,
    gap: 12,
    ...Theme.shadows.soft,
  },
  bannerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#282320',
  },
  bannerSub: {
    fontSize: 12,
    color: '#766D66',
    marginTop: 2,
  },
});

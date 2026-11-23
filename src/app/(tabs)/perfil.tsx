import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Linking,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';
import { useHeartCheck } from '@/context/HeartCheckContext';

export default function PerfilScreen() {
  const router = useRouter();
  const { user, updateUser, logout } = useHeartCheck();

  const [modalEducacionVisible, setModalEducacionVisible] = useState(false);
  const [fichaSeleccionada, setFichaSeleccionada] = useState<{
    titulo: string;
    contenido: string;
    responsable: string;
    fecha: string;
  } | null>(null);

  const fichasEducativas = [
    {
      titulo: 'Síntomas de Alarma y Cuándo Acudir',
      contenido:
        'Debes buscar atención médica inmediata ante:\n• Dolor opresivo en el pecho que se irradia al brazo izquierdo, cuello o mandíbula.\n• Dificultad para respirar repentina en reposo.\n• Mareo intenso, pérdida del conocimiento o visión borrosa.\n• Presión sistólica superior a 180 mmHg o diastólica mayor a 120 mmHg.',
      responsable: 'Dra. Paula Ríos (Cardióloga)',
      fecha: 'Revisado: Noviembre 2026',
    },
    {
      titulo: 'Factores de Riesgo Cardiovascular',
      contenido:
        'Los principales factores que aumentan el riesgo cardíaco son el tabaquismo, el colesterol LDL elevado, el sedentarismo, la diabetes no controlada y el estrés crónico. Modificar estos hábitos reduce hasta un 80% los eventos coronarios.',
      responsable: 'Equipo Cardiológico Tarija',
      fecha: 'Revisado: Octubre 2026',
    },
    {
      titulo: 'Guía de Medicación Antihipertensiva',
      contenido:
        'Toma tus medicamentos a la misma hora todos los días. No suspendas el tratamiento aunque tus lecturas de presión sean normales, ya que la medicación es la que mantiene los valores estables. En caso de olvido, no dupliques la dosis siguiente.',
      responsable: 'Dra. Claudia Benítez',
      fecha: 'Revisado: Noviembre 2026',
    },
    {
      titulo: 'Hábitos Saludables y Nutrición',
      contenido:
        'Reduce el consumo de sal a menos de 5 gramos al día. Incorpora frutas, verduras frescas y agua. Realiza al menos 30 minutos de caminata a paso ligero 5 días por semana.',
      responsable: 'Nutrición Clínica Tarija',
      fecha: 'Revisado: Noviembre 2026',
    },
  ];

  const abrirFicha = (f: any) => {
    setFichaSeleccionada(f);
    setModalEducacionVisible(true);
  };

  const handleCerrarSesion = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que deseas salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesión',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/');
        },
      },
    ]);
  };

  const llamarEmergencias = () => {
    Alert.alert(
      'Llamada de Emergencia',
      '¿Deseas llamar a la Central de Ambulancias y Emergencias Médicas de Tarija (160)?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Llamar 160',
          onPress: () => {
            Linking.openURL('tel:160').catch(() => {
              Alert.alert('Información', 'Marca 160 desde tu línea telefónica.');
            });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mi Perfil y Ajustes</Text>
          <Text style={styles.headerSubtitle}>Configuración de cuenta y asistencia médica</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* User Profile Card */}
          <View style={styles.userCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {user?.nombre
                  ? user.nombre
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                  : 'EV'}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{user?.nombre || 'Elena Vargas'}</Text>
              <Text style={styles.userRole}>Paciente en Seguimiento Cardiológico</Text>
              <Text style={styles.userLocation}>
                📍 {user?.ciudad || 'Tarija, Bolivia'} · {user?.edad || 58} años
              </Text>
            </View>
          </View>

          {/* Premium banner (from page 8 of PDF) */}
          <TouchableOpacity
            style={styles.premiumBanner}
            activeOpacity={0.9}
            onPress={() =>
              Alert.alert(
                'Versión Premium',
                '¡Tienes la versión completa activa! Incluye exportación en PDF para tu cardiólogo y monitoreo ilimitado.'
              )
            }>
            <View style={styles.crownIconBox}>
              <FontAwesome5 name="crown" size={24} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.premiumTitle}>Versión Premium Activa</Text>
              <Text style={styles.premiumSub}>Sin anuncios · Informes automáticos para tu doctor</Text>
            </View>
            <Ionicons name="shield-checkmark" size={22} color="#16A34A" />
          </TouchableOpacity>

          {/* Emergency Assistance Call */}
          <TouchableOpacity
            style={styles.emergencyCard}
            activeOpacity={0.85}
            onPress={llamarEmergencias}>
            <View style={styles.emergencyIconBox}>
              <Ionicons name="warning" size={24} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.emergencyTitle}>Botón de Asistencia Médica</Text>
              <Text style={styles.emergencySub}>
                Llamar a la Central de Urgencias Médicas en Tarija (160)
              </Text>
            </View>
            <Ionicons name="call" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Contact Details */}
          <Text style={styles.sectionTitle}>Datos Personales</Text>
          <View style={styles.menuGroup}>
            <View style={styles.menuItem}>
              <Ionicons name="mail-outline" size={20} color="#7C736C" />
              <View style={{ flex: 1 }}>
                <Text style={styles.menuItemLabel}>Correo Electrónico</Text>
                <Text style={styles.menuItemValue}>{user?.correo}</Text>
              </View>
            </View>

            <View style={styles.menuDivider} />

            <View style={styles.menuItem}>
              <Ionicons name="call-outline" size={20} color="#7C736C" />
              <View style={{ flex: 1 }}>
                <Text style={styles.menuItemLabel}>Teléfono de Contacto</Text>
                <Text style={styles.menuItemValue}>{user?.telefono}</Text>
              </View>
            </View>

            <View style={styles.menuDivider} />

            <View style={styles.menuItem}>
              <Ionicons name="people-outline" size={20} color="#7C736C" />
              <View style={{ flex: 1 }}>
                <Text style={styles.menuItemLabel}>Contacto de Emergencia</Text>
                <Text style={styles.menuItemValue}>{user?.contactoEmergencia}</Text>
              </View>
            </View>
          </View>

          {/* Preferences and Notifications */}
          <Text style={styles.sectionTitle}>Preferencias y Notificaciones</Text>
          <View style={styles.menuGroup}>
            <View style={styles.menuItem}>
              <Ionicons name="notifications-outline" size={20} color="#7C736C" />
              <View style={{ flex: 1 }}>
                <Text style={styles.menuItemLabel}>Recordatorios de Tomas y Citas</Text>
                <Text style={styles.menuItemValue}>
                  {user?.notificaciones ? 'Activados' : 'Desactivados'}
                </Text>
              </View>
              <Switch
                value={user?.notificaciones}
                onValueChange={(val) => updateUser({ notificaciones: val })}
                trackColor={{ false: '#D1C7BD', true: Theme.colors.primary }}
              />
            </View>

            <View style={styles.menuDivider} />

            <View style={styles.menuItem}>
              <Ionicons name="alarm-outline" size={20} color="#7C736C" />
              <View style={{ flex: 1 }}>
                <Text style={styles.menuItemLabel}>Alarma de Medicación</Text>
                <Text style={styles.menuItemValue}>08:00 AM (Losartán)</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#A89F97" />
            </View>

            <View style={styles.menuDivider} />

            <View style={styles.menuItem}>
              <Ionicons name="language-outline" size={20} color="#7C736C" />
              <View style={{ flex: 1 }}>
                <Text style={styles.menuItemLabel}>Idioma de la Aplicación</Text>
                <Text style={styles.menuItemValue}>Español (predeterminado)</Text>
              </View>
            </View>
          </View>

          {/* Educational Cards (Screen 14) */}
          <Text style={styles.sectionTitle}>Aprender sobre el Cuidado (Fichas Médicas)</Text>
          <View style={styles.menuGroup}>
            {fichasEducativas.map((ficha, index) => (
              <React.Fragment key={ficha.titulo}>
                <TouchableOpacity
                  style={styles.menuItem}
                  activeOpacity={0.7}
                  onPress={() => abrirFicha(ficha)}>
                  <MaterialCommunityIcons
                    name="book-open-page-variant-outline"
                    size={20}
                    color={Theme.colors.primary}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.menuItemLabel}>{ficha.titulo}</Text>
                    <Text style={styles.menuItemValue}>{ficha.responsable}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#A89F97" />
                </TouchableOpacity>
                {index < fichasEducativas.length - 1 && <View style={styles.menuDivider} />}
              </React.Fragment>
            ))}
          </View>

          {/* Academic Info */}
          <View style={styles.academicCard}>
            <Text style={styles.academicTitle}>Universidad Privada Domingo Savio (UPDS)</Text>
            <Text style={styles.academicSub}>
              Facultad de Ingeniería · Ingeniería de Sistemas{'\n'}
              Proyecto Final: Aplicaciones Móviles{'\n'}
              Docente: Ing. Juan Carlos Huanto Villca{'\n'}
              Estudiantes: María del Rosario Cadena, Ximena Calcina, Fernando Castillo, María del Carmen Rivera
            </Text>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutBtn}
            activeOpacity={0.85}
            onPress={handleCerrarSesion}>
            <Ionicons name="log-out-outline" size={20} color="#DC2626" />
            <Text style={styles.logoutBtnText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Modal Ficha Educativa */}
        <Modal
          visible={modalEducacionVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalEducacionVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalFichaTitle}>{fichaSeleccionada?.titulo}</Text>
                <TouchableOpacity onPress={() => setModalEducacionVisible(false)}>
                  <Ionicons name="close-circle" size={26} color="#7C736C" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 300, marginVertical: 12 }}>
                <Text style={styles.modalFichaBody}>{fichaSeleccionada?.contenido}</Text>
              </ScrollView>

              <View style={styles.modalFichaFooter}>
                <Text style={styles.modalFichaDoc}>
                  👨‍⚕️ {fichaSeleccionada?.responsable}
                </Text>
                <Text style={styles.modalFichaDate}>{fichaSeleccionada?.fecha}</Text>
              </View>

              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setModalEducacionVisible(false)}>
                <Text style={styles.modalCloseBtnText}>Entendido</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
  },
  header: {
    marginVertical: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#26201E',
  },
  headerSubtitle: {
    fontSize: 13.5,
    color: '#766D66',
    marginTop: 2,
  },
  scrollContent: {
    paddingBottom: 35,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFE7E0',
    gap: 14,
    marginBottom: 14,
    ...Theme.shadows.soft,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFE9E5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Theme.colors.primary,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: Theme.colors.primary,
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#24201E',
  },
  userRole: {
    fontSize: 12.5,
    color: Theme.colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  userLocation: {
    fontSize: 12,
    color: '#766D66',
    marginTop: 3,
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 12,
    marginBottom: 12,
  },
  crownIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400E',
  },
  premiumSub: {
    fontSize: 12,
    color: '#B45309',
    marginTop: 2,
  },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 16,
    ...Theme.shadows.button,
  },
  emergencyIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emergencySub: {
    fontSize: 12,
    color: '#FEE2E2',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#26201E',
    marginTop: 14,
    marginBottom: 8,
  },
  menuGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFE7E0',
    paddingHorizontal: 14,
    marginBottom: 10,
    ...Theme.shadows.soft,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    gap: 12,
  },
  menuItemLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#282320',
  },
  menuItemValue: {
    fontSize: 12.5,
    color: '#766D66',
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F3ECE4',
  },
  academicCard: {
    backgroundColor: '#F3ECE4',
    borderRadius: 14,
    padding: 14,
    marginVertical: 14,
    borderWidth: 1,
    borderColor: '#E6DDD4',
  },
  academicTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#342E2A',
    marginBottom: 4,
  },
  academicSub: {
    fontSize: 11.5,
    color: '#655D57',
    lineHeight: 17,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 6,
  },
  logoutBtnText: {
    color: '#DC2626',
    fontSize: 14.5,
    fontWeight: '700',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    width: '100%',
    maxWidth: 420,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalFichaTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#24201E',
    flex: 1,
    paddingRight: 10,
  },
  modalFichaBody: {
    fontSize: 13.5,
    color: '#4B433D',
    lineHeight: 22,
  },
  modalFichaFooter: {
    backgroundColor: '#FAF4EE',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  modalFichaDoc: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#26201E',
  },
  modalFichaDate: {
    fontSize: 11.5,
    color: '#766D66',
    marginTop: 2,
  },
  modalCloseBtn: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

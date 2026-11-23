import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';
import { useHeartCheck, MedicalService, Appointment } from '@/context/HeartCheckContext';

export default function ServiciosScreen() {
  const { services, appointments, addAppointment, cancelAppointment } = useHeartCheck();

  // Tab entre catálogo y mis reservas
  const [vistaActiva, setVistaActiva] = useState<'catalogo' | 'reservas'>('catalogo');

  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('Todos');

  // Modal de Reserva
  const [servicioSeleccionado, setServicioSeleccionado] = useState<MedicalService | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] = useState('Jueves 26 de Nov');
  const [horaSeleccionada, setHoraSeleccionada] = useState('09:00');
  const [modalidad, setModalidad] = useState('Presencial en consultorio');

  const categorias = ['Todos', 'Consultas', 'Cardiología', 'Estudios', 'Monitoreo'];
  const horariosDisponibles = ['08:30', '09:00', '10:15', '11:30', '16:00', '17:30'];

  const serviciosFiltrados = services.filter((s) => {
    const coincideTexto =
      s.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      s.doctor.toLowerCase().includes(busqueda.toLowerCase()) ||
      s.descripcion.toLowerCase().includes(busqueda.toLowerCase());

    const coincideCat =
      categoriaSeleccionada === 'Todos' || s.categoria === categoriaSeleccionada;

    return coincideTexto && coincideCat;
  });

  const abrirReserva = (servicio: MedicalService) => {
    setServicioSeleccionado(servicio);
    setModalVisible(true);
  };

  const confirmarReserva = async () => {
    if (!servicioSeleccionado) return;

    await addAppointment({
      servicio: servicioSeleccionado.titulo,
      doctor: servicioSeleccionado.doctor + ' · Especialista',
      fecha: diaSeleccionado,
      hora: horaSeleccionada,
      modalidad,
      lugar:
        modalidad === 'Presencial en consultorio'
          ? 'Centro Cardiológico Tarija · Calle Sucre #450'
          : 'Consulta Virtual (Enlace por HeartCheck)',
      duracion: servicioSeleccionado.duracion,
      costo: servicioSeleccionado.precio,
    });

    setModalVisible(false);
    Alert.alert(
      '¡Cita Agendada y Notificación Programada!',
      `Tu turno para "${servicioSeleccionado.titulo}" se guardó en SQLite para el ${diaSeleccionado} a las ${horaSeleccionada}. Se ha programado un recordatorio automático en tu teléfono.`
    );
  };

  const handleCancelarCita = (cita: Appointment) => {
    Alert.alert(
      'Cancelar Reserva',
      `¿Deseas cancelar la cita de ${cita.servicio} con ${cita.doctor}?`,
      [
        { text: 'Volver', style: 'cancel' },
        {
          text: 'Cancelar Cita',
          style: 'destructive',
          onPress: async () => {
            await cancelAppointment(cita.id);
            Alert.alert('Cita Cancelada', 'La reserva fue eliminada de tu base de datos.');
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
          <Text style={styles.headerTitle}>Atención y Citas Médicas</Text>
          <Text style={styles.headerSubtitle}>
            Reserva con especialistas y consulta tus citas agendadas
          </Text>
        </View>

        {/* Selector de Pestañas: Catálogo vs Mis Reservas */}
        <View style={styles.toggleTabs}>
          <TouchableOpacity
            style={[styles.toggleBtn, vistaActiva === 'catalogo' && styles.toggleBtnActive]}
            onPress={() => setVistaActiva('catalogo')}>
            <Ionicons
              name="medkit-outline"
              size={16}
              color={vistaActiva === 'catalogo' ? Theme.colors.primary : '#7C736C'}
            />
            <Text
              style={[
                styles.toggleBtnText,
                vistaActiva === 'catalogo' && styles.toggleBtnTextActive,
              ]}>
              Catálogo de Servicios
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, vistaActiva === 'reservas' && styles.toggleBtnActive]}
            onPress={() => setVistaActiva('reservas')}>
            <Ionicons
              name="calendar"
              size={16}
              color={vistaActiva === 'reservas' ? Theme.colors.primary : '#7C736C'}
            />
            <Text
              style={[
                styles.toggleBtnText,
                vistaActiva === 'reservas' && styles.toggleBtnTextActive,
              ]}>
              Mis Reservas ({appointments.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* VISTA 1: CATÁLOGO DE SERVICIOS */}
        {vistaActiva === 'catalogo' ? (
          <>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={20} color="#7C736C" />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar consulta, estudio o especialista..."
                placeholderTextColor="#A1978F"
                value={busqueda}
                onChangeText={setBusqueda}
              />
              {busqueda.length > 0 && (
                <TouchableOpacity onPress={() => setBusqueda('')}>
                  <Ionicons name="close-circle" size={18} color="#7C736C" />
                </TouchableOpacity>
              )}
            </View>

            {/* Categories */}
            <View style={styles.categoriesWrapper}>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={categorias}
                keyExtractor={(item) => item}
                contentContainerStyle={styles.categoriesList}
                renderItem={({ item }) => {
                  const activa = categoriaSeleccionada === item;
                  return (
                    <TouchableOpacity
                      style={[styles.catPill, activa && styles.catPillActive]}
                      onPress={() => setCategoriaSeleccionada(item)}>
                      <Text style={[styles.catPillText, activa && styles.catPillTextActive]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>

            {/* Service Cards List */}
            <FlatList
              data={serviciosFiltrados}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.servicesList}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.serviceCard}>
                  <View style={styles.serviceHeader}>
                    <View style={styles.serviceBadge}>
                      <Text style={styles.serviceBadgeText}>{item.categoria}</Text>
                    </View>
                    <Text style={styles.servicePrice}>{item.precio}</Text>
                  </View>

                  <Text style={styles.serviceTitle}>{item.titulo}</Text>
                  <Text style={styles.serviceDesc}>{item.descripcion}</Text>

                  <View style={styles.serviceMetaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons name="person-outline" size={14} color="#7C736C" />
                      <Text style={styles.metaText}>{item.doctor}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={14} color="#7C736C" />
                      <Text style={styles.metaText}>{item.duracion}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.bookBtn}
                    activeOpacity={0.85}
                    onPress={() => abrirReserva(item)}>
                    <FontAwesome5 name="calendar-plus" size={14} color="#FFFFFF" />
                    <Text style={styles.bookBtnText}>Reservar Turno</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </>
        ) : (
          /* VISTA 2: MIS RESERVAS DE CITAS GUARDADAS EN SQLITE */
          <FlatList
            data={appointments}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.reservationsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={54} color="#C4B7AC" />
                <Text style={styles.emptyTitle}>No tienes citas agendadas</Text>
                <Text style={styles.emptyDesc}>
                  Explora el catálogo de servicios y reserva tu control cardiológico o estudio médico.
                </Text>
                <TouchableOpacity
                  style={styles.emptyBtn}
                  onPress={() => setVistaActiva('catalogo')}>
                  <Text style={styles.emptyBtnText}>Ver Catálogo</Text>
                </TouchableOpacity>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.reservationCard}>
                <View style={styles.resCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.resTitle}>{item.servicio}</Text>
                    <Text style={styles.resDoctor}>{item.doctor}</Text>
                  </View>
                  <View style={styles.resStatusBadge}>
                    <Text style={styles.resStatusText}>{item.estado}</Text>
                  </View>
                </View>

                <View style={styles.resDetailsBox}>
                  <View style={styles.resDetailRow}>
                    <Ionicons name="calendar" size={16} color={Theme.colors.primary} />
                    <Text style={styles.resDetailText}>Fecha: {item.fecha}</Text>
                  </View>
                  <View style={styles.resDetailRow}>
                    <Ionicons name="time" size={16} color={Theme.colors.primary} />
                    <Text style={styles.resDetailText}>Hora: {item.hora} ({item.duracion})</Text>
                  </View>
                  <View style={styles.resDetailRow}>
                    <Ionicons name="location" size={16} color={Theme.colors.primary} />
                    <Text style={styles.resDetailText}>{item.lugar}</Text>
                  </View>
                  <View style={styles.resDetailRow}>
                    <Ionicons name="cash-outline" size={16} color="#059669" />
                    <Text style={[styles.resDetailText, { fontWeight: '700', color: '#059669' }]}>
                      Costo: {item.costo}
                    </Text>
                  </View>
                </View>

                <View style={styles.resNotificationInfo}>
                  <Ionicons name="notifications" size={14} color="#0284C7" />
                  <Text style={styles.resNotificationText}>
                    Recordatorio de cita activo en tu dispositivo
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => handleCancelarCita(item)}>
                  <Ionicons name="trash-outline" size={14} color="#EF4444" />
                  <Text style={styles.cancelBtnText}>Cancelar Reserva</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}

        {/* Modal: Detalle y Reserva del Turno */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Detalle y Reserva</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#2A2421" />
                </TouchableOpacity>
              </View>

              {servicioSeleccionado && (
                <>
                  <View style={styles.serviceSummaryBox}>
                    <Text style={styles.summaryTitle}>{servicioSeleccionado.titulo}</Text>
                    <Text style={styles.summaryDoc}>
                      {servicioSeleccionado.doctor} · {servicioSeleccionado.precio}
                    </Text>
                  </View>

                  {/* Selector de Fecha */}
                  <Text style={styles.fieldLabel}>Fecha de Atención</Text>
                  <View style={styles.dateSelector}>
                    {['Jueves 26 de Nov', 'Viernes 27 de Nov', 'Lunes 30 de Nov'].map((dia) => (
                      <TouchableOpacity
                        key={dia}
                        style={[styles.datePill, diaSeleccionado === dia && styles.datePillActive]}
                        onPress={() => setDiaSeleccionado(dia)}>
                        <Text
                          style={[
                            styles.datePillText,
                            diaSeleccionado === dia && styles.datePillTextActive,
                          ]}>
                          {dia}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Selector de Horarios */}
                  <Text style={styles.fieldLabel}>Horarios Disponibles</Text>
                  <View style={styles.timesGrid}>
                    {horariosDisponibles.map((h) => (
                      <TouchableOpacity
                        key={h}
                        style={[styles.timeSlot, horaSeleccionada === h && styles.timeSlotActive]}
                        onPress={() => setHoraSeleccionada(h)}>
                        <Text
                          style={[
                            styles.timeSlotText,
                            horaSeleccionada === h && styles.timeSlotTextActive,
                          ]}>
                          {h}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Modalidad */}
                  <Text style={styles.fieldLabel}>Modalidad de Atención</Text>
                  <View style={styles.modalityRow}>
                    <TouchableOpacity
                      style={[
                        styles.modalityBtn,
                        modalidad === 'Presencial en consultorio' && styles.modalityBtnActive,
                      ]}
                      onPress={() => setModalidad('Presencial en consultorio')}>
                      <Ionicons
                        name="business-outline"
                        size={16}
                        color={
                          modalidad === 'Presencial en consultorio' ? Theme.colors.primary : '#7C736C'
                        }
                      />
                      <Text
                        style={[
                          styles.modalityText,
                          modalidad === 'Presencial en consultorio' && styles.modalityTextActive,
                        ]}>
                        Presencial (Tarija)
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.modalityBtn,
                        modalidad === 'Teleconsulta / Virtual' && styles.modalityBtnActive,
                      ]}
                      onPress={() => setModalidad('Teleconsulta / Virtual')}>
                      <Ionicons
                        name="videocam-outline"
                        size={16}
                        color={
                          modalidad === 'Teleconsulta / Virtual' ? Theme.colors.primary : '#7C736C'
                        }
                      />
                      <Text
                        style={[
                          styles.modalityText,
                          modalidad === 'Teleconsulta / Virtual' && styles.modalityTextActive,
                        ]}>
                        Teleconsulta
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.notificationNoticeBox}>
                    <Ionicons name="notifications-outline" size={16} color="#0369A1" />
                    <Text style={styles.notificationNoticeText}>
                      Se activará un recordatorio en tu celular para el día de la cita.
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.confirmBtn}
                    activeOpacity={0.85}
                    onPress={confirmarReserva}>
                    <Text style={styles.confirmBtnText}>Confirmar y Guardar Reserva</Text>
                  </TouchableOpacity>
                </>
              )}
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
    backgroundColor: '#F8F6F4',
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECE2D8',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2A2421',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#7C736C',
    marginTop: 2,
  },
  toggleTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECE2D8',
    gap: 8,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F8F6F4',
    gap: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#FDEEE7',
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C736C',
  },
  toggleBtnTextActive: {
    color: Theme.colors.primary,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECE2D8',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#2A2421',
  },
  categoriesWrapper: {
    marginTop: 10,
    marginBottom: 6,
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE2D8',
  },
  catPillActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  catPillText: {
    fontSize: 12,
    color: '#7C736C',
    fontWeight: '600',
  },
  catPillTextActive: {
    color: '#FFFFFF',
  },
  servicesList: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECE2D8',
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceBadge: {
    backgroundColor: '#FDEEE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  serviceBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.primary,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '800',
    color: Theme.colors.primary,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2A2421',
    marginBottom: 4,
  },
  serviceDesc: {
    fontSize: 13,
    color: '#6B5E57',
    lineHeight: 18,
    marginBottom: 12,
  },
  serviceMetaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 14,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#7C736C',
  },
  bookBtn: {
    backgroundColor: Theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  reservationsList: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  reservationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECE2D8',
  },
  resCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  resTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2A2421',
  },
  resDoctor: {
    fontSize: 13,
    color: '#7C736C',
    marginTop: 2,
  },
  resStatusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  resStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  resDetailsBox: {
    backgroundColor: '#F8F6F4',
    padding: 12,
    borderRadius: 10,
    gap: 6,
    marginBottom: 10,
  },
  resDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resDetailText: {
    fontSize: 13,
    color: '#4A3E39',
  },
  resNotificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F9FF',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  resNotificationText: {
    fontSize: 11,
    color: '#0369A1',
    fontWeight: '500',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
    gap: 6,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2A2421',
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#7C736C',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  emptyBtn: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2A2421',
  },
  serviceSummaryBox: {
    backgroundColor: '#F8F6F4',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2A2421',
  },
  summaryDoc: {
    fontSize: 13,
    color: Theme.colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2A2421',
    marginBottom: 8,
  },
  dateSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  datePill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F8F6F4',
    borderWidth: 1,
    borderColor: '#ECE2D8',
    alignItems: 'center',
  },
  datePillActive: {
    backgroundColor: '#FDEEE7',
    borderColor: Theme.colors.primary,
  },
  datePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7C736C',
  },
  datePillTextActive: {
    color: Theme.colors.primary,
    fontWeight: '700',
  },
  timesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  timeSlot: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F8F6F4',
    borderWidth: 1,
    borderColor: '#ECE2D8',
  },
  timeSlotActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  timeSlotText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2A2421',
  },
  timeSlotTextActive: {
    color: '#FFFFFF',
  },
  modalityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  modalityBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F8F6F4',
    borderWidth: 1,
    borderColor: '#ECE2D8',
    gap: 6,
  },
  modalityBtnActive: {
    backgroundColor: '#FDEEE7',
    borderColor: Theme.colors.primary,
  },
  modalityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C736C',
  },
  modalityTextActive: {
    color: Theme.colors.primary,
    fontWeight: '700',
  },
  notificationNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F9FF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  notificationNoticeText: {
    fontSize: 11,
    color: '#0369A1',
    flex: 1,
  },
  confirmBtn: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

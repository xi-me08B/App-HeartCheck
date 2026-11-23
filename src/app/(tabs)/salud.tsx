import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';
import { useHeartCheck, BpRecord } from '@/context/HeartCheckContext';

export default function SaludScreen() {
  const router = useRouter();
  const {
    bpRecords,
    addBpRecord,
    updateBpRecord,
    deleteBpRecord,
    resumenBp,
    clima,
    climaCargando,
    climaError,
    cargarClima,
    lifestyle,
    updateLifestyle,
    medications,
    registrarToma,
    activarRecordatorioComida,
    activarRecordatorioEntrenamiento,
  } = useHeartCheck();

  // Active sub-tab
  const [seccionActiva, setSeccionActiva] = useState<'presion' | 'metas' | 'tratamiento' | 'evolucion'>('presion');

  // Input states for Tensiómetro
  const [sistolica, setSistolica] = useState('');
  const [diastolica, setDiastolica] = useState('');
  const [pulso, setPulso] = useState('');
  const [horaMedicion, setHoraMedicion] = useState('08:30');

  // Edit Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [registroAEditar, setRegistroAEditar] = useState<BpRecord | null>(null);
  const [editSis, setEditSis] = useState('');
  const [editDia, setEditDia] = useState('');
  const [editPul, setEditPul] = useState('');

  const clasificarPresion = (sis: number, dia: number) => {
    if (sis > 120 || dia > 80) return { label: 'Hipertensión', color: '#EF4444', bg: '#FEE2E2' };
    if (sis < 90 || dia < 60) return { label: 'Hipotensión', color: '#3B82F6', bg: '#DBEAFE' };
    return { label: 'Normal', color: '#10B981', bg: '#DCFCE7' };
  };

  const handleGuardarPresion = async () => {
    const sis = parseInt(sistolica, 10);
    const dia = parseInt(diastolica, 10);
    const pul = parseInt(pulso, 10) || 75;

    // Validación completa
    if (!sistolica.trim() || !diastolica.trim()) {
      Alert.alert('Campos Obligatorios', 'Por favor ingresa los valores de presión sistólica y diastólica.');
      return;
    }

    if (isNaN(sis) || isNaN(dia) || sis < 50 || sis > 250 || dia < 30 || dia > 150) {
      Alert.alert(
        'Formato o Rango Inválido',
        'Ingresa valores médicos razonables:\n• Sistólica entre 50 y 250 mmHg\n• Diastólica entre 30 y 150 mmHg.'
      );
      return;
    }

    await addBpRecord(sis, dia, pul, 'Hoy', horaMedicion);
    setSistolica('');
    setDiastolica('');
    setPulso('');
    Alert.alert(
      '¡Registro Guardado en SQLite!',
      `Lectura ${sis}/${dia} mmHg guardada exitosamente y complementada con datos de clima.`
    );
  };

  const abrirEdicion = (item: BpRecord) => {
    setRegistroAEditar(item);
    setEditSis(String(item.sistolica));
    setEditDia(String(item.diastolica));
    setEditPul(String(item.pulso));
    setEditModalVisible(true);
  };

  const handleGuardarEdicion = async () => {
    if (!registroAEditar) return;
    const sis = parseInt(editSis, 10);
    const dia = parseInt(editDia, 10);
    const pul = parseInt(editPul, 10) || 75;

    if (isNaN(sis) || isNaN(dia) || sis < 50 || sis > 250 || dia < 30 || dia > 150) {
      Alert.alert('Valores Inválidos', 'Verifica que la presión sistólica y diastólica sean válidas.');
      return;
    }

    await updateBpRecord(registroAEditar.id, sis, dia, pul);
    setEditModalVisible(false);
    setRegistroAEditar(null);
    Alert.alert('Actualizado', 'La medición ha sido modificada en la base de datos SQLite.');
  };

  const confirmarEliminar = (item: BpRecord) => {
    Alert.alert(
      'Eliminar Registro',
      `¿Deseas eliminar permanentemente la medición de ${item.sistolica}/${item.diastolica} mmHg?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deleteBpRecord(item.id);
            Alert.alert('Eliminado', 'Registro borrado de la base de datos.');
          },
        },
      ]
    );
  };

  const verDetalle = (item: BpRecord) => {
    router.push({
      pathname: '/detalle',
      params: {
        id: item.id,
        sistolica: item.sistolica,
        diastolica: item.diastolica,
        pulso: item.pulso,
        fecha: item.fecha,
        hora: item.hora,
        estado: item.estado,
        temperatura_clima: item.temperatura_clima ?? (clima?.temperatura ?? ''),
        humedad_clima: item.humedad_clima ?? (clima?.humedad ?? ''),
        descripcionClima: clima?.descripcionClima ?? '',
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Control y Salud Cardíaca</Text>
          <Text style={styles.headerSubtitle}>
            Base SQLite local sincronizada con API ambiental
          </Text>
        </View>

        {/* Sub Navigation Bar */}
        <View style={styles.subTabBar}>
          {[
            { id: 'presion', label: 'Tensiómetro', icon: 'speedometer' },
            { id: 'metas', label: 'Estilo de Vida', icon: 'walk' },
            { id: 'tratamiento', label: 'Tratamiento', icon: 'medical' },
            { id: 'evolucion', label: 'Evolución', icon: 'stats-chart' },
          ].map((tab) => {
            const activa = seccionActiva === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.subTabItem, activa && styles.subTabItemActive]}
                onPress={() => setSeccionActiva(tab.id as any)}>
                <Ionicons
                  name={tab.icon as any}
                  size={18}
                  color={activa ? Theme.colors.primary : '#7C736C'}
                />
                <Text style={[styles.subTabText, activa && styles.subTabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* SECCIÓN 1: TENSIÓMETRO Y CRUD SQLITE */}
          {seccionActiva === 'presion' && (
            <View>
              {/* Tarjeta del Clima Tarija (Integración API Pública - Patrón B) */}
              <View style={styles.weatherCard}>
                <View style={styles.weatherHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="cloudy-night-outline" size={20} color="#0284C7" />
                    <Text style={styles.weatherTitle}>API Pública: Clima en Tarija</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.retryBtnSmall}
                    onPress={cargarClima}
                    disabled={climaCargando}>
                    <Ionicons name="refresh" size={16} color="#0284C7" />
                    <Text style={styles.retryTextSmall}>
                      {climaCargando ? 'Cargando...' : 'Reintentar'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {climaCargando ? (
                  <View style={styles.weatherStateBox}>
                    <Text style={styles.weatherStateText}>⏳ Consultando Open-Meteo API...</Text>
                  </View>
                ) : climaError ? (
                  <View style={[styles.weatherStateBox, { backgroundColor: '#FEE2E2' }]}>
                    <Text style={[styles.weatherStateText, { color: '#B91C1C' }]}>
                      ⚠️ {climaError}
                    </Text>
                    <TouchableOpacity style={styles.retryButtonLarge} onPress={cargarClima}>
                      <Text style={styles.retryButtonLargeText}>Reintentar Conexión</Text>
                    </TouchableOpacity>
                  </View>
                ) : clima ? (
                  <View style={styles.weatherContent}>
                    <View style={styles.weatherMain}>
                      <Text style={styles.weatherTemp}>{clima.temperatura}°C</Text>
                      <View>
                        <Text style={styles.weatherDesc}>{clima.descripcionClima}</Text>
                        <Text style={styles.weatherSub}>Humedad: {clima.humedad}% · P. Atm: {clima.presionAtmosferica} hPa</Text>
                      </View>
                    </View>
                    <Text style={styles.weatherNote}>
                      ℹ️ Los datos del clima se asocian a tus registros de presión arterial en SQLite.
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Formulario de Registro de Presión con Validación */}
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Registrar Nueva Lectura de Presión</Text>
                <Text style={styles.formSubtitle}>
                  Los datos se guardan en SQLite (`mediciones_presion`) y persisten al cerrar la app.
                </Text>

                <View style={styles.inputsRow}>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>Sistólica (alta) *</Text>
                    <View style={styles.inputBox}>
                      <TextInput
                        style={styles.numericInput}
                        keyboardType="numeric"
                        placeholder="120"
                        value={sistolica}
                        onChangeText={setSistolica}
                        maxLength={3}
                      />
                      <Text style={styles.unitText}>mmHg</Text>
                    </View>
                  </View>

                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>Diastólica (baja) *</Text>
                    <View style={styles.inputBox}>
                      <TextInput
                        style={styles.numericInput}
                        keyboardType="numeric"
                        placeholder="80"
                        value={diastolica}
                        onChangeText={setDiastolica}
                        maxLength={3}
                      />
                      <Text style={styles.unitText}>mmHg</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.inputsRow}>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>Pulso (opcional)</Text>
                    <View style={styles.inputBox}>
                      <TextInput
                        style={styles.numericInput}
                        keyboardType="numeric"
                        placeholder="72"
                        value={pulso}
                        onChangeText={setPulso}
                        maxLength={3}
                      />
                      <Text style={styles.unitText}>BPM</Text>
                    </View>
                  </View>

                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>Hora de toma</Text>
                    <View style={styles.inputBox}>
                      <TextInput
                        style={styles.numericInput}
                        placeholder="08:30"
                        value={horaMedicion}
                        onChangeText={setHoraMedicion}
                      />
                    </View>
                  </View>
                </View>

                <TouchableOpacity style={styles.btnGuardar} onPress={handleGuardarPresion}>
                  <Ionicons name="save-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.btnGuardarText}>Guardar en Base de Datos SQLite</Text>
                </TouchableOpacity>
              </View>

              {/* Resumen con COUNT y AVG */}
              <View style={styles.statsSummaryCard}>
                <View style={styles.statSummaryItem}>
                  <Text style={styles.statSummaryValue}>{resumenBp.total}</Text>
                  <Text style={styles.statSummaryLabel}>Registros (COUNT)</Text>
                </View>
                <View style={styles.statSummaryDivider} />
                <View style={styles.statSummaryItem}>
                  <Text style={styles.statSummaryValue}>{resumenBp.promedioSistolica}</Text>
                  <Text style={styles.statSummaryLabel}>Prom. Sistólica</Text>
                </View>
                <View style={styles.statSummaryDivider} />
                <View style={styles.statSummaryItem}>
                  <Text style={styles.statSummaryValue}>{resumenBp.promedioDiastolica}</Text>
                  <Text style={styles.statSummaryLabel}>Prom. Diastólica</Text>
                </View>
              </View>

              {/* Lista de Registros con Acciones CRUD (Ver detalle, Modificar, Borrar) */}
              <Text style={styles.sectionTitle}>Historial en SQLite ({bpRecords.length})</Text>
              <Text style={styles.sectionSubtitle}>
                Toca cualquier registro para ver su detalle completo o usa los botones para editar/eliminar.
              </Text>

              {bpRecords.map((item) => {
                const badge = clasificarPresion(item.sistolica, item.diastolica);
                return (
                  <View key={item.id} style={styles.recordCard}>
                    <TouchableOpacity
                      style={styles.recordMain}
                      activeOpacity={0.7}
                      onPress={() => verDetalle(item)}>
                      <View style={styles.recordLeft}>
                        <View style={styles.recordPressureRow}>
                          <Text style={styles.recordPressureText}>
                            {item.sistolica}/{item.diastolica}
                          </Text>
                          <Text style={styles.recordMmHg}>mmHg</Text>
                        </View>
                        <Text style={styles.recordSubText}>
                          Pulso: {item.pulso} BPM · {item.fecha} a las {item.hora}
                        </Text>
                        {item.temperatura_clima != null && (
                          <Text style={styles.recordWeatherText}>
                            🌡️ {item.temperatura_clima}°C ({item.humedad_clima}% hum)
                          </Text>
                        )}
                      </View>

                      <View style={{ alignItems: 'flex-end', gap: 6 }}>
                        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                          <Text style={[styles.badgeText, { color: badge.color }]}>
                            {badge.label}
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={styles.viewDetailText}>Ver detalle</Text>
                          <Ionicons name="chevron-forward" size={14} color="#7C4D38" />
                        </View>
                      </View>
                    </TouchableOpacity>

                    {/* Botones de Modificar y Eliminar */}
                    <View style={styles.recordActionsRow}>
                      <TouchableOpacity
                        style={styles.actionBtnEdit}
                        onPress={() => abrirEdicion(item)}>
                        <Ionicons name="pencil" size={15} color="#D97706" />
                        <Text style={styles.actionBtnEditText}>Modificar</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionBtnDelete}
                        onPress={() => confirmarEliminar(item)}>
                        <Ionicons name="trash-outline" size={15} color="#EF4444" />
                        <Text style={styles.actionBtnDeleteText}>Eliminar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* SECCIÓN 2: METAS Y ESTILO DE VIDA */}
          {seccionActiva === 'metas' && (
            <View>
              <View style={styles.lifestyleCard}>
                <Text style={styles.lifestyleTitle}>Objetivo Semanal de Actividad</Text>
                <Text style={styles.lifestyleMetaText}>{lifestyle.metaSemanal}</Text>

                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.round(
                          (lifestyle.diasCompletados / lifestyle.totalDias) * 100
                        )}%`,
                      },
                    ]}
                  />
                </View>

                <View style={styles.diasRow}>
                  {lifestyle.dias.map((d, index) => (
                    <View key={index} style={styles.diaItem}>
                      <View
                        style={[
                          styles.diaCircle,
                          d.completado ? styles.diaCompletado : styles.diaIncompleto,
                        ]}>
                        <Ionicons
                          name={d.completado ? 'checkmark' : 'close'}
                          size={14}
                          color={d.completado ? '#FFFFFF' : '#A1978F'}
                        />
                      </View>
                      <Text style={styles.diaLabel}>{d.dia}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.habitsGrid}>
                <View style={styles.habitBox}>
                  <Ionicons name="walk" size={24} color={Theme.colors.primary} />
                  <Text style={styles.habitNumber}>{lifestyle.actividadMinutos} min</Text>
                  <Text style={styles.habitLabel}>Caminata diaria</Text>
                  <TouchableOpacity
                    style={styles.btnIncrement}
                    onPress={() =>
                      updateLifestyle({ actividadMinutos: lifestyle.actividadMinutos + 5 })
                    }>
                    <Text style={styles.btnIncrementText}>+5 min</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.btnReminderSmall}
                    onPress={async () => {
                      await activarRecordatorioEntrenamiento();
                      Alert.alert('Recordatorio Programado', 'Te notificaremos para salir a caminar o entrenar.');
                    }}>
                    <Ionicons name="notifications-outline" size={12} color="#0284C7" />
                    <Text style={styles.btnReminderSmallText}>Avisarme</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.habitBox}>
                  <Ionicons name="nutrition" size={24} color="#059669" />
                  <Text style={styles.habitNumber}>Dieta sana</Text>
                  <Text style={styles.habitLabel}>Bajo en sodio</Text>
                  <TouchableOpacity
                    style={styles.btnReminderFood}
                    onPress={async () => {
                      await activarRecordatorioComida();
                      Alert.alert('Recordatorio Programado', 'Te notificaremos la hora de alimentación cardiosaludable.');
                    }}>
                    <Ionicons name="notifications-outline" size={13} color="#FFFFFF" />
                    <Text style={styles.btnReminderFoodText}>Recordar comida</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* SECCIÓN 3: TRATAMIENTO Y MEDICAMENTOS */}
          {seccionActiva === 'tratamiento' && (
            <View>
              <Text style={styles.sectionTitle}>Pauta Médica Actual</Text>
              <Text style={styles.sectionSubtitle}>
                Medicamentos prescritos para la hipertensión arterial
              </Text>

              {medications.map((med) => (
                <View key={med.id} style={styles.medCard}>
                  <View style={styles.medHeader}>
                    <View style={styles.medIconBox}>
                      <Ionicons name="medkit" size={20} color={Theme.colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.medNombre}>{med.nombre}</Text>
                      <Text style={styles.medHorario}>⏰ {med.horario} · {med.frecuencia}</Text>
                    </View>
                  </View>

                  <Text style={styles.medPauta}>{med.pauta}</Text>

                  <View style={styles.medActions}>
                    <TouchableOpacity
                      style={[
                        styles.btnMedAction,
                        med.estadoHoy === 'tomada' && styles.btnMedTomada,
                      ]}
                      onPress={() => registrarToma(med.id, 'tomada')}>
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={med.estadoHoy === 'tomada' ? '#FFFFFF' : '#10B981'}
                      />
                      <Text
                        style={[
                          styles.btnMedText,
                          med.estadoHoy === 'tomada' && styles.btnMedTextActive,
                        ]}>
                        {med.estadoHoy === 'tomada' ? 'Tomada hoy' : 'Marcar tomada'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.btnMedAction,
                        med.estadoHoy === 'omitida' && styles.btnMedOmitida,
                      ]}
                      onPress={() => registrarToma(med.id, 'omitida')}>
                      <Ionicons
                        name="close-circle"
                        size={16}
                        color={med.estadoHoy === 'omitida' ? '#FFFFFF' : '#EF4444'}
                      />
                      <Text
                        style={[
                          styles.btnMedText,
                          med.estadoHoy === 'omitida' && styles.btnMedTextActive,
                        ]}>
                        Omitida
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* SECCIÓN 4: EVOLUCIÓN */}
          {seccionActiva === 'evolucion' && (
            <View>
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Tendencia de Presión Semanal</Text>
                <Text style={styles.formSubtitle}>
                  Monitoreo preventivo del riesgo cardiovascular
                </Text>

                <View style={styles.trendRow}>
                  <View style={styles.trendItem}>
                    <Text style={styles.trendValue}>121/79</Text>
                    <Text style={styles.trendLabel}>Promedio 7 días</Text>
                  </View>
                  <View style={styles.trendItem}>
                    <Text style={[styles.trendValue, { color: '#10B981' }]}>85%</Text>
                    <Text style={styles.trendLabel}>En rango meta</Text>
                  </View>
                  <View style={styles.trendItem}>
                    <Text style={styles.trendValue}>{resumenBp.maxSistolica}</Text>
                    <Text style={styles.trendLabel}>Pico sistólico</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* MODAL DE EDICIÓN SQLITE */}
        <Modal
          visible={editModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setEditModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Editar Medición en SQLite</Text>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#2A2421" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>
                Modifica los valores del registro #{registroAEditar?.id}
              </Text>

              <View style={styles.inputsRow}>
                <View style={styles.inputCol}>
                  <Text style={styles.inputLabel}>Sistólica</Text>
                  <View style={styles.inputBox}>
                    <TextInput
                      style={styles.numericInput}
                      keyboardType="numeric"
                      value={editSis}
                      onChangeText={setEditSis}
                      maxLength={3}
                    />
                    <Text style={styles.unitText}>mmHg</Text>
                  </View>
                </View>

                <View style={styles.inputCol}>
                  <Text style={styles.inputLabel}>Diastólica</Text>
                  <View style={styles.inputBox}>
                    <TextInput
                      style={styles.numericInput}
                      keyboardType="numeric"
                      value={editDia}
                      onChangeText={setEditDia}
                      maxLength={3}
                    />
                    <Text style={styles.unitText}>mmHg</Text>
                  </View>
                </View>
              </View>

              <View style={{ marginTop: 12 }}>
                <Text style={styles.inputLabel}>Pulso (BPM)</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.numericInput}
                    keyboardType="numeric"
                    value={editPul}
                    onChangeText={setEditPul}
                    maxLength={3}
                  />
                  <Text style={styles.unitText}>BPM</Text>
                </View>
              </View>

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={styles.modalBtnCancel}
                  onPress={() => setEditModalVisible(false)}>
                  <Text style={styles.modalBtnCancelText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalBtnSave}
                  onPress={handleGuardarEdicion}>
                  <Text style={styles.modalBtnSaveText}>Actualizar (UPDATE)</Text>
                </TouchableOpacity>
              </View>
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
    paddingBottom: 10,
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
  subTabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ECE2D8',
    gap: 8,
  },
  subTabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F8F6F4',
    gap: 4,
  },
  subTabItemActive: {
    backgroundColor: '#FDEEE7',
  },
  subTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7C736C',
  },
  subTabTextActive: {
    color: Theme.colors.primary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  weatherCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    padding: 14,
    marginBottom: 16,
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  weatherTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0369A1',
  },
  retryBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#E0F2FE',
  },
  retryTextSmall: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0284C7',
  },
  weatherStateBox: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
  },
  weatherStateText: {
    fontSize: 13,
    color: '#0369A1',
    fontWeight: '500',
  },
  retryButtonLarge: {
    marginTop: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  retryButtonLargeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  weatherContent: {
    gap: 6,
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weatherTemp: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0284C7',
  },
  weatherDesc: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  weatherSub: {
    fontSize: 12,
    color: '#475569',
  },
  weatherNote: {
    fontSize: 11,
    color: '#64748B',
    fontStyle: 'italic',
    marginTop: 2,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECE2D8',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2A2421',
  },
  formSubtitle: {
    fontSize: 12,
    color: '#7C736C',
    marginTop: 2,
    marginBottom: 12,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  inputCol: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A3E39',
    marginBottom: 4,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2D7CC',
    borderRadius: 10,
    backgroundColor: '#FAFAF9',
    paddingHorizontal: 10,
  },
  numericInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    fontWeight: '700',
    color: '#2A2421',
  },
  unitText: {
    fontSize: 11,
    color: '#7C736C',
    fontWeight: '600',
  },
  btnGuardar: {
    backgroundColor: Theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  btnGuardarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  statsSummaryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECE2D8',
    marginBottom: 16,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statSummaryItem: {
    alignItems: 'center',
  },
  statSummaryValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Theme.colors.primary,
  },
  statSummaryLabel: {
    fontSize: 11,
    color: '#7C736C',
    marginTop: 2,
  },
  statSummaryDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#ECE2D8',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2A2421',
    marginTop: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#7C736C',
    marginBottom: 10,
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ECE2D8',
    marginBottom: 10,
    overflow: 'hidden',
  },
  recordMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  recordLeft: {
    flex: 1,
  },
  recordPressureRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  recordPressureText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2A2421',
  },
  recordMmHg: {
    fontSize: 12,
    color: '#7C736C',
    fontWeight: '600',
  },
  recordSubText: {
    fontSize: 12,
    color: '#6B5E57',
    marginTop: 2,
  },
  recordWeatherText: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '600',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  viewDetailText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7C4D38',
  },
  recordActionsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0E8E0',
    backgroundColor: '#FCFAF8',
  },
  actionBtnEdit: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
    borderRightWidth: 1,
    borderRightColor: '#F0E8E0',
  },
  actionBtnEditText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  actionBtnDelete: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  actionBtnDeleteText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  lifestyleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECE2D8',
    marginBottom: 14,
  },
  lifestyleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2A2421',
  },
  lifestyleMetaText: {
    fontSize: 13,
    color: '#7C736C',
    marginTop: 2,
    marginBottom: 12,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F0EAE4',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Theme.colors.primary,
    borderRadius: 4,
  },
  diasRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  diaItem: {
    alignItems: 'center',
    gap: 4,
  },
  diaCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diaCompletado: {
    backgroundColor: Theme.colors.primary,
  },
  diaIncompleto: {
    backgroundColor: '#EBE3DC',
  },
  diaLabel: {
    fontSize: 11,
    color: '#7C736C',
    fontWeight: '600',
  },
  habitsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  habitBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECE2D8',
  },
  habitNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2A2421',
    marginTop: 6,
  },
  habitLabel: {
    fontSize: 11,
    color: '#7C736C',
    marginBottom: 8,
  },
  btnIncrement: {
    backgroundColor: '#F8F6F4',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  btnIncrementText: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.primary,
  },
  btnReminderSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#E0F2FE',
  },
  btnReminderSmallText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0284C7',
  },
  btnReminderFood: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnReminderFoodText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  medCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECE2D8',
    marginBottom: 10,
  },
  medHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  medIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FDEEE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  medNombre: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2A2421',
  },
  medHorario: {
    fontSize: 12,
    color: '#7C736C',
    marginTop: 1,
  },
  medPauta: {
    fontSize: 12,
    color: '#4A3E39',
    backgroundColor: '#F8F6F4',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  medActions: {
    flexDirection: 'row',
    gap: 8,
  },
  btnMedAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2D7CC',
    gap: 4,
  },
  btnMedTomada: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  btnMedOmitida: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  btnMedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A3E39',
  },
  btnMedTextActive: {
    color: '#FFFFFF',
  },
  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  trendItem: {
    alignItems: 'center',
  },
  trendValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2A2421',
  },
  trendLabel: {
    fontSize: 11,
    color: '#7C736C',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ECE2D8',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2A2421',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#7C736C',
    marginTop: 2,
    marginBottom: 16,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalBtnCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ECE2D8',
    alignItems: 'center',
  },
  modalBtnCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C736C',
  },
  modalBtnSave: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
  },
  modalBtnSaveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';
import { useHeartCheck } from '@/context/HeartCheckContext';

export default function EstudiosScreen() {
  const { studies, addStudy, centers } = useHeartCheck();

  const [activeTab, setActiveTab] = useState<'estudios' | 'directorio'>('estudios');

  // New study upload states
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [tituloEstudio, setTituloEstudio] = useState('');
  const [notasEstudio, setNotasEstudio] = useState('');
  const [cargando, setCargando] = useState(false);

  // Search in directory
  const [busquedaZona, setBusquedaZona] = useState('Tarija');

  const tomarFoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permiso necesario',
          'Se requiere acceso a la cámara para fotografiar tu estudio.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (e) {
      console.warn(e);
      Alert.alert('Error', 'No se pudo abrir la cámara.');
    }
  };

  const seleccionarGaleria = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permiso necesario',
          'Se requiere acceso a la galería para seleccionar imágenes.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (e) {
      console.warn(e);
      Alert.alert('Error', 'No se pudo abrir la galería.');
    }
  };

  const guardarEstudio = () => {
    if (!selectedImage) {
      Alert.alert('Falta imagen', 'Por favor toma una foto o selecciona una imagen de tu estudio.');
      return;
    }

    if (!tituloEstudio.trim()) {
      Alert.alert('Falta título', 'Escribe el nombre del estudio (ej. Electrocardiograma, Análisis).');
      return;
    }

    setCargando(true);
    setTimeout(() => {
      setCargando(false);
      addStudy(tituloEstudio, selectedImage, notasEstudio);
      setSelectedImage(null);
      setTituloEstudio('');
      setNotasEstudio('');
      Alert.alert('Estudio Adjunto', 'Tu estudio médico ha sido guardado exitosamente.');
    }, 600);
  };

  const llamarCentro = (tel: string, nombre: string) => {
    Alert.alert('Llamada Médica', `¿Deseas marcar al ${tel} (${nombre})?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Llamar',
        onPress: () => {
          Linking.openURL(`tel:${tel.replace(/\s+/g, '')}`).catch(() => {
            Alert.alert('Error', 'No se pudo iniciar la llamada en este dispositivo.');
          });
        },
      },
    ]);
  };

  const centrosFiltrados = centers.filter(
    (c) =>
      c.nombre.toLowerCase().includes(busquedaZona.toLowerCase()) ||
      c.zona.toLowerCase().includes(busquedaZona.toLowerCase()) ||
      c.direccion.toLowerCase().includes(busquedaZona.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Estudios y Directorio</Text>
          <Text style={styles.headerSubtitle}>
            Gestión de archivos médicos y centros de salud cercanos
          </Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.switcherBtn, activeTab === 'estudios' && styles.switcherBtnActive]}
            onPress={() => setActiveTab('estudios')}>
            <Ionicons
              name="camera-outline"
              size={18}
              color={activeTab === 'estudios' ? Theme.colors.primary : '#7C736C'}
            />
            <Text
              style={[
                styles.switcherText,
                activeTab === 'estudios' && styles.switcherTextActive,
              ]}>
              Adjuntar Estudio
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.switcherBtn, activeTab === 'directorio' && styles.switcherBtnActive]}
            onPress={() => setActiveTab('directorio')}>
            <Ionicons
              name="map-outline"
              size={18}
              color={activeTab === 'directorio' ? Theme.colors.primary : '#7C736C'}
            />
            <Text
              style={[
                styles.switcherText,
                activeTab === 'directorio' && styles.switcherTextActive,
              ]}>
              Centros Cercanos
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* ================= TAB 1: ADJUNTAR ESTUDIO ================= */}
          {activeTab === 'estudios' && (
            <View>
              {/* Upload Box */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Nuevo Estudio Médico</Text>
                <Text style={styles.cardSubtitle}>
                  Sube fotografías claras de tus análisis de laboratorio, ECG o ecografías
                </Text>

                {/* Preview or Placeholder */}
                {selectedImage ? (
                  <View style={styles.previewContainer}>
                    <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                    <TouchableOpacity
                      style={styles.removeImageBtn}
                      onPress={() => setSelectedImage(null)}>
                      <Ionicons name="trash" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <MaterialCommunityIcons name="camera-plus-outline" size={48} color="#A89F97" />
                    <Text style={styles.uploadPlaceholderText}>
                      Toma una fotografía o elige desde tu galería
                    </Text>
                  </View>
                )}

                {/* Photo Action Buttons */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.sourceBtn}
                    onPress={tomarFoto}
                    activeOpacity={0.8}>
                    <Ionicons name="camera" size={18} color={Theme.colors.primary} />
                    <Text style={styles.sourceBtnText}>Tomar Fotografía</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.sourceBtn}
                    onPress={seleccionarGaleria}
                    activeOpacity={0.8}>
                    <Ionicons name="images" size={18} color={Theme.colors.primary} />
                    <Text style={styles.sourceBtnText}>Elegir de Galería</Text>
                  </TouchableOpacity>
                </View>

                {/* Inputs */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Título del Estudio</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej. Electrocardiograma de esfuerzo..."
                    placeholderTextColor="#A89F97"
                    value={tituloEstudio}
                    onChangeText={setTituloEstudio}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Notas o Indicaciones del Médico</Text>
                  <TextInput
                    style={[styles.input, { height: 75, textAlignVertical: 'top' }]}
                    placeholder="Detalles relevantes, fecha del laboratorio..."
                    placeholderTextColor="#A89F97"
                    value={notasEstudio}
                    onChangeText={setNotasEstudio}
                    multiline
                  />
                </View>

                {/* Confirm upload */}
                <TouchableOpacity
                  style={[styles.confirmBtn, !selectedImage && { opacity: 0.6 }]}
                  disabled={!selectedImage || cargando}
                  onPress={guardarEstudio}>
                  <Text style={styles.confirmBtnText}>
                    {cargando ? 'Guardando...' : 'Confirmar Carga de Estudio'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Uploaded Studies List */}
              <Text style={styles.sectionHeading}>Mis Estudios Guardados</Text>

              {studies.map((item) => (
                <View key={item.id} style={styles.studyCard}>
                  <Image source={{ uri: item.uri }} style={styles.studyThumb} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.studyTitle}>{item.titulo}</Text>
                    <Text style={styles.studyDate}>Fecha: {item.fecha}</Text>
                    {item.notas ? <Text style={styles.studyNotes}>{item.notas}</Text> : null}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ================= TAB 2: DIRECTORIO DE CENTROS ================= */}
          {activeTab === 'directorio' && (
            <View>
              {/* Search in Tarija */}
              <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color="#7C736C" />
                <TextInput
                  style={styles.dirSearchInput}
                  placeholder="Buscar centro o zona en Tarija..."
                  placeholderTextColor="#A89F97"
                  value={busquedaZona}
                  onChangeText={setBusquedaZona}
                />
                {busquedaZona.length > 0 && (
                  <TouchableOpacity onPress={() => setBusquedaZona('')}>
                    <Ionicons name="close-circle" size={16} color="#7C736C" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Proposed map banner */}
              <View style={styles.mapBanner}>
                <Ionicons name="map" size={28} color={Theme.colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.mapBannerTitle}>Directorio Georreferenciado</Text>
                  <Text style={styles.mapBannerSub}>
                    Ubicación y teléfonos de emergencia de la red de salud en Tarija
                  </Text>
                </View>
              </View>

              {/* Centers list */}
              {centrosFiltrados.map((c) => (
                <View key={c.id} style={styles.centerCard}>
                  <View style={styles.centerTop}>
                    <View style={styles.centerTypeBadge}>
                      <Text style={styles.centerTypeText}>{c.tipo}</Text>
                    </View>
                    <Text style={styles.centerDist}>{c.distancia}</Text>
                  </View>

                  <Text style={styles.centerName}>{c.nombre}</Text>

                  <View style={styles.centerMetaRow}>
                    <Ionicons name="location-outline" size={14} color="#7C736C" />
                    <Text style={styles.centerMetaText}>{c.direccion} ({c.zona})</Text>
                  </View>

                  <View style={styles.centerMetaRow}>
                    <Ionicons name="time-outline" size={14} color="#7C736C" />
                    <Text style={styles.centerMetaText}>{c.horario}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.callCenterBtn}
                    activeOpacity={0.85}
                    onPress={() => llamarCentro(c.telefono, c.nombre)}>
                    <Ionicons name="call" size={15} color="#FFFFFF" />
                    <Text style={styles.callCenterBtnText}>Llamar: {c.telefono}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
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
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E8DED6',
    marginBottom: 14,
    ...Theme.shadows.soft,
  },
  switcherBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  switcherBtnActive: {
    backgroundColor: Theme.colors.primaryLight,
  },
  switcherText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7C736C',
  },
  switcherTextActive: {
    color: Theme.colors.primary,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EFE7E0',
    marginBottom: 16,
    ...Theme.shadows.soft,
  },
  cardTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#24201E',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#766D66',
    marginBottom: 14,
  },
  uploadPlaceholder: {
    backgroundColor: '#FAF4EE',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#D8CDC2',
    borderStyle: 'dashed',
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  uploadPlaceholderText: {
    fontSize: 13,
    color: '#7C736C',
    marginTop: 8,
  },
  previewContainer: {
    position: 'relative',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14,
    height: 180,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.65)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  sourceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#FAF4EE',
    borderWidth: 1,
    borderColor: '#E8DED6',
  },
  sourceBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#443D37',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#342E2A',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FAF4EE',
    borderWidth: 1,
    borderColor: '#E8DED6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#26201E',
  },
  confirmBtn: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...Theme.shadows.button,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#26201E',
    marginBottom: 10,
    marginTop: 4,
  },
  studyCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFE7E0',
    marginBottom: 10,
    gap: 12,
    alignItems: 'center',
  },
  studyThumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#F3ECE4',
  },
  studyTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#24201E',
  },
  studyDate: {
    fontSize: 12,
    color: '#766D66',
    marginTop: 2,
  },
  studyNotes: {
    fontSize: 11.5,
    color: '#8A8077',
    marginTop: 2,
  },

  // Directory styles
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8DED6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    marginBottom: 12,
  },
  dirSearchInput: {
    flex: 1,
    fontSize: 14,
    color: '#26201E',
  },
  mapBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE9E5',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    marginBottom: 14,
  },
  mapBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#26201E',
  },
  mapBannerSub: {
    fontSize: 12,
    color: '#766D66',
    marginTop: 2,
  },
  centerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFE7E0',
    marginBottom: 12,
    ...Theme.shadows.soft,
  },
  centerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  centerTypeBadge: {
    backgroundColor: '#F5ECE4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  centerTypeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#655D56',
  },
  centerDist: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.primary,
  },
  centerName: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#24201E',
    marginBottom: 6,
  },
  centerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 2,
  },
  centerMetaText: {
    fontSize: 12.5,
    color: '#766D66',
  },
  callCenterBtn: {
    backgroundColor: Theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  callCenterBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

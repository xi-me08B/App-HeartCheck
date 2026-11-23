import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {
  getDb,
  obtenerMediciones,
  agregarMedicion,
  modificarMedicion,
  eliminarMedicion,
  obtenerResumenMediciones,
  verificarUsuario,
  registrarUsuarioSql,
  obtenerCitas,
  agregarCita,
  eliminarCita,
  BpRecordRow,
} from '@/datos';
import { obtenerClimaTarija, WeatherData } from '@/api';
import {
  programarRecordatorioCita,
  programarRecordatorioComida,
  programarRecordatorioEntrenamiento,
  notificarInmediata,
} from '@/notificaciones';

export interface UserProfile {
  nombre: string;
  correo: string;
  telefono: string;
  ciudad: string;
  edad: number;
  contactoEmergencia: string;
  isLoggedIn: boolean;
  notificaciones: boolean;
}

export interface BpRecord {
  id: string;
  sistolica: number;
  diastolica: number;
  pulso: number;
  fecha: string;
  hora: string;
  origen: 'manual' | 'tensiómetro';
  estado: 'Normal' | 'Hipotensión' | 'Hipertensión';
  temperatura_clima?: number | null;
  humedad_clima?: number | null;
}

export interface Appointment {
  id: string;
  servicio: string;
  doctor: string;
  fecha: string;
  hora: string;
  modalidad: string;
  lugar: string;
  duracion: string;
  costo: string;
  estado: 'Confirmada' | 'Pendiente' | 'Completada';
}

export interface Medication {
  id: string;
  nombre: string;
  horario: string;
  frecuencia: string;
  pauta: string;
  estadoHoy: 'pendiente' | 'tomada' | 'omitida';
  historialTomas: { fecha: string; estado: 'tomada' | 'omitida'; hora: string }[];
}

export interface LifestyleData {
  metaSemanal: string;
  diasCompletados: number;
  totalDias: number;
  actividadMinutos: number;
  aguaVasos: number;
  horasSueno: number;
  dias: { dia: string; completado: boolean }[];
}

export interface MedicalStudy {
  id: string;
  titulo: string;
  fecha: string;
  uri: string;
  notas: string;
}

export interface MedicalService {
  id: string;
  titulo: string;
  categoria: 'Consultas' | 'Cardiología' | 'Estudios' | 'Monitoreo';
  duracion: string;
  precio: string;
  doctor: string;
  descripcion: string;
  disponible: boolean;
}

export interface MedicalCenter {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  distancia: string;
  zona: string;
  horario: string;
  tipo: 'Hospital' | 'Clínica' | 'Centro Cardiológico';
}

interface HeartCheckContextType {
  user: UserProfile;
  login: (correo: string, clave: string) => Promise<boolean>;
  logout: () => void;
  register: (nombre: string, correo: string, clave: string) => Promise<boolean>;
  updateUser: (data: Partial<UserProfile>) => void;

  bpRecords: BpRecord[];
  recargarMediciones: () => Promise<void>;
  addBpRecord: (sistolica: number, diastolica: number, pulso: number, fecha?: string, hora?: string) => Promise<void>;
  updateBpRecord: (id: string, sistolica: number, diastolica: number, pulso: number) => Promise<void>;
  deleteBpRecord: (id: string) => Promise<void>;
  resumenBp: { total: number; promedioSistolica: number; promedioDiastolica: number; maxSistolica: number };

  currentBpm: number;
  medirPulso: () => void;
  isMeasuringBpm: boolean;

  // Clima API (Patrón B: Mis datos + datos externos)
  clima: WeatherData | null;
  climaCargando: boolean;
  climaError: string | null;
  cargarClima: () => Promise<void>;

  // Citas y Reservas en SQLite
  appointments: Appointment[];
  recargarCitas: () => Promise<void>;
  addAppointment: (app: Omit<Appointment, 'id' | 'estado'>) => Promise<void>;
  cancelAppointment: (id: string) => Promise<void>;

  // Notificaciones interactivas
  activarRecordatorioComida: () => Promise<void>;
  activarRecordatorioEntrenamiento: () => Promise<void>;

  lifestyle: LifestyleData;
  updateLifestyle: (data: Partial<LifestyleData>) => void;

  medications: Medication[];
  registrarToma: (id: string, estado: 'tomada' | 'omitida') => void;

  studies: MedicalStudy[];
  addStudy: (titulo: string, uri: string, notas: string) => void;

  services: MedicalService[];
  centers: MedicalCenter[];
}

const INITIAL_USER: UserProfile = {
  nombre: 'Elena Vargas',
  correo: 'elena.vargas@heartcheck.bo',
  telefono: '+591 71234567',
  ciudad: 'Tarija, Bolivia',
  edad: 58,
  contactoEmergencia: 'Carlos Vargas (+591 72345678)',
  isLoggedIn: true,
  notificaciones: true,
};

const INITIAL_SERVICES: MedicalService[] = [
  {
    id: 's-1',
    titulo: 'Primera Consulta Cardiológica',
    categoria: 'Consultas',
    duracion: '45 min',
    precio: '180 Bs',
    doctor: 'Dra. Paula Ríos',
    descripcion: 'Evaluación inicial completa, anamnesis, auscultación y revisión de signos vitales.',
    disponible: true,
  },
  {
    id: 's-2',
    titulo: 'Control Periódico de Presión',
    categoria: 'Monitoreo',
    duracion: '25 min',
    precio: '100 Bs',
    doctor: 'Dr. Fernando Morales',
    descripcion: 'Seguimiento mensual del paciente hipertenso y ajuste de medicación.',
    disponible: true,
  },
  {
    id: 's-3',
    titulo: 'Ecocardiograma Doppler Color',
    categoria: 'Estudios',
    duracion: '40 min',
    precio: '350 Bs',
    doctor: 'Dra. Paula Ríos',
    descripcion: 'Ultrasonido detallado para evaluar flujo sanguíneo y cavidades del corazón.',
    disponible: true,
  },
  {
    id: 's-4',
    titulo: 'Holter de Presión (MAPA 24h)',
    categoria: 'Monitoreo',
    duracion: '24 hrs',
    precio: '280 Bs',
    doctor: 'Dra. Claudia Benítez',
    descripcion: 'Monitoreo ambulatorio continuo de la presión arterial durante el día y la noche.',
    disponible: true,
  },
  {
    id: 's-5',
    titulo: 'Electrocardiograma (ECG en reposo)',
    categoria: 'Estudios',
    duracion: '20 min',
    precio: '120 Bs',
    doctor: 'Dr. Fernando Morales',
    descripcion: 'Registro de la actividad eléctrica cardíaca de 12 derivaciones.',
    disponible: true,
  },
  {
    id: 's-6',
    titulo: 'Revisión y Plan Preventivo',
    categoria: 'Cardiología',
    duracion: '30 min',
    precio: '140 Bs',
    doctor: 'Dra. Paula Ríos',
    descripcion: 'Orientación integral sobre factores de riesgo, nutrición y prescripción de ejercicio.',
    disponible: true,
  },
];

const INITIAL_CENTERS: MedicalCenter[] = [
  {
    id: 'c-1',
    nombre: 'Hospital Regional San Juan de Dios',
    direccion: 'Av. Las Delicias esq. Santa Cruz',
    telefono: '+591 4 6645555',
    distancia: '1.2 km',
    zona: 'Zona Central, Tarija',
    horario: 'Emergencias 24 Horas',
    tipo: 'Hospital',
  },
  {
    id: 'c-2',
    nombre: 'Clínica Prosalud Tarija',
    direccion: 'Calle Madrid #820 entre Sucre y Ballivián',
    telefono: '+591 4 6632222',
    distancia: '2.5 km',
    zona: 'Barrio El Molino, Tarija',
    horario: '07:00 a 22:00',
    tipo: 'Clínica',
  },
  {
    id: 'c-3',
    nombre: 'Centro Cardiológico y Vascular Tarija',
    direccion: 'Calle Sucre #450 piso 2',
    telefono: '+591 4 6659900',
    distancia: '0.8 km',
    zona: 'Casco Viejo, Tarija',
    horario: '08:00 a 20:00',
    tipo: 'Centro Cardiológico',
  },
];

const INITIAL_MEDICATIONS: Medication[] = [
  {
    id: 'm-1',
    nombre: 'Losartán 50mg',
    horario: '08:00 AM',
    frecuencia: 'Cada 24 horas (Mañanas)',
    pauta: '1 comprimido en ayunas con abundante agua',
    estadoHoy: 'tomada',
    historialTomas: [
      { fecha: 'Hoy', estado: 'tomada', hora: '08:10' },
      { fecha: 'Ayer', estado: 'tomada', hora: '08:05' },
    ],
  },
  {
    id: 'm-2',
    nombre: 'Amlodipino 5mg',
    horario: '08:00 PM',
    frecuencia: 'Cada 24 horas (Noches)',
    pauta: '1 comprimido después de la cena',
    estadoHoy: 'pendiente',
    historialTomas: [
      { fecha: 'Ayer', estado: 'tomada', hora: '20:15' },
    ],
  },
];

const INITIAL_LIFESTYLE: LifestyleData = {
  metaSemanal: '5 días con 30 min de actividad física',
  diasCompletados: 4,
  totalDias: 7,
  actividadMinutos: 35,
  aguaVasos: 6,
  horasSueno: 7.5,
  dias: [
    { dia: 'Lun', completado: true },
    { dia: 'Mar', completado: true },
    { dia: 'Mié', completado: false },
    { dia: 'Jue', completado: true },
    { dia: 'Vie', completado: true },
    { dia: 'Sáb', completado: false },
    { dia: 'Dom', completado: false },
  ],
};

const INITIAL_STUDIES: MedicalStudy[] = [
  {
    id: 'st-1',
    titulo: 'Electrocardiograma (ECG)',
    fecha: '15 de Noviembre 2026',
    uri: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=60',
    notas: 'Trazado normal sin alteraciones de repolarización. Frecuencia sinusal.',
  },
  {
    id: 'st-2',
    titulo: 'Perfil Lipídico en Sangre',
    fecha: '10 de Noviembre 2026',
    uri: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop&q=60',
    notas: 'Colesterol total 190 mg/dL, Triglicéridos 145 mg/dL dentro de rangos aceptables.',
  },
];

const HeartCheckContext = createContext<HeartCheckContextType | undefined>(undefined);

export function HeartCheckProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [bpRecords, setBpRecords] = useState<BpRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [resumenBp, setResumenBp] = useState({
    total: 0,
    promedioSistolica: 120,
    promedioDiastolica: 80,
    maxSistolica: 120,
  });
  const [currentBpm, setCurrentBpm] = useState(72);
  const [isMeasuringBpm, setIsMeasuringBpm] = useState(false);

  // Clima API States
  const [clima, setClima] = useState<WeatherData | null>(null);
  const [climaCargando, setClimaCargando] = useState<boolean>(false);
  const [climaError, setClimaError] = useState<string | null>(null);

  const [medications, setMedications] = useState<Medication[]>(INITIAL_MEDICATIONS);
  const [lifestyle, setLifestyle] = useState<LifestyleData>(INITIAL_LIFESTYLE);
  const [studies, setStudies] = useState<MedicalStudy[]>(INITIAL_STUDIES);

  // Cargar mediciones desde SQLite
  const recargarMediciones = useCallback(async () => {
    try {
      const db = await getDb();
      const rows = await obtenerMediciones(db);
      const mapped: BpRecord[] = rows.map((r) => ({
        id: String(r.id),
        sistolica: r.sistolica,
        diastolica: r.diastolica,
        pulso: r.pulso,
        fecha: r.fecha,
        hora: r.hora,
        origen: (r.origen as 'manual' | 'tensiómetro') || 'manual',
        estado: (r.estado as 'Normal' | 'Hipotensión' | 'Hipertensión') || 'Normal',
        temperatura_clima: r.temperatura_clima,
        humedad_clima: r.humedad_clima,
      }));
      setBpRecords(mapped);

      const resumen = await obtenerResumenMediciones(db);
      setResumenBp(resumen);

      if (mapped.length > 0) {
        setCurrentBpm(mapped[0].pulso);
      }
    } catch (e) {
      console.warn('Error leyendo SQLite mediciones:', e);
    }
  }, []);

  // Cargar citas desde SQLite
  const recargarCitas = useCallback(async () => {
    try {
      const db = await getDb();
      const rows = await obtenerCitas(db);
      const mapped: Appointment[] = rows.map((r) => ({
        id: String(r.id),
        servicio: r.servicio,
        doctor: r.doctor,
        fecha: r.fecha,
        hora: r.hora,
        modalidad: r.modalidad,
        lugar: r.lugar,
        duracion: r.duracion,
        costo: r.costo,
        estado: (r.estado as 'Confirmada' | 'Pendiente' | 'Completada') || 'Confirmada',
      }));
      setAppointments(mapped);
    } catch (e) {
      console.warn('Error leyendo SQLite citas:', e);
    }
  }, []);

  // Consumir API del clima
  const cargarClima = useCallback(async () => {
    setClimaCargando(true);
    setClimaError(null);
    try {
      const data = await obtenerClimaTarija();
      setClima(data);
    } catch (err: any) {
      setClimaError(err.message || 'No se pudo conectar a la API del clima. Revisa tu conexión.');
    } finally {
      setClimaCargando(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void recargarMediciones();
      void recargarCitas();
      void cargarClima();
    });
  }, [recargarMediciones, recargarCitas, cargarClima]);

  const login = async (correo: string, clave: string): Promise<boolean> => {
    try {
      const db = await getDb();
      const usuarioDb = await verificarUsuario(db, correo, clave);
      if (usuarioDb) {
        setUser({
          nombre: usuarioDb.nombre,
          correo: usuarioDb.correo,
          telefono: usuarioDb.telefono || '+591 71234567',
          ciudad: usuarioDb.ciudad || 'Tarija, Bolivia',
          edad: usuarioDb.edad || 58,
          contactoEmergencia: 'Carlos Vargas (+591 72345678)',
          isLoggedIn: true,
          notificaciones: true,
        });
        return true;
      }
    } catch (e) {
      console.warn('Error en login SQLite:', e);
    }

    // Fallback de usuario por defecto
    if (correo.toLowerCase().trim() === 'elena.vargas@heartcheck.bo' && clave === '123456') {
      setUser({ ...INITIAL_USER, isLoggedIn: true });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser((prev) => ({ ...prev, isLoggedIn: false }));
  };

  const register = async (nombre: string, correo: string, clave: string): Promise<boolean> => {
    try {
      const db = await getDb();
      await registrarUsuarioSql(db, nombre, correo, clave);
      setUser({
        nombre,
        correo,
        telefono: '+591 70000000',
        ciudad: 'Tarija, Bolivia',
        edad: 35,
        contactoEmergencia: 'Familiar (+591 70000001)',
        isLoggedIn: true,
        notificaciones: true,
      });
      return true;
    } catch (e) {
      console.warn('Error en registro SQLite:', e);
      return false;
    }
  };

  const updateUser = (data: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...data }));
  };

  const addBpRecord = async (
    sistolica: number,
    diastolica: number,
    pulso: number,
    fecha: string = 'Hoy',
    hora: string = '08:30'
  ) => {
    let estado: 'Normal' | 'Hipotensión' | 'Hipertensión' = 'Normal';
    if (sistolica > 120 || diastolica > 80) estado = 'Hipertensión';
    else if (sistolica < 90 || diastolica < 60) estado = 'Hipotensión';

    try {
      const db = await getDb();
      await agregarMedicion(
        db,
        sistolica,
        diastolica,
        pulso,
        fecha,
        hora,
        'manual',
        estado,
        clima?.temperatura ?? null,
        clima?.humedad ?? null
      );
      await recargarMediciones();
    } catch (e) {
      console.warn('Error agregando a SQLite:', e);
      const newRecord: BpRecord = {
        id: `bp-${Date.now()}`,
        sistolica,
        diastolica,
        pulso,
        fecha,
        hora,
        origen: 'manual',
        estado,
        temperatura_clima: clima?.temperatura,
        humedad_clima: clima?.humedad,
      };
      setBpRecords([newRecord, ...bpRecords]);
    }
    setCurrentBpm(pulso);
  };

  const updateBpRecord = async (
    id: string,
    sistolica: number,
    diastolica: number,
    pulso: number
  ) => {
    let estado: 'Normal' | 'Hipotensión' | 'Hipertensión' = 'Normal';
    if (sistolica > 120 || diastolica > 80) estado = 'Hipertensión';
    else if (sistolica < 90 || diastolica < 60) estado = 'Hipotensión';

    try {
      const db = await getDb();
      await modificarMedicion(db, Number(id), sistolica, diastolica, pulso, estado);
      await recargarMediciones();
    } catch (e) {
      console.warn('Error actualizando en SQLite:', e);
      setBpRecords((prev) =>
        prev.map((r) => (r.id === id ? { ...r, sistolica, diastolica, pulso, estado } : r))
      );
    }
  };

  const deleteBpRecord = async (id: string) => {
    try {
      const db = await getDb();
      await eliminarMedicion(db, Number(id));
      await recargarMediciones();
    } catch (e) {
      console.warn('Error eliminando en SQLite:', e);
      setBpRecords((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const addAppointment = async (app: Omit<Appointment, 'id' | 'estado'>) => {
    try {
      const db = await getDb();
      await agregarCita(
        db,
        app.servicio,
        app.doctor,
        app.fecha,
        app.hora,
        app.modalidad,
        app.lugar,
        app.duracion,
        app.costo,
        'Confirmada'
      );
      await recargarCitas();
    } catch (e) {
      console.warn('Error guardando cita en SQLite:', e);
      const newApp: Appointment = {
        ...app,
        id: `app-${Date.now()}`,
        estado: 'Confirmada',
      };
      setAppointments([newApp, ...appointments]);
    }

    // Programar notificación de recordatorio para la cita en el celular
    await programarRecordatorioCita(app.doctor, app.servicio, app.fecha, app.hora);
  };

  const cancelAppointment = async (id: string) => {
    try {
      const db = await getDb();
      await eliminarCita(db, Number(id));
      await recargarCitas();
    } catch (e) {
      console.warn('Error cancelando cita en SQLite:', e);
      setAppointments(appointments.filter((a) => a.id !== id));
    }
  };

  const activarRecordatorioComida = async () => {
    await programarRecordatorioComida();
  };

  const activarRecordatorioEntrenamiento = async () => {
    await programarRecordatorioEntrenamiento();
  };

  const medirPulso = () => {
    setIsMeasuringBpm(true);
    setTimeout(() => {
      const simulatedBpm = Math.floor(Math.random() * 15) + 68;
      setCurrentBpm(simulatedBpm);
      setIsMeasuringBpm(false);
    }, 2000);
  };

  const updateLifestyle = (data: Partial<LifestyleData>) => {
    setLifestyle({ ...lifestyle, ...data });
  };

  const registrarToma = (id: string, estado: 'tomada' | 'omitida') => {
    setMedications((prev) =>
      prev.map((med) => {
        if (med.id === id) {
          const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return {
            ...med,
            estadoHoy: estado,
            historialTomas: [{ fecha: 'Hoy', estado, hora }, ...med.historialTomas],
          };
        }
        return med;
      })
    );
  };

  const addStudy = (titulo: string, uri: string, notas: string) => {
    const newStudy: MedicalStudy = {
      id: `st-${Date.now()}`,
      titulo,
      fecha: 'Hoy',
      uri,
      notas,
    };
    setStudies([newStudy, ...studies]);
  };

  return (
    <HeartCheckContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        updateUser,
        bpRecords,
        recargarMediciones,
        addBpRecord,
        updateBpRecord,
        deleteBpRecord,
        resumenBp,
        currentBpm,
        medirPulso,
        isMeasuringBpm,
        clima,
        climaCargando,
        climaError,
        cargarClima,
        appointments,
        recargarCitas,
        addAppointment,
        cancelAppointment,
        activarRecordatorioComida,
        activarRecordatorioEntrenamiento,
        lifestyle,
        updateLifestyle,
        medications,
        registrarToma,
        studies,
        addStudy,
        services: INITIAL_SERVICES,
        centers: INITIAL_CENTERS,
      }}>
      {children}
    </HeartCheckContext.Provider>
  );
}

export function useHeartCheck() {
  const context = useContext(HeartCheckContext);
  if (!context) {
    throw new Error('useHeartCheck must be used within a HeartCheckProvider');
  }
  return context;
}

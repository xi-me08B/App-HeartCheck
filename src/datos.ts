import * as SQLite from 'expo-sqlite';

export interface BpRecordRow {
  id: number;
  sistolica: number;
  diastolica: number;
  pulso: number;
  fecha: string;
  hora: string;
  origen: string;
  estado: string;
  temperatura_clima?: number | null;
  humedad_clima?: number | null;
  creado_en?: string;
}

export interface AppointmentRow {
  id: number;
  servicio: string;
  doctor: string;
  fecha: string;
  hora: string;
  modalidad: string;
  lugar: string;
  duracion: string;
  costo: string;
  estado: string;
  creado_en?: string;
}

export interface UserRow {
  id: number;
  nombre: string;
  correo: string;
  clave: string;
  telefono?: string;
  ciudad?: string;
  edad?: number;
}

const DB_NAME = 'heartcheck.db';
let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
  }
  return dbInstance;
}

/**
 * Inicialización de la base de datos SQLite (tablas e índices)
 * Se ejecuta al arrancar la app.
 */
export async function initDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      correo TEXT UNIQUE NOT NULL,
      clave TEXT NOT NULL,
      telefono TEXT,
      ciudad TEXT,
      edad INTEGER
    );

    CREATE TABLE IF NOT EXISTS mediciones_presion (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sistolica INTEGER NOT NULL,
      diastolica INTEGER NOT NULL,
      pulso INTEGER NOT NULL,
      fecha TEXT NOT NULL,
      hora TEXT NOT NULL,
      origen TEXT NOT NULL DEFAULT 'manual',
      estado TEXT NOT NULL,
      temperatura_clima REAL,
      humedad_clima REAL,
      creado_en TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS reservas_citas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      servicio TEXT NOT NULL,
      doctor TEXT NOT NULL,
      fecha TEXT NOT NULL,
      hora TEXT NOT NULL,
      modalidad TEXT NOT NULL,
      lugar TEXT NOT NULL,
      duracion TEXT NOT NULL,
      costo TEXT NOT NULL,
      estado TEXT NOT NULL DEFAULT 'Confirmada',
      creado_en TEXT DEFAULT (datetime('now', 'localtime'))
    );
  `);

  // Sembrar datos iniciales si la tabla de mediciones está vacía
  const countResult = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM mediciones_presion;'
  );

  if (countResult && countResult.count === 0) {
    await db.runAsync(
      `INSERT INTO mediciones_presion (sistolica, diastolica, pulso, fecha, hora, origen, estado, temperatura_clima, humedad_clima)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [120, 78, 72, 'Hoy', '08:15', 'manual', 'Normal', 18.5, 90]
    );
    await db.runAsync(
      `INSERT INTO mediciones_presion (sistolica, diastolica, pulso, fecha, hora, origen, estado, temperatura_clima, humedad_clima)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [122, 79, 75, 'Ayer', '19:30', 'manual', 'Normal', 22.1, 75]
    );
    await db.runAsync(
      `INSERT INTO mediciones_presion (sistolica, diastolica, pulso, fecha, hora, origen, estado, temperatura_clima, humedad_clima)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [134, 88, 82, 'Lunes', '08:45', 'manual', 'Hipertensión', 16.0, 85]
    );
  }

  // Sembrar citas iniciales si la tabla está vacía
  const countCitas = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM reservas_citas;'
  );
  if (countCitas && countCitas.count === 0) {
    await db.runAsync(
      `INSERT INTO reservas_citas (servicio, doctor, fecha, hora, modalidad, lugar, duracion, costo, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'Control Cardiológico Periódico',
        'Dra. Paula Ríos · Cardióloga',
        'Jueves 26 de Noviembre',
        '09:00',
        'Presencial en consultorio',
        'Centro Cardiológico Tarija · Calle Sucre #450',
        '30 min',
        '150 Bs',
        'Confirmada',
      ]
    );
  }

  // Sembrar usuario inicial si no existe
  const userCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM usuarios;'
  );
  if (userCount && userCount.count === 0) {
    await db.runAsync(
      `INSERT INTO usuarios (nombre, correo, clave, telefono, ciudad, edad)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['Elena Vargas', 'elena.vargas@heartcheck.bo', '123456', '+591 71234567', 'Tarija, Bolivia', 58]
    );
  }
}

// ==========================================
// OPERACIONES CRUD: MEDICIONES DE PRESIÓN
// ==========================================

export async function obtenerMediciones(db: SQLite.SQLiteDatabase): Promise<BpRecordRow[]> {
  const rows = await db.getAllAsync<BpRecordRow>(
    'SELECT * FROM mediciones_presion ORDER BY id DESC;'
  );
  return rows;
}

export async function obtenerMedicionPorId(db: SQLite.SQLiteDatabase, id: number): Promise<BpRecordRow | null> {
  const row = await db.getFirstAsync<BpRecordRow>(
    'SELECT * FROM mediciones_presion WHERE id = ?;',
    [id]
  );
  return row;
}

export async function agregarMedicion(
  db: SQLite.SQLiteDatabase,
  sistolica: number,
  diastolica: number,
  pulso: number,
  fecha: string,
  hora: string,
  origen: string,
  estado: string,
  temperatura_clima?: number | null,
  humedad_clima?: number | null
): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO mediciones_presion (sistolica, diastolica, pulso, fecha, hora, origen, estado, temperatura_clima, humedad_clima)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [sistolica, diastolica, pulso, fecha, hora, origen, estado, temperatura_clima ?? null, humedad_clima ?? null]
  );
  return result.lastInsertRowId;
}

export async function modificarMedicion(
  db: SQLite.SQLiteDatabase,
  id: number,
  sistolica: number,
  diastolica: number,
  pulso: number,
  estado: string
): Promise<void> {
  await db.runAsync(
    `UPDATE mediciones_presion
     SET sistolica = ?, diastolica = ?, pulso = ?, estado = ?
     WHERE id = ?;`,
    [sistolica, diastolica, pulso, estado, id]
  );
}

export async function eliminarMedicion(db: SQLite.SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync(
    'DELETE FROM mediciones_presion WHERE id = ?;',
    [id]
  );
}

export async function obtenerResumenMediciones(db: SQLite.SQLiteDatabase): Promise<{
  total: number;
  promedioSistolica: number;
  promedioDiastolica: number;
  maxSistolica: number;
}> {
  const result = await db.getFirstAsync<{
    total: number;
    promedioSistolica: number | null;
    promedioDiastolica: number | null;
    maxSistolica: number | null;
  }>(
    `SELECT 
       COUNT(*) as total, 
       AVG(sistolica) as promedioSistolica, 
       AVG(diastolica) as promedioDiastolica,
       MAX(sistolica) as maxSistolica
     FROM mediciones_presion;`
  );

  return {
    total: result?.total || 0,
    promedioSistolica: Math.round(result?.promedioSistolica || 0),
    promedioDiastolica: Math.round(result?.promedioDiastolica || 0),
    maxSistolica: result?.maxSistolica || 0,
  };
}

// ==========================================
// OPERACIONES CRUD: RESERVAS DE CITAS (SQLITE)
// ==========================================

export async function obtenerCitas(db: SQLite.SQLiteDatabase): Promise<AppointmentRow[]> {
  const rows = await db.getAllAsync<AppointmentRow>(
    'SELECT * FROM reservas_citas ORDER BY id DESC;'
  );
  return rows;
}

export async function agregarCita(
  db: SQLite.SQLiteDatabase,
  servicio: string,
  doctor: string,
  fecha: string,
  hora: string,
  modalidad: string,
  lugar: string,
  duracion: string,
  costo: string,
  estado: string = 'Confirmada'
): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO reservas_citas (servicio, doctor, fecha, hora, modalidad, lugar, duracion, costo, estado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [servicio, doctor, fecha, hora, modalidad, lugar, duracion, costo, estado]
  );
  return result.lastInsertRowId;
}

export async function eliminarCita(db: SQLite.SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync(
    'DELETE FROM reservas_citas WHERE id = ?;',
    [id]
  );
}

// ==========================================
// AUTENTICACIÓN SQL
// ==========================================

export async function verificarUsuario(
  db: SQLite.SQLiteDatabase,
  correo: string,
  clave: string
): Promise<UserRow | null> {
  const row = await db.getFirstAsync<UserRow>(
    'SELECT id, nombre, correo, clave, telefono, ciudad, edad FROM usuarios WHERE correo = ? AND clave = ?;',
    [correo.trim().toLowerCase(), clave]
  );
  return row;
}

export async function registrarUsuarioSql(
  db: SQLite.SQLiteDatabase,
  nombre: string,
  correo: string,
  clave: string
): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO usuarios (nombre, correo, clave, telefono, ciudad, edad) VALUES (?, ?, ?, ?, ?, ?);',
    [nombre.trim(), correo.trim().toLowerCase(), clave, '+591 70000000', 'Tarija, Bolivia', 30]
  );
  return result.lastInsertRowId;
}

# PROYECTO FINAL - APLICACIONES MÓVILES I (SIS-0180)
## UNIVERSIDAD PRIVADA DOMINGO SAVIO - SEDE TARIJA
### HeartCheck: Sistema Móvil de Monitoreo Cardiovascular y Salud

---

## 1. PORTADA Y DATOS DEL PROYECTO
- **Nombre de la Aplicación:** HeartCheck
- **Asignatura:** Aplicaciones Móviles I (SIS-0180) - 8vo Semestre
- **Institución:** Universidad Privada Domingo Savio (UPDS) - Sede Tarija
- **Facultad:** Facultad de Ingeniería - Ingeniería de Sistemas
- **Grupo:** Grupo 3
- **Fecha:** Noviembre 2026
- **Integrantes y Roles:**
  1. **Fernando Alberto Castillo (Coordinador & Integrador):** Gestión del cronograma, entregables, unificación y control de versiones del código.
  2. **Especialista en Interfaz y Navegación:** Diseño de pantallas (`src/app`), navegadores Stack y Tabs, componentes visuales, validaciones de formularios y experiencia de usuario.
  3. **Especialista en Base de Datos SQLite:** Modelado de datos relacionales, archivo `datos.js` / `src/datos.ts`, persistencia con `expo-sqlite`, sentencias parametrizadas `?`, consultas de agregación (COUNT, AVG, MAX).
  4. **Especialista en API e Integración:** Consumo con `fetch` y `async/await` de la API pública Open-Meteo (`api.js` / `src/api.ts`), manejo de los 3 estados (cargando, error con reintentar, datos), y fusión con SQLite (Patrón B).

---

## 2. DESCRIPCIÓN DEL PROYECTO
### 2.1 Problema que resuelve
Las enfermedades cardiovasculares representan la principal causa de morbilidad en adultos. Muchos pacientes hipertensos en Tarija carecen de un registro digital accesible, fácil de usar y persistente de sus tomas de presión arterial, y no cuentan con una herramienta que relacione los cambios climáticos (como caídas de temperatura o presiones ambientales) con su estado de salud vascular. Además, la gestión de consultas con especialistas y el registro de tratamientos farmacológicos suele estar disperso en papeles.

### 2.2 Usuarios objetivo
Pacientes con hipertensión arterial, hipotensión o personas en seguimiento cardiológico preventivo en Tarija y Bolivia, así como adultos mayores y sus familiares.

### 2.3 Funciones del Sistema
- **F1. Monitoreo y Tensiómetro Digital (Esencial):** Registro de presión sistólica, diastólica y pulso cardíaco, con validación estricta y categorización automática (Normal, Hipotensión, Hipertensión).
- **F2. Base de Datos SQLite Local y CRUD Completo (Esencial):** Creación, lectura, modificación y eliminación con confirmación de registros de presión mediante sentencias parametrizadas seguras (`?`). Persistencia garantizada al cerrar la app.
- **F3. Integración con API Pública de Clima Tarija (Esencial):** Conexión en vivo con la API pública Open-Meteo para obtener temperatura, humedad y presión atmosférica de Tarija, implementando los 3 estados (cargando, error con botón «Reintentar», y datos).
- **F4. Patrón de Integración API + SQLite (Esencial):** Cada toma de presión almacena y complementa la información médica con los datos meteorológicos en tiempo real (Patrón B: *Mis datos + datos externos*).
- **F5. Navegación Multi-Nivel y Envío de Parámetros (Esencial):** Uso combinado de Expo Router con Stack Navigator (`RootLayout`) y Tabs Navigator (`TabLayout`), con pantalla de detalle `detalle.tsx` que recibe parámetros completos vía `route.params` / `useLocalSearchParams`.
- **F6. Directorio Médico y Gestión de Reservas con SQLite (Esencial):** Catálogo de consultas, ecocardiogramas y especialistas con visualización dedicada de citas agendadas ("Mis Reservas"), persistidas en la tabla `reservas_citas` de SQLite con opción de cancelación.
- **F7. Sistema de Notificaciones Locales y Recordatorios:** Módulo integrado con `expo-notifications` que programa alertas en el celular tanto para el día y hora de la cita médica, como avisos para realizar actividad física / caminatas y recordar la alimentación saludable baja en sodio.
- **F8. Gestión de Medicamentos y Hábitos de Vida (Opcional/Complementaria):** Control de tomas farmacológicas diarias y seguimiento de hidratación y caminatas.

---

## 3. MAPA DE NAVEGACIÓN

```
                        ┌──────────────────────────────────┐
                        │      STACK NAVIGATOR (Raíz)      │
                        │        (src/app/_layout.tsx)     │
                        └─────────────────┬────────────────┘
                                          │
            ┌─────────────────────────────┼────────────────────────────┐
            ▼                             ▼                            ▼
   ┌─────────────────┐           ┌─────────────────┐          ┌─────────────────┐
   │    Bienvenida   │           │      Login      │          │    Registro     │
   │  (index.tsx)    │           │   (login.tsx)   │          │  (register.tsx) │
   └────────┬────────┘           └────────┬────────┘          └────────┬────────┘
            │                             │                            │
            └─────────────────────────────┼────────────────────────────┘
                                          │
                                          ▼
                        ┌──────────────────────────────────┐
                        │     BOTTOM TABS NAVIGATOR        │
                        │     (src/app/(tabs)/_layout.tsx) │
                        └─────────────────┬────────────────┘
                                          │
    ┌────────────────┬────────────────────┼───────────────────┬────────────────┐
    ▼                ▼                    ▼                   ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐    ┌──────────────┐ ┌──────────────┐
│  Tab Inicio  │ │ Tab Servicios│ │  Tab Salud   │    │ Tab Estudios │ │  Tab Perfil  │
│  (index.tsx) │ │(servicios.tsx│ │  (salud.tsx) │    │(estudios.tsx)│ │ (perfil.tsx) │
└──────────────┘ └──────────────┘ └───────┬──────┘    └──────────────┘ └──────────────┘
                                          │
                                          │ [Navega con Parámetros]
                                          ▼
                        ┌──────────────────────────────────┐
                        │     PANTALLA DE DETALLE (Stack)  │
                        │       (src/app/detalle.tsx)      │
                        │  Recibe: sistolica, diastolica,  │
                        │  pulso, fecha, hora, estado,     │
                        │  temperatura_clima, humedad      │
                        └──────────────────────────────────┘
```

---

## 4. DISEÑO DE LA BASE DE DATOS (SQLite)

La base de datos relacional se gestiona localmente en el dispositivo móvil utilizando el motor oficial `expo-sqlite` y el componente `<SQLiteProvider databaseName="heartcheck.db" onInit={initDatabase}>`.

### Tabla 1: `mediciones_presion` (Entidad Principal)
| Columna | Tipo de Dato | Clave | Restricciones / Descripción |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Identificador unívoco del registro |
| `sistolica` | INTEGER | | NOT NULL (Valor de presión sistólica en mmHg) |
| `diastolica` | INTEGER | | NOT NULL (Valor de presión diastólica en mmHg) |
| `pulso` | INTEGER | | NOT NULL (Frecuencia cardíaca en BPM) |
| `fecha` | TEXT | | NOT NULL (Ej. 'Hoy', 'Ayer', '18/11/2026') |
| `hora` | TEXT | | NOT NULL (Ej. '08:15', '19:30') |
| `origen` | TEXT | | NOT NULL DEFAULT 'manual' |
| `estado` | TEXT | | NOT NULL ('Normal', 'Hipotensión', 'Hipertensión') |
| `temperatura_clima` | REAL | | Temperatura ambiental en Tarija provista por la API |
| `humedad_clima` | REAL | | Porcentaje de humedad ambiental en Tarija provisto por la API |
| `creado_en` | TEXT | | DEFAULT (datetime('now', 'localtime')) |

### Tabla 2: `usuarios` (Autenticación y Perfil)
| Columna | Tipo de Dato | Clave | Restricciones / Descripción |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Identificador del usuario |
| `nombre` | TEXT | | NOT NULL |
| `correo` | TEXT | UNIQUE | NOT NULL (Email para login) |
| `clave` | TEXT | | NOT NULL (Contraseña de acceso) |
| `telefono` | TEXT | | Teléfono de contacto |
| `ciudad` | TEXT | | Ciudad de residencia ('Tarija, Bolivia') |
| `edad` | INTEGER | | Edad del paciente |

### Sentencias SQL Implementadas (en `datos.js` y `src/datos.ts`):
1. **Crear (INSERT):**
   ```sql
   INSERT INTO mediciones_presion 
     (sistolica, diastolica, pulso, fecha, hora, origen, estado, temperatura_clima, humedad_clima)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
   ```
2. **Consultar (SELECT):**
   ```sql
   SELECT * FROM mediciones_presion ORDER BY id DESC;
   ```
3. **Modificar (UPDATE):**
   ```sql
   UPDATE mediciones_presion
   SET sistolica = ?, diastolica = ?, pulso = ?, estado = ?
   WHERE id = ?;
   ```
4. **Eliminar (DELETE):**
   ```sql
   DELETE FROM mediciones_presion WHERE id = ?;
   ```
5. **Agregación (COUNT, AVG, MAX):**
   ```sql
   SELECT COUNT(*) as total, AVG(sistolica) as promedioSistolica, AVG(diastolica) as promedioDiastolica, MAX(sistolica) as maxSistolica FROM mediciones_presion;
   ```

---

## 5. API PÚBLICA UTILIZADA

- **Nombre:** Open-Meteo Weather Forecast API
- **Endpoint Utilizado:**
  `https://api.open-meteo.com/v1/forecast?latitude=-21.5355&longitude=-64.7296&current=temperature_2m,relative_humidity_2m,weather_code,apparent_temperature,pressure_msl&timezone=America%2FLa_Paz`
- **Características:** API pública gratuita, sin necesidad de API Key, probada en navegador y con soporte de geolocalización precisa de Tarija (-21.5355° latitud, -64.7296° longitud).
- **Fragmento de respuesta JSON recibida:**
```json
{
  "latitude": -21.546574,
  "longitude": -64.69324,
  "timezone": "America/La_Paz",
  "elevation": 1869.0,
  "current": {
    "time": "2026-11-23T03:30",
    "temperature_2m": 18.5,
    "relative_humidity_2m": 90,
    "apparent_temperature": 20.6,
    "pressure_msl": 1009.1,
    "weather_code": 3
  }
}
```
- **Datos extraídos y consumidos por HeartCheck:**
  - `temperature_2m`: Temperatura actual en °C.
  - `relative_humidity_2m`: Porcentaje de humedad ambiental.
  - `pressure_msl`: Presión atmosférica en hPa.
  - `weather_code`: Traducido a condiciones textuales (Despejado, Nublado, Lluvia, etc.).
- **Patrón de Integración Elegido (Patrón B: Mis datos + datos externos):**
  La app guarda los registros de presión en SQLite local y los complementa con el clima de Tarija obtenido de Open-Meteo. Permite correlacionar de forma médica el comportamiento de la presión ante variaciones de temperatura.
- **Manejo de los 3 estados:**
  - **Cargando:** Mensaje `⏳ Consultando Open-Meteo API...`
  - **Error:** Tarjeta de advertencia visual con botón «Reintentar» o «Reintentar Conexión» (funciona ante modo avión o corte de red).
  - **Datos:** Renderizado con temperatura, humedad y resumen ambiental.

---

## 6. CAPTURAS DE PANTALLA Y DESCRIPCIÓN

1. **Pantalla de Bienvenida (`src/app/index.tsx`):**
   - Presentación de HeartCheck con ilustración cardiovascular 3D, propuesta de valor para el paciente y accesos directos hacia Inicio de Sesión o Creación de Cuenta.
2. **Pantalla de Iniciar Sesión (`src/app/login.tsx`):**
   - Formulario de autenticación con validación de correo y contraseña, conectado a la base SQLite de usuarios y botón de acceso rápido.
3. **Pantalla de Registro (`src/app/register.tsx`):**
   - Alta de nuevos pacientes con validación de longitud de contraseña, confirmación de clave y aceptación de términos.
4. **Pantalla de Inicio / Dashboard (`src/app/(tabs)/index.tsx`):**
   - Indicador de pulso cardíaco en tiempo real (BPM) con simulación y estado de ritmo sinusal, accesos rápidos a servicios y recordatorios del día.
5. **Pantalla de Control y Salud (`src/app/(tabs)/salud.tsx`):**
   - Vista central del proyecto. Contiene:
     - Widget del clima en Tarija mediante la API pública de Open-Meteo (con los 3 estados y botón reintentar).
     - Formulario de ingreso de presión con validación médica.
     - Métricas globales calculadas con sentencias SQL (`COUNT`, `AVG`).
     - Listado completo de mediciones persistidas en SQLite con botones para **Modificar** (modal UPDATE) y **Eliminar** (DELETE con confirmación).
6. **Pantalla de Detalle de Medición (`src/app/detalle.tsx`):**
   - Recibe los parámetros enviados desde la lista (`id`, `sistolica`, `diastolica`, `pulso`, `fecha`, `clima`), despliega la ficha médica completa, el contexto ambiental registrado y sugerencias clínicas personalizadas.
7. **Pantalla de Servicios y Turnos (`src/app/(tabs)/servicios.tsx`):**
   - Catálogo clasificado de atención cardiológica con buscador en tiempo real y modal de reserva de citas.
8. **Pantalla de Estudios y Directorio (`src/app/(tabs)/estudios.tsx`):**
   - Permite adjuntar fotos de electrocardiogramas o análisis desde la cámara o galería, y consultar la lista de centros médicos y hospitales de Tarija.
9. **Pantalla de Perfil y Emergencias (`src/app/(tabs)/perfil.tsx`):**
   - Fichas educativas de alarma cardiovascular, configuración de alertas y botón de discado directo a emergencias médicas (160).

---

## 7. CONCLUSIONES, APRENDIZAJES Y MEJORAS FUTURAS

### 7.1 Lo aprendido
- Arquitectura robusta de aplicaciones móviles con **React Native** y **Expo Router**, separando la capa de presentación de la lógica de datos y servicios.
- Implementación de bases de datos locales con **SQLite** (`expo-sqlite`), asegurando la integridad de datos mediante consultas parametrizadas (`?`) para evitar inyecciones y fallos de sintaxis.
- Manejo asíncrono y tolerante a fallos del consumo de APIs públicas externas mediante `fetch`, controlando de forma explícita los estados de carga, error y éxito ante escenarios sin conexión a internet (modo avión).
- Pasaje fluido de parámetros entre pantallas mediante navegación combinada de Tabs y Stack.

### 7.2 Dificultades superadas
- **Persistencia y ciclo de vida:** Garantizar que los registros agregados desde el formulario se almacenen inmediatamente en el almacenamiento SQLite del dispositivo y persistan tras el reinicio total de Expo Go.
- **Manejo de errores de red:** Probar la app en modo avión y proporcionar un mecanismo de recuperación elegante (botón *Reintentar*) sin bloqueos de interfaz ni excepciones no controladas.
- **Tipado estricto:** Sincronización de los tipos de rutas en Expo Router con TypeScript para la nueva pantalla de detalle parametrizada.

### 7.3 Mejoras posibles para futuras versiones
- Sincronización en la nube (Cloud Sync) para respaldo médico de la base SQLite en Firebase o Supabase.
- Exportación del historial de presión arterial a reportes en formato PDF listos para imprimir o enviar al cardiólogo por WhatsApp.
- Conexión vía Bluetooth Low Energy (BLE) con tensiómetros digitales de muñeca o brazo para captura automática de lecturas.

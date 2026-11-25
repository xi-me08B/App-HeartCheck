# Actividad 04 — Informe de revisión de calidad, limpieza y documentación

## Proyecto HeartCheck — Grupo 3

| Campo | Detalle |
|---|---|
| **Asignatura** | Aplicaciones Móviles I (SIS-0180) · Octavo Semestre · Ingeniería de Sistemas, UPDS Sede Tarija |
| **Docente** | Ing. Juan Carlos Huanto Villca |
| **Grupo** | Grupo 3 — Proyecto **HeartCheck** |
| **Integrantes** | María del Rosario Cadena (Coordinación e integradora) · Ximena Calcina Bartolomé (Interfaz y navegación) · María del Carmen Rivera (Base de datos SQLite/CRUD) · Fernando Castillo (API e integración) |
| **Actividad** | Actividad 04 · Jornada 1 — Revisión de validaciones, textos, limpieza de código y documentación |
| **Fecha de emisión** | 25 de noviembre de 2026 |
| **Repositorio** | `https://github.com/xi-me08B/App-HeartCheck` |
| **Rama de publicación** | `informe-actividad-04` (creada desde `main`, sin sobrescribir historia) |

> **Nota de alcance.** Este informe se elaboró sobre el workspace local revisado, que contiene la versión más reciente de HeartCheck. El repositorio remoto usa la rama `main` y su historia difiere del workspace local; por eso el informe se publica en una rama separada y no se hizo force push ni reemplazo de `main`.

---

## Resumen ejecutivo

HeartCheck es una app móvil Expo/React Native de autocuidado cardiovascular con autenticación, perfiles adaptados (adulto, adulto mayor, cuidador y niño), seguimiento de presión arterial, medicamentos, hábitos, mapa de establecimientos, biblioteca de salud, estudios clínicos, notificaciones y sincronización opcional con Supabase.

La revisión confirma que existe una base técnica sólida: **Expo Router**, **SQLite parametrizado**, **i18n tipado con 73 idiomas/variantes**, **tokens de tema WCAG**, **RLS en Supabase** y APIs públicas reales. Sin embargo, la capa de UI no terminó de adoptar esa infraestructura: hay validaciones incorrectas, mensajes y títulos en español duro, textos mixtos al cambiar de idioma, colores fijos que rompen el tema y código de plantilla sin uso.

No se encontraron secretos privados versionados. `.env` está ignorado y no está trackeado; la clave pública de Supabase y el `projectId` de EAS son identificadores públicos por diseño.

---

## 1. Descripción del proyecto

- **Stack:** Expo SDK 58, React 19.3, React Native 0.88.1, Expo Router 58, TypeScript estricto.
- **Arquitectura:**
  - `src/app/`: pantallas y navegación por archivos.
  - `src/components/`: componentes reutilizables y experiencias adaptativas.
  - `src/context/`: estado global de usuario (`HeartCheckContext`) y personalización (`CustomizationContext`).
  - `src/services/`: SQLite, Supabase, OAuth, mapas, notificaciones, audio, PPG, i18n y APIs.
  - `supabase/migrations/`: esquema remoto, RLS, invitaciones, seguridad parental y storage.
- **Identidad visual:** coral `#FA6B61`, crema `#FAF4EE`, blanco, texto `#292421`, estados `success/warning/danger/info` y estilos de tarjeta con bordes suaves (`src/constants/theme.ts:3-55`).
- **Persistencia:** `heartcheck.db` con `expo-sqlite` y respaldo multiplataforma en SecureStore/localStorage (`src/services/sqliteProvider.tsx:14`, `:67-79`).
- **Experiencias:** adulto, adulto mayor ("Easy"), cuidador ("Care") e infantil ("Kids"), con ocultación condicional de pestañas (`src/app/(tabs)/_layout.tsx:63-107`).

---

## 2. Mapa de navegación

### 2.1 Flujo principal

```mermaid
flowchart TD
    A[src/app/index.tsx<br/>Portada] --> B[login.tsx]
    A --> C[register.tsx]
    C --> D[bienvenida.tsx<br/>Intención de uso]
    B --> E[auth/callback.tsx<br/>OAuth / confirmación / recuperación]
    D --> F[Root Stack]
    E --> F

    F --> G[(tabs)/index.tsx<br/>Inicio)]
    F --> H[(tabs)/servicios.tsx<br/>Servicios)]
    F --> I[(tabs)/mapa.tsx<br/>Mapa)]
    F --> J[(tabs)/salud.tsx<br/>Salud)]
    F --> K[(tabs)/estudios.tsx<br/>Estudios)]
    F --> L[(tabs)/perfil.tsx<br/>Perfil)]

    J --> M[medicion-detalle.tsx]
    J --> N[kids/emociones.tsx]
    J --> O[kids/misiones.tsx]
    J --> P[kids/juegos.tsx]

    L --> Q[editar-perfil.tsx]
    L --> R[cambiar-correo.tsx]
    L --> S[personalizacion.tsx]
    L --> T[accesibilidad.tsx]
    L --> U[cuidadores.tsx]
    L --> V[legal.tsx]
    L --> W[biblioteca.tsx]
    L --> X[kids/insignias.tsx]

    H --> Y[medicamento/[id].tsx]
    H --> Z[musica.tsx]
```

### 2.2 Rutas y comportamiento

| Grupo | Rutas | Observaciones |
|---|---|---|
| Stack raíz | `index`, `login`, `register`, `auth/callback`, `(tabs)`, `medicion-detalle`, `personalizacion` | Declaradas en `src/app/_layout.tsx:36-49`. Providers: SQLite, Customization y HeartCheck. |
| Tabs | `index`, `servicios`, `mapa`, `salud`, `estudios`, `perfil` | `servicios` se oculta en Kids; `estudios` se oculta en Easy (`src/app/(tabs)/_layout.tsx:63-107`). |
| Flujos secundarios | `bienvenida`, `editar-perfil`, `cambiar-correo`, `accesibilidad`, `cuidadores`, `legal`, `biblioteca`, `musica`, `kids/*`, `medicamento/[id]` | Navegación mediante `router.push/replace` y `safeGoBack` (`src/services/navigationHelpers.ts:8-13`). |
| Enlaces externos | `Linking.openURL('tel:...')`, `Linking.openSettings()` | Usados en `mapa.tsx` y `src/components/external-link.tsx`. |

---

## 3. Diseño de tablas

### 3.1 Base local SQLite

Base: `heartcheck.db`. El mapa de tablas está definido en `src/services/sqliteProvider.tsx:16-65`.

| Tabla | Uso principal |
|---|---|
| `perfil` | Perfiles de usuario, correo, clave_acceso, datos personales y rol. |
| `tipo_medicion` | Catálogo de tipos de medición (presión arterial, pulso, etc.). |
| `registro_medicion` | Historial clínico: valor_principal, valor_secundario, pulso, fecha_hora, observacion. |
| `recordatorio` | Recordatorios de medicamentos/citas. |
| `cache_ambiental` | Caché de datos de clima/calidad del aire. |
| `cita_medica` | Citas programadas. |
| `estudio_medico` | Archivos clínicos y su título. |
| `proveedor_identidad` | Proveedores OAuth vinculados. |
| `cuenta_proveedor` | Cuentas externas por proveedor. |
| `sesion` | Sesión activa y cambios de cuenta. |
| `sync_outbox` | Cola de operaciones pendientes de sincronización. |
| `sync_conflict` | Conflictos de sincronización. |
| `evento_auditoria` | Trazabilidad de cambios. |
| `preferencia_visual` | Tema, idioma, contraste y personalización. |
| `progreso_infantil` | Insignias, misiones y recompensas Kids. |
| `delegacion_perfil` | Relaciones cuidador-paciente. |
| `favorito_establecimiento` | Sitios guardados en el mapa. |
| `cache_mapa_establecimiento` | Caché de resultados geográficos. |
| `ruta_guardada` | Rutas calculadas con OSRM. |
| `habito_objetivo` | Objetivos de agua, actividad, sueño y emociones. |
| `habito_registro` | Registros diarios de hábitos. |
| `habito_rutina` | Rutinas programadas. |

Todas las operaciones CRUD usan marcadores `?` en lugar de concatenar SQL (`src/services/datos.ts`), y las escrituras remotas se encolan en `sync_outbox` (`src/services/supabaseSync.ts`).

### 3.2 Base remota Supabase

| Migración | Aporte |
|---|---|
| `20261120000100_heartcheck_schema_rls.sql` | 8 tablas base, función `usuario_tiene_acceso_perfil`, RLS y políticas por propietario/cuidador. |
| `20261122000200_caregiver_invitations.sql` | Tabla `invitacion_delegacion` y políticas de delegación. |
| `20261122000300_parental_security.sql` | Códigos de vinculación infantil con hash, expiración e intentos. |
| `20261123000400_complete_schema_habits_rewards_storage.sql` | Columna `version`, hábitos, recompensas, bucket privado `heartcheck-estudios` y RLS de Storage. |
| `20261123000500_profile_avatar_sync_and_rls_hardening.sql` | Avatar remoto, versión de preferencias y restricción de `pulso_origen` a `manual`, `ppg_camara` o `no_medido`. |

---

## 4. API usada

| API / servicio | Archivo | Uso en HeartCheck |
|---|---|---|
| Open-Meteo Aire y Clima | `src/services/api.ts:120-121` | Calidad del aire y clima; se guarda en `cache_ambiental`. |
| RxNorm | `src/services/api.ts:309`, `:339` | Búsqueda de medicamentos por nombre. |
| OpenFDA | `src/services/api.ts:389` | Etiquetas y datos de seguridad de medicamentos. |
| DailyMed | `src/services/api.ts:419`, `:425`, `:435` | Información de etiquetas clínicas. |
| MedlinePlus | `src/services/api.ts:457`, `:465`, `:479`, `:542` | Biblioteca de salud. |
| Jamendo | `src/services/api.ts:616` | Catálogo opcional de música; requiere `EXPO_PUBLIC_JAMENDO_CLIENT_ID`. |
| Overpass API | `src/services/mapService.ts:221`, `:691` | Establecimientos de salud por capas OSM. |
| Nominatim | `src/services/mapService.ts:794`, `:951` | Geocodificación inversa y búsqueda por ciudad. |
| OSRM | `src/services/mapService.ts:996` | Cálculo de rutas. |
| Supabase Auth/DB/Storage | `src/services/supabaseClient.ts`, `supabaseSync.ts` | Login social, sincronización, RLS y archivos privados. |
| Apple / Google / Facebook / X / GitHub / Discord OAuth | `src/services/socialAuth.ts` | Autenticación social con validación de redirect URI. |

Todas las llamadas externas tienen `timeout`, validación `response.ok`, manejo `try/catch/finally` y, cuando aplica, caché local. El proxy opcional se configura con `EXPO_PUBLIC_API_PROXY_URL`.

---

## 5. Revisión solicitada

### 5.1 Validaciones y mensajes, textos en español y detalles visuales

#### A. Validaciones y mensajes

| Severidad | Hallazgo | Evidencia | Recomendación |
|---|---|---|---|
| Crítica | La validación de edad es inalcanzable para `NaN` y negativos: `NaN > 0` es `false`, por lo que se guarda sin error. | `src/app/editar-perfil.tsx:148-150` | Validar `Number.isNaN` y rango `1-125` antes de comparar con `> 0`. |
| Crítica | Un pulso vacío se convierte silenciosamente en `72 lpm`, generando un dato clínico inventado; en `medicion-detalle` sí es obligatorio. | `src/app/(tabs)/salud.tsx:147`; `src/app/medicion-detalle.tsx:74` | No usar valores por defecto clínicos; marcar como "no registrado" o exigir el campo. |
| Crítica | Política de contraseña divergente: registro no exige mínimo, recuperación exige 6 caracteres. | `src/app/register.tsx:48-81`; `src/app/auth/callback.tsx:116-119` | Centralizar una sola regla de longitud/calidad. |
| Alta | Login y registro solo comprueban que el correo no esté vacío; `cambiar-correo` sí valida formato. | `src/app/login.tsx:68-78`; `src/app/register.tsx:48-58`; `src/app/cambiar-correo.tsx:92-95` | Reutilizar la misma regex en todos los formularios. |
| Alta | Casi ningún `showDialog`/`setErrorMsg` pasa por `t()`/`tx()`: al cambiar idioma, etiquetas y errores quedan en español. | `login.tsx:50-118`, `register.tsx:50-123`, `cambiar-correo.tsx:52-160`, `editar-perfil.tsx:90-150`, `(tabs)/salud.tsx:150-336`, `medicion-detalle.tsx:74-129` | Crear dominios `validation.*` y `dialog.*` en `keys.ts`/`dictionaries.ts` y migrar los literales. |
| Alta | El modal global mezcla textos traducidos con títulos fijos. | `src/components/InteractiveModal.tsx:55,64,73,82,91,146,251,264` | Traducir también `badgeText`. |
| Alta | Clasificación clínica duplicada y no traducida pese a existir claves `health.bp.*`. | `(tabs)/salud.tsx:127-131`; `medicion-detalle.tsx:62-64`; `dictionaries.ts:264-267` | Usar `t('health.bp.high/low/normal')`. |
| Media | Mensajes técnicos al usuario final, por ejemplo configuración de Supabase y estados sin i18n. | `cambiar-correo.tsx:53`; `auth/callback.tsx:127` | Mostrar mensajes de dominio y registrar el detalle técnico solo en logs. |

#### B. Textos en español e internacionalización

| Severidad | Hallazgo | Evidencia | Recomendación |
|---|---|---|---|
| Alta | `bienvenida.tsx` no consume `t`; elegir inglés/portugués no cambia el onboarding. | `src/app/bienvenida.tsx:39-64,73,132-362` | Migrar toda la pantalla a `t`/`tx`. |
| Alta | Tres de seis pestañas siguen en español cuando cambia el idioma. | `(tabs)/_layout.tsx:63` (`Citas`), `:78` (`Asistencia`), `:92` (`Pacientes`) | Usar claves i18n también en los modos Care/Easy. |
| Alta | Modos Kids/Easy/Care y subtabs tienen encabezados hardcoded. | `(tabs)/salud.tsx:373-388,399-458,475-478`; `(tabs)/index.tsx:205-321` | Centralizar copys en el catálogo. |
| Alta | La voz siempre habla en `es-ES` aunque la app esté en otro idioma. | `(tabs)/salud.tsx:509-511`; `(tabs)/servicios.tsx:137` | Tomar `activeConfig.language` y pasarlo a `Speech.speak`. |
| Media | Se exponen identificadores internos al usuario (`ADULTO_MAYOR`, `NINO`, `mi_salud_y_cuidado`). | `bienvenida.tsx:250,261-263,328`; `register.tsx:107` | Mostrar etiquetas legibles y traducidas. |
| Media | Terminología duplicada con textos distintos para las mismas tarjetas de intención. | `bienvenida.tsx:39-64` vs `register.tsx:286-289` | Unificar una sola fuente de copys. |
| Media | Cifras del catálogo contradictorias: 72 / 64 / 73 idiomas. | `dictionaries.ts:155,508,861`; `catalog.ts:117`; conteo real `catalog.ts:119-1304` | Unificar a **73** entradas o recalcular automáticamente. |
| Media | Etiquetas de accesibilidad en español duro y nombres de API (`accessibilityLabel`) visibles al usuario. | `(tabs)/index.tsx:136`; `(tabs)/mapa.tsx:517,614,704`; `accesibilidad.tsx:694-701` | Traducir etiquetas y evitar nombres técnicos en la UI. |
| Baja | Exclamaciones sin cerrar y punto final inconsistente en el diccionario. | `dictionaries.ts:73-75,360`; `(tabs)/index.tsx:116` | Revisar puntuación y consistencia. |

#### C. Detalles visuales

| Severidad | Hallazgo | Evidencia | Recomendación |
|---|---|---|---|
| Alta | Colores hex fijos rompen tema oscuro y alto contraste. | `login.tsx:381-564`; `(tabs)/salud.tsx:395-458`; `medicion-detalle.tsx:373-538` | Sustituir por `tokens.colors` y `ensureReadableTextOnBackground`. |
| Alta | Configuración de tema contradictoria: `userInterfaceStyle: light` frente a `StatusBar` dinámico y `Colors.dark`. | `app.json:9`; `src/app/_layout.tsx:24`; `theme.ts:65-71` | Alinear app.json con el tema dinámico. |
| Alta | Área táctil del modal queda por debajo de lo anunciado (≈37 px vs 44 px). | `InteractiveModal.tsx:151-152`; `dictionaries.ts:303` | Usar `minTouchSize` sin factor reductor. |
| Media | Gradientes, splash e ícono adaptativo usan colores distintos a la paleta formal. | `WaveHeader.tsx:19-26`; `app.json:35,58`; `theme.ts:6` | Unificar con `#FA6B61` / `#FAF4EE`. |
| Media | `Fonts.sans = 'normal'` en Android se usa como `fontFamily`; RN espera `'sans-serif'`. | `theme.ts:76-88`; `themed-text.tsx:29,35,41` | Corregir el valor por plataforma. |
| Media | La escala `Spacing` solo la usan componentes plantilla; producción usa números arbitrarios. | `theme.ts:97-105`; `hint-row.tsx:31-33`, `collapsible.tsx:53-63` | Adoptar `Spacing` en pantallas reales. |
| Media | Emojis usados como texto de UI pueden leerse en voz alta o variar por plataforma. | `dictionaries.ts:184-199`; `(tabs)/index.tsx:116,517`; `(tabs)/salud.tsx:716` | Usar íconos vectoriales o `accessible={false}`. |
| Baja | Assets de iconos de tab y heart_center/heart_cropped están presentes pero no referenciados; los tabs usan `@expo/vector-icons`. | `assets/images/tabIcons/*`; `(tabs)/_layout.tsx:50-109` | Documentar o eliminar assets huérfanos. |

**Aspectos positivos que conviene conservar:** catálogo i18n con 73 entradas BCP 47, RTL y tipografía por script; tokens WCAG en `CustomizationContext`; `InteractiveModal` con `accessibilityViewIsModal`, `accessibilityRole="alert"` y live region; iconos de tabs coherentes por estado enfocado/no enfocado.

### 5.2 Limpieza de código

| Estado | Hallazgo | Evidencia | Acción recomendada |
|---|---|---|---|
| Seguro | No hay secretos privados versionados. `.env` está ignorado y no trackeado; `.env.example` está vacío. | `.gitignore:18`; `git check-ignore .env` | Mantener. La publishable key de Supabase y el EAS `projectId` son públicos por diseño. |
| Mejora | `.env.example` no documenta variables usadas por el código. | `.env.example:9-38` vs `api.ts:412,451,602`, `socialAuth.ts:61`, `SocialButtons.tsx:40` | Agregar `EXPO_PUBLIC_API_PROXY_URL`, `EXPO_PUBLIC_JAMENDO_CLIENT_ID`, `EXPO_PUBLIC_WEB_DOMAIN`, `EXPO_PUBLIC_FACEBOOK_ENABLED`. |
| Mejora | `.gitignore` cubre `.env` pero no variantes como `.env.preview` o `.env.staging`. | `.gitignore:18-22`; `eas.json:16` | Ignorar `.env.*` con excepción de `.env.example`. |
| Mejora | Configuración Supabase duplicada con orden de fallback distinto. | `supabaseClient.ts:50-66`; `supabaseSync.ts:37-53` | Unificar en una sola función. |
| Pendiente | Placeholders legales visibles y una prueba que los exige. | `legalDocuments.ts:25,27,33,34,98,130,131`; `uiPhrases.ts:221,227,239,245,469,475`; `test-validation-phase9.js:1695` | Completar textos antes de publicar y actualizar la prueba. |
| Mejora | Compatibilidad legacy que acepta contraseña en texto plano. | `src/services/datos.ts:20-33` | Migrar filas antiguas a hash y eliminar el fallback. |
| Mejora | Intérprete SQL casero duplicado entre app y script de prueba. | `sqliteProvider.tsx:102-524`; `test-validation-phase9.js:15-235` | Extraer a un módulo compartido o simplificar. |
| Mejora | Imports sin uso y default `React` innecesario con `jsx: react-jsx`. | `perfil.tsx:2,19,23`; `salud.tsx:14`; `HabitsDashboard.tsx:14`; `MedicationExperience.tsx:23`; `WellnessModules.tsx:2`; `CustomizationContext.tsx:14`; 50+ archivos en `src/app`/`src/components` línea 1 | Aplicar lint y quitar imports. |
| Mejora | Componentes de plantilla Expo sin usos reales. | `hint-row.tsx`, `web-badge.tsx`, `ui/collapsible.tsx`, `external-link.tsx`, `animated-icon.tsx`, `animated-icon.web.tsx`, `themed-text.tsx`, `themed-view.tsx`, hooks de tema | Eliminar o mover a `example/`. |
| Mejora | Bloques inalcanzables con formularios y textos duplicados. | `(tabs)/salud.tsx:536-759` y `:773` | Eliminar `{false && ...}`. |
| Mejora | `console.warn` disperso en contexto/servicios/pantallas. | `HeartCheckContext.tsx:565,736,751,857,1022,1069,1089`; `sqliteProvider.tsx:82,98,579`; `supabaseSync.ts:152,316`; entre otros | Centralizar en logger o retirar en producción. |
| Mejora | Supresiones de tipos/lint que pueden ocultar effects incompletos. | `wellnessAudio.ts:375`; `CameraCaptureModal.tsx:85,163`; `HeartCheckMapCanvas.tsx:706`; `MedicationExperience.tsx:136`; `MusicRelaxationPlayer.tsx:135` | Revisar dependencias y conservar solo las justificadas. |
| Mejora | Archivos raíz `api.js`/`datos.js` son re-exports usados solo por pruebas. | `api.js:1-3`; `datos.js:1-3`; `test-validation-phase9.js:246-247` | Documentar como fachada académica o eliminar. |

**Conclusión de la revisión:** no hay código comentado en bloques grandes que parezca muerto; los comentarios existentes son descriptivos. No hay `TODO`, `FIXME`, `HACK` ni `XXX` literales. La deuda principal es de consistencia (i18n, tema y duplicación), no de secretos expuestos.

---

## 6. Capturas y explicación breve

Al momento de redactar no había imágenes en `assets/capturas/`. Se reservan los siguientes espacios; al incorporar los archivos, cada imagen debe reemplazar su fila de "Pendiente" en esta sección.

| N.º | Archivo esperado | Pantalla | Explicación breve | Estado |
|---|---|---|---|---|
| 1 | `assets/capturas/01-onboarding.png` | `bienvenida.tsx` | Muestra las cuatro intenciones de uso y el selector de idioma; evidencia el hallazgo de onboarding hardcoded. | Pendiente |
| 2 | `assets/capturas/02-login-registro.png` | `login.tsx` / `register.tsx` | Muestra autenticación y mensajes de validación; evidencia correo sin formato y diálogos en español. | Pendiente |
| 3 | `assets/capturas/03-home-tabs.png` | `(tabs)/index.tsx` + `_layout.tsx` | Muestra las seis pestañas y el estado adaptativo del perfil activo. | Pendiente |
| 4 | `assets/capturas/04-salud-mediciones.png` | `(tabs)/salud.tsx` / `medicion-detalle.tsx` | Muestra formulario, historial y clasificación de presión arterial. | Pendiente |
| 5 | `assets/capturas/05-mapa.png` | `(tabs)/mapa.tsx` | Muestra búsqueda, permisos, capas y acciones de llamada; evidencia etiquetas hardcoded. | Pendiente |
| 6 | `assets/capturas/06-personalizacion-accesibilidad.png` | `personalizacion.tsx` / `accesibilidad.tsx` | Muestra temas, contraste WCAG, idioma, RTL y tamaños táctiles. | Pendiente |
| 7 | `assets/capturas/07-kids.png` | `kids/*` | Muestra personajes, misiones, insignias y juegos; evidencia textos y encabezados Kids en español. | Pendiente |
| 8 | `assets/capturas/08-perfil-legal.png` | `perfil.tsx` / `legal.tsx` | Muestra opciones de cuenta y documentos legales; evidencia los placeholders pendientes. | Pendiente |

---

## 7. Recomendaciones priorizadas

### P1 — Corregir antes de publicar
1. Arreglar validación de edad, pulso y políticas de contraseña/correo.
2. Migrar diálogos, errores, onboarding y pestañas a `t()`/`tx()`.
3. Pasar el idioma activo a `Speech.speak`.
4. Mantener secretos fuera del repo y completar `.env.example`/`.gitignore`.
5. Completar documentos legales y actualizar la prueba que exige el placeholder.

### P2 — Consistencia de diseño
1. Sustituir hex fijos por tokens de tema.
2. Alinear `app.json` con tema dinámico.
3. Unificar copys duplicados y cifras del catálogo (72/64/73 → 73).
4. Corregir puntuación y evitar enums técnicos en UI.
5. Adoptar `Spacing` y fuentes por plataforma.

### P3 — Limpieza y mantenimiento
1. Eliminar bloques `{false && ...}` y componentes plantilla sin uso.
2. Quitar imports innecesarios y revisar supresiones de lint.
3. Centralizar `console.warn` en un logger.
4. Unificar lectura de configuración Supabase y extraer el intérprete SQL compartido.

---

## 8. Metodología y verificaciones

- Revisión estática de 153 archivos versionados, 102 archivos `.ts/.tsx` y 28 rutas de Expo Router.
- Búsquedas por validaciones, `Alert`, `showDialog`, `t()`/`tx()`, `accessibilityLabel`, `Speech.speak`, `{false && ...}`, `console.*`, secretos y placeholders.
- Revisión de `app.json`, `eas.json`, `tsconfig.json`, `package.json`, `.env.example`, `.gitignore` y migraciones SQL.
- `npx tsc --noEmit`: **sin errores**.
- `npx expo lint`: **147 problemas (85 errores, 62 advertencias)** en código preexistente, principalmente `react-hooks/refs`, `react-hooks/set-state-in-effect`, hooks condicionales, imports sin uso y `AndroidImportance` no resuelto en `notificationsService.ts`. No se corrigieron porque el alcance acordado fue solo el informe; estos resultados refuerzan los hallazgos del punto 2.
- No se ejecutaron `reset-project`, build ni scripts destructivos.
- No se modificó código fuente durante la auditoría; este documento es el único entregable nuevo.
- Verificación de publicación: commit limitado al informe y capturas; rama `informe-actividad-04` creada desde `origin/main`; sin force push.

### Limitaciones
- No se inició Expo ni se probó el cambio de idioma en dispositivo/emulador.
- No se verificó render real en modo oscuro/alto contraste ni lectores de pantalla.
- No se validaron respuestas remotas de Supabase/OAuth.
- El repo remoto `main` difiere del workspace local; por eso la numeración de líneas corresponde al código local auditado.

---

## 9. Cierre

El proyecto tiene una base funcional y bien estructurada para una app de salud. Las acciones de mayor valor no son nuevas funcionalidades, sino **consistencia**: unificar mensajes e idioma, respetar el sistema de temas, corregir cuatro validaciones concretas y retirar el código heredado que ya no aporta. Con esos ajustes, HeartCheck quedaría más coherente, accesible y seguro para publicación.

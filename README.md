# Kinami

Home swapping en círculos privados de confianza ("ruedas"). MVP construido
con Next.js (App Router) y Supabase (auth, base de datos Postgres, storage).

Funciona ya: login por email (magic link), crear/unirse a una "rueda" por
código de invitación, añadir tu casa con fotos, marcar disponibilidad,
pedir un intercambio y chatear sobre la solicitud.

> **Estado de este proyecto:** ya existe el proyecto de Supabase (`kinami`,
> región elegida al crearlo) y ya se compró un dominio propio. Lo que queda
> es: confirmar que el paso 3 de abajo (ejecutar `schema.sql`) está hecho, y
> desplegar en Vercel (pasos 3 y 4 más abajo).

## 1. Crear el proyecto en Supabase

1. Entra en [supabase.com](https://supabase.com) y crea una cuenta (gratis).
2. **New project** → elige nombre, contraseña de base de datos y región (elige
   la más cercana a donde esperas tener más usuarios, ej. `eu-west` para
   España).
3. Cuando el proyecto termine de aprovisionarse (1-2 minutos), ve a
   **SQL Editor** → **New query**, pega todo el contenido de
   [`supabase/schema.sql`](./supabase/schema.sql) de este repo, y dale a
   **Run**. Esto crea todas las tablas, las políticas de seguridad (RLS) y el
   bucket de almacenamiento para fotos.
4. Ve a **Authentication → Providers → Email** y confirma que el login por
   email (magic link / OTP) está activado (lo está por defecto). Si no
   quieres usar el dominio de prueba de Supabase para los emails de acceso
   en producción, en **Authentication → URL Configuration** añade la URL de
   tu dominio final en "Site URL" y "Redirect URLs" (ver paso 4 de
   despliegue, más abajo).
5. Ve a **Project Settings → API**. Ahí tienes los dos valores que necesitas
   para el siguiente paso: **Project URL** y la clave **anon public**.

## 2. Ejecutar en local

```bash
cp .env.local.example .env.local
# pega tu Project URL y anon key en .env.local

npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## 3. Desplegar en Vercel

1. Sube este proyecto a un repositorio de GitHub (puedes usar `git init`,
   `git add .`, `git commit`, y crear un repo nuevo en GitHub y hacer push —
   o usar GitHub Desktop si prefieres no usar la terminal).
2. Entra en [vercel.com](https://vercel.com), conecta tu cuenta de GitHub, y
   dale a **Add New → Project**, eligiendo el repo que acabas de subir.
3. En **Environment Variables**, añade:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   (los mismos valores de tu `.env.local`).
4. Dale a **Deploy**. En 1-2 minutos tendrás una URL tipo
   `rueda-tuusuario.vercel.app` funcionando de verdad.
5. Vuelve a Supabase → **Authentication → URL Configuration** y añade esa URL
   de Vercel (y luego tu dominio propio, si lo conectas) en "Site URL" y
   "Redirect URLs", para que los enlaces mágicos de login funcionen en
   producción.

Cada vez que hagas `git push`, Vercel vuelve a desplegar automáticamente.

## 4. Dominio propio (opcional)

1. Compra un dominio (ej. `ruedaapp.com`) en Namecheap, Google Domains, o
   similar (~12-20€/año).
2. En Vercel, entra al proyecto → **Settings → Domains** → añade tu dominio.
   Vercel te da uno o dos registros DNS para configurar en tu proveedor de
   dominio (normalmente un registro A y/o CNAME).
3. Actualiza otra vez la Site URL / Redirect URLs en Supabase con el dominio
   final.

## Coste estimado

Con el plan gratuito de Vercel y el plan gratuito de Supabase, tener Kinami en
producción para un círculo piloto pequeño cuesta **0€/mes**, aparte del
dominio. Supabase gratis incluye hasta 500MB de base de datos y 1GB de
almacenamiento de archivos, de sobra para empezar.

## Diseño y accesibilidad

La interfaz sigue **WCAG 2.1 nivel AA** — el estándar que exige la normativa
europea de accesibilidad (EN 301 549 / European Accessibility Act, en vigor
desde junio de 2025). Esto no es una capa añadida al final: es el sistema de
diseño de base.

- **Contraste verificado, no estimado a ojo.** Toda la paleta (texto, marca,
  estados, bordes) está comprobada contra los umbrales de WCAG con
  `npm run check:contrast` (script en `scripts/check-color-contrast.mjs`,
  sin dependencias). Además se auditó con **axe-core** sobre las páginas
  públicas: 0 incidencias.
- **Cada campo tiene una etiqueta real** (`<label>` asociado, no solo
  `placeholder`), con pistas y errores enlazados por `aria-describedby` y
  anunciados con `role="alert"` / `aria-live`.
- **Foco de teclado siempre visible**, con un halo de doble anillo pensado
  para mantener suficiente contraste sobre cualquier fondo, incluidos los
  botones de color de marca.
- **El estado nunca depende solo del color**: cada estado de una solicitud
  (pendiente/aceptada/rechazada/cancelada) lleva también un icono de forma
  distinta y una etiqueta de texto.
- Enlace "saltar al contenido", landmarks (`header`, `nav`, `main`,
  `section` con encabezados asociados), texto de página distinto por
  ruta (`<title>`), tamaños de toque ≥44px en los controles principales, y
  `prefers-reduced-motion` respetado.
- Errores de formulario en español, identificando el problema y cómo
  solucionarlo (código de invitación incorrecto, fechas inválidas...) en
  vez de un mensaje técnico o una pantalla de error genérica.
- Tipografía autoalojada (Fraunces + Public Sans vía `@fontsource`): no
  depende de que el navegador pueda llegar a Google Fonts.

Antes de cambiar colores o tipografía, ejecuta `npm run check:contrast` para
comprobar que los nuevos valores siguen cumpliendo AA.

## Qué falta para ir más allá del MVP

Este scaffold cubre el flujo esencial. Cosas que quedan fuera a propósito,
para no bloquear el lanzamiento del piloto:

- Intercambios en cadena (A → B → C → A). Ahora mismo el modelo es 1:1 entre
  el solicitante y el dueño de una casa.
- Sistema de valoraciones/reputación tras un intercambio.
- Verificación de identidad o teléfono al unirse a una rueda.
- Notificaciones por email cuando alguien pide un intercambio o escribe un
  mensaje (Supabase tiene "Database Webhooks" + un servicio como Resend para
  esto cuando llegue el momento).
- Pagos o seguros — deliberadamente fuera de un MVP de validación.

## Estructura del proyecto

```
src/app/(app)/circles         → listar, crear y unirte a ruedas
src/app/(app)/circles/[id]    → detalle de una rueda: miembros y casas
src/app/(app)/homes/[id]      → detalle de una casa: disponibilidad, pedir swap
src/app/(app)/requests        → solicitudes de intercambio (enviadas/recibidas)
src/app/(app)/account         → perfil, avatar, sesión y borrado de cuenta
src/lib/actions.ts            → todas las mutaciones (Server Actions)
src/lib/supabase/             → clientes de Supabase (browser, server, middleware)
supabase/schema.sql           → todo el esquema de base de datos + seguridad (RLS)
supabase/migrations/          → migraciones posteriores (002…007); ejecutar en SQL Editor
```

### Migraciones posteriores a `schema.sql`

Si el proyecto ya tenía el schema inicial, ejecuta en orden en el SQL Editor:

1. `002_borrar_cuenta.sql`
2. `003_acuerdo_intercambio.sql`
3. `004_guia_casa.sql`
4. `005_contrato_firma.sql`
5. `006_profile_avatars.sql` — bucket `avatars` + políticas; **necesario antes de subir fotos de perfil**
6. `007_demo_tour_signatures.sql` — rueda de ejemplo, tour, firmas dibujadas; **necesario para onboarding y firmar contratos**
7. `008_demo_photos_invite_lock.sql` — fotos de las casas de ejemplo + bloqueo del código KINAMIEX

Instalaciones nuevas: basta con `schema.sql` (ya incluye el bucket de avatares) y luego `002`–`008` en orden.


## Rediseño de experiencia (octubre 2026)

- `/circles`: grupos de personas, con miembros, casas y destinos visibles en tarjetas amplias.
- `/circles/[id]`: abre por Personas, con las casas compartidas debajo de cada miembro; Casas permite buscar destinos; Mis casas permite compartir o retirar propiedades existentes.
- `/homes`: biblioteca de casas propias. Cada casa tiene una ficha única y puede compartirse en cero, uno o varios círculos. Crear una casa no la publica automáticamente.
- `/homes/[id]`: información, fotos, disponibilidad y gestión de los círculos donde se comparte.
- `/explore`: búsqueda agregada entre casas de los círculos.

Se conserva la paleta, los iconos y la identidad. No requiere migración: utiliza `homes.owner_id` y `home_circles`. Retirar una casa solo elimina la asociación. Las acciones comprueban propietario y pertenencia al círculo, manteniendo RLS. Una persona puede retirar una asociación anterior aunque haya salido del círculo.

Validación: `npm run lint`, `npx tsc --noEmit`, `node scripts/check-home-sharing.mjs`, `npm run check:contrast` y `npm run build -- --webpack`.

La revisión visual `/login/circles-review` contiene datos ficticios y solo está disponible en desarrollo (404 en producción). No modifica propiedades reales. Validar los flujos completos con una sesión autenticada antes de desplegar.

El objetivo de +20% de visitas requiere comparar sesiones durante 28 días antes y después del lanzamiento; no es un resultado medido. Conviene acompañarlo de casas compartidas, visitas a fichas y solicitudes enviadas. Este cambio no instala analítica ni envía notificaciones.

### Home and circle lifecycle

Apply `supabase/migrations/009_manage_homes_circles.sql` to existing databases before using the new controls. Fresh schema installations include it. Owners can delete homes from their detail page; members can leave circles under Information; admins can delete circles there. Deletion requires typing the entity name and explicitly warns that associated requests and conversations are removed by existing foreign-key cascades. Leaving withdraws the user's houses without deleting them. The last administrator must retain membership or delete the circle. Authentication, ownership, admin checks and leave cleanup run in one database transaction. Uploaded storage objects are not purged by these operations.

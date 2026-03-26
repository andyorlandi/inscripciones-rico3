# Deployment en Vercel

Guía paso a paso para deployar el proyecto en Vercel con PostgreSQL.

## Prerequisitos

- Cuenta en Vercel (https://vercel.com)
- Repositorio en GitHub (✅ ya lo tenés)
- Cuenta en Vercel con acceso a Vercel Postgres

## Pasos para el Deployment

### 1. Conectar el repositorio a Vercel

1. Ve a https://vercel.com/new
2. Selecciona "Import Git Repository"
3. Busca y selecciona tu repo: `andyorlandi/inscripciones-rico3`
4. Click en "Import"

### 2. Configurar el proyecto

En la pantalla de configuración:

**Framework Preset:** Next.js (se detecta automáticamente)

**Build Command:** `npm run build` (default)

**Output Directory:** `.next` (default)

**Install Command:** `npm install` (default)

### 3. Configurar Variables de Entorno

Antes de hacer deploy, necesitás agregar las variables de entorno.

En Vercel, en la sección "Environment Variables":

```
ADMIN_PASSWORD=tu_password_seguro
```

**IMPORTANTE:** No agregues `DATABASE_URL` todavía, lo haremos en el paso 4.

### 4. Agregar Vercel Postgres

1. En tu proyecto de Vercel, ve a la pestaña "Storage"
2. Click en "Create Database"
3. Selecciona "Postgres"
4. Dale un nombre: `inscripciones-rico3-db`
5. Selecciona la región más cercana a tus usuarios
6. Click en "Create"

Vercel automáticamente agregará las siguientes variables de entorno a tu proyecto:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL` ← Esta es la que necesitás
- `POSTGRES_URL_NON_POOLING`
- Otras variables relacionadas

### 5. Configurar DATABASE_URL

1. En "Settings" → "Environment Variables"
2. Crea una nueva variable:
   - **Name:** `DATABASE_URL`
   - **Value:** Copia el valor de `POSTGRES_PRISMA_URL`
   - **Environments:** Production, Preview, Development (todas)
3. Click en "Save"

### 6. Inicializar la Base de Datos

Necesitás crear las tablas en la base de datos. Hay dos formas:

#### Opción A: Usando Prisma Migrate (Recomendado)

1. Instala Vercel CLI localmente:
```bash
npm install -g vercel
```

2. Linkea tu proyecto:
```bash
vercel link
```

3. Descarga las variables de entorno:
```bash
vercel env pull .env.production
```

4. Ejecuta las migraciones:
```bash
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

5. Inicializa el estado de la app:
```bash
npx tsx scripts/init-db.ts
```

#### Opción B: Desde el Dashboard de Vercel

1. Ve a tu proyecto en Vercel
2. Ve a "Deployments"
3. Click en el deployment más reciente
4. Click en "..." (tres puntos) → "Redeploy"
5. Marca la opción "Use existing Build Cache"
6. Click en "Redeploy"

Luego, ejecuta el script de inicialización:
1. En tu terminal local con las variables de producción cargadas:
```bash
npx tsx scripts/init-db.ts
```

### 7. Deploy

1. Click en "Deploy" en Vercel
2. Espera a que termine el build (2-3 minutos)
3. Una vez completado, verás tu URL de producción

### 8. Verificación

1. Visita tu URL de Vercel: `https://tu-proyecto.vercel.app`
2. Deberías ver la pantalla de bienvenida
3. Ve al panel admin: `https://tu-proyecto.vercel.app/admin`
4. Usa tu `ADMIN_PASSWORD` para entrar
5. Verifica que todo funcione correctamente

### 9. Cargar Datos de Prueba (Opcional)

Si querés cargar los 30 estudiantes de prueba:

1. Con las variables de producción cargadas:
```bash
npx tsx scripts/seed.ts
```

## Variables de Entorno Finales

Tu proyecto debe tener estas variables en Vercel:

```
ADMIN_PASSWORD=tu_password_seguro
DATABASE_URL=(copiado de POSTGRES_PRISMA_URL)
POSTGRES_URL=(auto-generado por Vercel)
POSTGRES_PRISMA_URL=(auto-generado por Vercel)
POSTGRES_URL_NON_POOLING=(auto-generado por Vercel)
```

## Troubleshooting

### Error: "DATABASE_URL is not set"
- Asegúrate de haber agregado la variable `DATABASE_URL` con el valor de `POSTGRES_PRISMA_URL`
- Redeploya el proyecto después de agregar la variable

### Error: "Prisma Client not generated"
- El script de build debería ejecutar `prisma generate` automáticamente
- Si falla, intenta redeploy

### La base de datos está vacía
- Ejecuta el script `init-db.ts` con las variables de producción
- Usa `vercel env pull` para obtener las variables correctas

### Error al conectar a la base de datos
- Verifica que `DATABASE_URL` apunte a `POSTGRES_PRISMA_URL` (con connection pooling)
- No uses `POSTGRES_URL_NON_POOLING` en producción con Vercel

## Actualizaciones Futuras

Cada vez que hagas push a GitHub:

1. Vercel detectará el cambio automáticamente
2. Ejecutará el build y desplegará
3. Si cambiaste el schema de Prisma:
   - Crea una migración: `npx prisma migrate dev`
   - Commitea la migración
   - Push a GitHub
   - En producción, ejecuta: `npx prisma migrate deploy`

## URLs Importantes

- **Panel Admin:** `https://tu-proyecto.vercel.app/admin`
- **Formulario:** `https://tu-proyecto.vercel.app`
- **Dashboard de Vercel:** https://vercel.com/dashboard
- **Database Dashboard:** En tu proyecto → Storage → inscripciones-rico3-db

## Seguridad en Producción

🔒 **IMPORTANTE:**

1. Cambia `ADMIN_PASSWORD` a algo seguro (usa `openssl rand -base64 32`)
2. No compartas las variables de entorno de producción
3. Las URLs de la base de datos son sensibles, mantenlas privadas
4. Considera agregar rate limiting para el endpoint de registro
5. Monitorea los logs en Vercel Dashboard

## Costos

**Vercel:**
- Plan Hobby: Gratis
- Build time: Ilimitado en Hobby
- Bandwidth: 100GB/mes gratis

**Vercel Postgres:**
- Plan Hobby: Gratis
- Storage: 256MB
- Compute: 60 horas/mes
- Suficiente para ~1000 estudiantes

Para más estudiantes o tráfico, considera:
- Vercel Pro: $20/mes
- Postgres: $20/mes adicionales para más capacidad

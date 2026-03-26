# Guía de Deployment

## 🚀 Opción 1: Railway (Recomendada)

Railway soporta SQLite con volúmenes persistentes. Es la opción más simple para esta app.

### Requisitos previos
- Cuenta en [Railway](https://railway.app)
- Repositorio Git (GitHub, GitLab o Bitbucket)

### Paso 1: Preparar el repositorio

```bash
# Inicializar git (si no lo hiciste)
git init

# Agregar archivos
git add .
git commit -m "Initial commit"

# Crear repo en GitHub y pushearlo
git remote add origin https://github.com/TU_USUARIO/inscripciones-rico3.git
git branch -M main
git push -u origin main
```

### Paso 2: Crear proyecto en Railway

1. Andá a https://railway.app/new
2. Click en "Deploy from GitHub repo"
3. Seleccioná el repositorio `inscripciones-rico3`
4. Railway detectará automáticamente que es Next.js

### Paso 3: Configurar variables de entorno

En el dashboard de Railway:

1. Click en tu servicio
2. Andá a la pestaña "Variables"
3. Agregá:
   ```
   ADMIN_PASSWORD=tu_password_super_seguro
   NODE_ENV=production
   ```

### Paso 4: Configurar volumen persistente (IMPORTANTE)

Para que la base de datos SQLite persista:

1. En Railway, andá a tu servicio
2. Click en "Settings"
3. Scrolleá a "Volumes"
4. Click "Add Volume"
5. Mount Path: `/app/data`
6. Click "Add"

### Paso 5: Deploy

Railway va a deployar automáticamente. Esperá a que termine el build (~2-3 minutos).

Una vez deployado:
- Te va a dar una URL tipo `https://inscripciones-rico3-production.up.railway.app`
- Abrí esa URL y debería funcionar

### Paso 6: Cargar datos de prueba (opcional)

Si querés cargar los 30 estudiantes de prueba en producción:

1. En Railway, andá a tu servicio
2. Click en "Deployments" → "View Logs"
3. Click en "Shell" (terminal)
4. Ejecutá: `npm run seed`

---

## 🌐 Opción 2: Vercel (Requiere PostgreSQL)

Vercel tiene filesystem efímero, por lo que **NO funciona con SQLite**. Necesitás migrar a PostgreSQL.

### Si querés usar Vercel:

1. **Crear base de datos PostgreSQL**
   - Opción A: Vercel Postgres (integrado)
   - Opción B: Supabase (gratis)
   - Opción C: Neon (gratis)

2. **Actualizar Prisma schema**

Editá `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. **Deployar a Vercel**

```bash
npm install -g vercel
vercel
```

4. **Configurar variables de entorno en Vercel**
   - `DATABASE_URL`: Tu connection string de Postgres
   - `ADMIN_PASSWORD`: Tu contraseña de admin

5. **Ejecutar migraciones**

```bash
vercel env pull .env.local
npx prisma db push
```

---

## 🐳 Opción 3: Render

Similar a Railway, soporta SQLite con volúmenes persistentes.

### Paso 1: Crear cuenta en Render

Andá a https://render.com y registrate.

### Paso 2: Crear Web Service

1. Click en "New +"
2. Seleccioná "Web Service"
3. Conectá tu repositorio de GitHub
4. Configurá:
   - **Name**: inscripciones-rico3
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run deploy:init && npm start`

### Paso 3: Variables de entorno

Agregá:
```
ADMIN_PASSWORD=tu_password_seguro
NODE_ENV=production
```

### Paso 4: Configurar disco persistente

1. En el dashboard de tu servicio
2. Scrolleá a "Disks"
3. Click "Add Disk"
4. Name: `data`
5. Mount Path: `/opt/render/project/src/data`
6. Size: 1 GB (gratis)
7. Click "Save"

### Paso 5: Deploy

Render va a deployar automáticamente.

---

## 📱 Generar QR Code

Una vez deployado, generá un QR para que los alumnos escaneen:

1. Andá a https://qr-code-generator.com
2. Ingresá tu URL de producción
3. Descargá el QR
4. Imprimilo o proyectalo el día de inscripción

---

## 🔒 Seguridad para Producción

### Cambiar la contraseña de admin

**IMPORTANTE:** Cambiá `ADMIN_PASSWORD` antes de ir a producción:

```bash
# Generá una contraseña segura
openssl rand -base64 32
```

Usá esa contraseña en las variables de entorno del servicio.

### Habilitar HTTPS

Railway y Render proveen HTTPS automáticamente. En Vercel también es automático.

---

## 🐛 Troubleshooting

### Error: "Database locked"

Si ves este error en Railway/Render:
- Asegurate de tener el volumen persistente configurado
- Reiniciá el servicio

### Error: "ADMIN_PASSWORD not configured"

Verificá que agregaste la variable de entorno `ADMIN_PASSWORD` en el dashboard del servicio.

### La base de datos se borra al redeployar

Significa que el volumen persistente NO está configurado correctamente. Volvé a configurarlo según los pasos de arriba.

### No se puede escribir en /data

Cambiá los permisos del volumen o verificá que el Mount Path sea correcto.

---

## 📊 Backup de la base de datos

### En Railway:

```bash
# Desde la shell de Railway
sqlite3 /app/data/inscripciones.db .dump > backup.sql
```

### Download del backup:

En Railway, podés usar `railway volume` CLI para descargar archivos.

### Restaurar:

```bash
sqlite3 /app/data/inscripciones.db < backup.sql
```

---

## 🎯 Recomendación Final

Para esta app específica (95 alumnos, uso puntual, no crítica):

**🏆 Railway es la mejor opción:**
- ✅ Setup simple
- ✅ SQLite funciona out-of-the-box
- ✅ Volúmenes persistentes fáciles
- ✅ Plan gratuito generoso ($5 de crédito mensual)
- ✅ Deploy automático desde GitHub

Si necesitás escalar o tener múltiples regiones, considerá Vercel + PostgreSQL.

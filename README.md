# App de Inscripción a Comisiones DG3 - Cátedra Rico

Sistema web mobile-first para gestionar la inscripción de alumnos a comisiones de Diseño Gráfico 3, Cátedra Rico, FADU UBA.

## ¿Qué es esto?

Una aplicación web que permite:

- **Para alumnos:** Registrarse completando un formulario con sus datos y cátedras previas
- **Para docentes:** Distribuir automáticamente ~95 alumnos en 3 comisiones balanceadas por nivel académico

El primer día de clases, los alumnos escanean un QR, completan el formulario desde su celular, y reciben un código personal. Luego, un algoritmo distribuye a todos equitativamente en las 3 comisiones.

## Estado del proyecto

**FASE 1 - COMPLETA**

- ✅ Formulario de registro mobile-first
- ✅ Sistema de scoring automático
- ✅ Algoritmo de distribución balanceada
- ✅ Panel de administración
- ✅ Export a Excel

**PRÓXIMAS FASES**

- Fase 2: Vinculación de compañeros (subgrupos y grupos de afinidad)
- Fase 3: Publicación de resultados a los alumnos

## Stack Tecnológico

- **Frontend:** Next.js 14 + React + TypeScript
- **Estilos:** Tailwind CSS
- **Base de datos:** SQLite con better-sqlite3
- **Export:** ExcelJS
- **Deploy:** Vercel, Railway, Render (cualquier plataforma compatible con Next.js)

## Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd inscripciones-rico3
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Editar `.env` y configurar la contraseña de administración:

```
ADMIN_PASSWORD=tu_password_seguro_aqui
```

### 4. Inicializar la base de datos

```bash
npm run init-db
```

Esto crea la base de datos SQLite en `data/inscripciones.db` con todas las tablas necesarias.

### 5. (Opcional) Cargar datos de prueba

Para testear el sistema con 30 alumnos ficticios:

```bash
npm run seed
```

## Uso en desarrollo

Iniciar el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

- **Vista alumno:** http://localhost:3000
- **Panel admin:** http://localhost:3000/admin

## Deployment

### Vercel (recomendado)

1. Crear cuenta en [Vercel](https://vercel.com)
2. Conectar el repositorio
3. Configurar la variable de entorno `ADMIN_PASSWORD`
4. Deploy

**IMPORTANTE:** SQLite no persiste en Vercel debido a su sistema de archivos efímero. Para producción se recomienda:

- Usar Vercel Postgres o Supabase
- O deployar en Railway/Render que soportan SQLite con volúmenes persistentes

### Railway

1. Crear cuenta en [Railway](https://railway.app)
2. Crear nuevo proyecto desde GitHub
3. Configurar variable de entorno `ADMIN_PASSWORD`
4. Railway detectará automáticamente que es Next.js y lo deployará

### Render

1. Crear cuenta en [Render](https://render.com)
2. Crear nuevo Web Service
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Configurar variable de entorno `ADMIN_PASSWORD`

## Scripts disponibles

```bash
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Build para producción
npm start            # Iniciar servidor de producción
npm run init-db      # Inicializar base de datos
npm run seed         # Cargar datos de prueba
```

## Estructura del proyecto

```
├── app/
│   ├── page.tsx                    # Vista principal (formulario)
│   ├── admin/
│   │   └── page.tsx                # Panel de administración
│   ├── api/
│   │   ├── students/               # Endpoints de estudiantes
│   │   │   ├── register/
│   │   │   └── check-status/
│   │   └── admin/                  # Endpoints de admin
│   │       ├── dashboard/
│   │       ├── distribute/
│   │       ├── save-distribution/
│   │       ├── toggle-registration/
│   │       └── export/
│   └── globals.css                 # Estilos globales
├── components/
│   ├── Welcome.tsx                 # Pantalla de bienvenida
│   ├── StudentForm.tsx             # Formulario de registro
│   ├── Confirmation.tsx            # Confirmación de registro
│   ├── CheckStatus.tsx             # Verificar estado
│   └── admin/
│       ├── AdminLogin.tsx          # Login admin
│       ├── AdminDashboard.tsx      # Dashboard principal
│       ├── StudentsList.tsx        # Lista de inscriptos
│       └── CommissionsPreview.tsx  # Preview de comisiones
├── lib/
│   ├── db.ts                       # Configuración SQLite
│   ├── scoring.ts                  # Sistema de scoring
│   ├── distribution.ts             # Algoritmo de distribución
│   ├── personal-code.ts            # Generador de códigos
│   └── excel-export.ts             # Exportar a Excel
├── scripts/
│   ├── init-db.ts                  # Inicializar DB
│   └── seed.ts                     # Datos de prueba
└── data/
    └── inscripciones.db            # Base de datos (generado)
```

## Sistema de Scoring

Cada alumno recibe un puntaje de 0 a 8 basado en las cátedras que cursó:

| Materia | Cátedras que suman puntos | Puntos |
|---------|---------------------------|--------|
| Diseño Gráfico 2 | Gabriele, Ex Wolkowicz, Ex Rico | 3 |
| Diseño Gráfico 1 | Gabriele, Ex Wolkowicz, Ex Rico | 2 |
| Tipografía 2 | Longinotti, Cosgaya, Gaitto | 1 |
| Morfología 2 | Longinotti, Pereyra | 1 |
| Tipografía 1 | Longinotti, Cosgaya, Gaitto | 0.5 |
| Morfología 1 | Longinotti, Pereyra | 0.5 |

El score se calcula automáticamente al momento del registro.

## Algoritmo de Distribución (Fase 1)

1. Ordena alumnos por score (descendente)
2. Asigna cada alumno a la comisión con menor score acumulado
3. Respeta diferencia máxima de ±2 alumnos entre comisiones
4. Distribuye recursantes equitativamente

En Fase 2, el algoritmo evolucionará para manejar grupos de compañeros.

## Uso del Panel de Administración

1. Ingresar a `/admin` con la contraseña configurada
2. Ver estadísticas generales y lista de inscriptos
3. **Cerrar registro** cuando todos se hayan inscripto
4. **Distribuir en comisiones** para ejecutar el algoritmo
5. Revisar y ajustar manualmente si es necesario
6. **Guardar distribución** para persistir los cambios
7. **Exportar Excel** para descargar los datos

## Base de datos

### Tabla: students

Almacena todos los datos de los alumnos inscriptos.

Campos preparados para Fase 2:
- `affinity_group_id`: Grupo de afinidad (hasta 6 personas)
- `subgroup_id`: Subgrupo obligatorio (hasta 3 personas)

### Tabla: app_state

Configuración global de la aplicación.

### Tablas: affinity_groups, subgroups

Preparadas para Fase 2 (actualmente vacías).

## Troubleshooting

### Error: "ADMIN_PASSWORD no está configurado"

Asegurate de tener el archivo `.env` con la variable `ADMIN_PASSWORD` definida.

### Error: "Database not found"

Ejecutá `npm run init-db` para crear la base de datos.

### Los datos no persisten después del deploy

Si usás Vercel, necesitás migrar a una base de datos persistente (Postgres, Supabase) o usar Railway/Render con volúmenes.

## Próximas Fases

### Fase 2: Vinculación de compañeros

- Los alumnos podrán crear/unirse a grupos de afinidad (6 personas max)
- Dentro de cada grupo, podrán formar subgrupos obligatorios (3 personas max)
- El algoritmo distribuirá grupos completos en vez de individuos
- Se priorizará mantener subgrupos juntos (obligatorio) y grupos de afinidad juntos (si es posible)

### Fase 3: Publicación de resultados

- Los alumnos verán su comisión asignada al entrar con su mail/código
- Verán quiénes son sus compañeros de comisión
- Sistema de notificaciones cuando se publican las comisiones

## Licencia

Este proyecto es de uso interno para la Cátedra Rico, FADU UBA.

## Contacto

Para consultas o reportar problemas, contactar a [tu email/contacto aquí].

# Guía de Inicio Rápido

## ✅ Estado del Proyecto

La **Fase 1** está completamente implementada y lista para usar:

- ✅ Base de datos SQLite inicializada
- ✅ 30 estudiantes de prueba cargados
- ✅ Formulario de registro mobile-first
- ✅ Sistema de scoring automático
- ✅ Algoritmo de distribución
- ✅ Panel de administración
- ✅ Export a Excel

## 🚀 Próximos Pasos

### 1. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en **http://localhost:3000**

### 2. Probar la vista de alumno

Abrí **http://localhost:3000** en tu navegador (o celular conectado a la misma red).

**Flujo de prueba:**

1. Click en "Empezar"
2. Completá el formulario (todos los campos son obligatorios)
3. Al enviar, vas a recibir un código personal (ej: "LUCI-4827")
4. Probá volver a entrar con el mismo mail para ver el estado

**Tip:** Usá un mail diferente para cada prueba, o probá con los 30 estudiantes ya cargados.

### 3. Probar el panel de administración

Abrí **http://localhost:3000/admin**

**Credenciales:**
- Contraseña: `admin123` (configurada en `.env`)

**Acciones disponibles:**

1. **Ver estadísticas**: Total de inscriptos, score promedio, recursantes
2. **Ver lista completa**: Tabla con todos los estudiantes y sus datos
3. **Cerrar/Abrir registro**: Toggle para habilitar/deshabilitar inscripciones
4. **Distribuir en comisiones**: Click en el botón para ejecutar el algoritmo
   - Verás un preview con las 3 comisiones balanceadas
   - Podés mover estudiantes entre comisiones manualmente
   - Click en "Guardar distribución" para persistir
5. **Exportar Excel**: Descarga un archivo .xlsx con todos los datos

### 4. Verificar los estudiantes de prueba

La base de datos ya tiene 30 estudiantes de prueba con:
- Nombres y apellidos variados
- Diferentes cátedras (scores de 0 a 5 puntos)
- 1 recursante
- Códigos personales únicos

Podés ver la lista completa en el panel de admin.

## 📱 Probar en tu celular

1. Asegurate de que tu computadora y celular estén en la misma red WiFi
2. Buscá la IP de tu computadora:
   - **Mac**: `ipconfig getifaddr en0`
   - **Windows**: `ipconfig` (buscar IPv4)
3. Abrí en tu celular: `http://[TU-IP]:3000`
   - Ejemplo: `http://192.168.1.100:3000`

## 🗄️ Base de datos

La base de datos SQLite está en: `data/inscripciones.db`

**Comandos útiles:**

```bash
# Limpiar y recargar datos de prueba
npm run seed

# Ver datos en crudo (si tenés sqlite3 instalado)
sqlite3 data/inscripciones.db "SELECT name, email, score FROM students;"
```

## 🎨 Personalización

### Cambiar la contraseña de admin

Editá el archivo `.env`:

```
ADMIN_PASSWORD=tu_nueva_contraseña_segura
```

### Modificar las cátedras

Las listas de cátedras están en:
- **Frontend (formulario):** `components/StudentForm.tsx`
- **Scoring:** `lib/scoring.ts` (lógica de puntajes)

### Ajustar el algoritmo de distribución

La lógica está en `lib/distribution.ts`. Podés modificar:
- Cantidad de comisiones (actualmente 3)
- Nombres de las comisiones
- Criterios de balanceo

### Cambiar los colores

Los colores están en `tailwind.config.ts` usando el prefijo `primary`.

## 📊 Exportar datos

Desde el panel de admin, click en "Exportar Excel" para descargar un archivo con:

**Hoja 1: Todos los alumnos**
- Nombre, Mail, Código personal
- Todas las cátedras cursadas
- Score, Recursante
- Comisión asignada (si ya se distribuyó)

**Hojas 2-4: Una por comisión** (solo si ya se distribuyó)
- Mismos datos filtrados por comisión

## 🐛 Troubleshooting

### "ADMIN_PASSWORD no está configurado"
→ Asegurate de tener el archivo `.env` con la variable definida

### No puedo acceder desde mi celular
→ Verificá que firewall/antivirus no esté bloqueando el puerto 3000

### Los datos desaparecen al reiniciar
→ Esto NO debería pasar. SQLite persiste en `data/inscripciones.db`
→ Si pasa, verificá permisos de escritura en la carpeta `data/`

### Errores de compilación
→ Ejecutá `npm install` nuevamente
→ Verificá que estés usando Node.js v18 o superior

## 📦 Deploy a Producción

Ver instrucciones detalladas en `README.md`, sección "Deployment".

**Importante:** Para producción en Vercel necesitarás migrar a una base de datos persistente (Postgres/Supabase) porque el filesystem es efímero.

Para Railway o Render, SQLite funciona bien con volúmenes persistentes.

## 🔮 Próximas Fases

### Fase 2: Vinculación de compañeros
- Los alumnos podrán crear grupos de afinidad (hasta 6 personas)
- Subgrupos obligatorios dentro de cada grupo (hasta 3 personas)
- El algoritmo respetará estos grupos al distribuir

### Fase 3: Publicación de resultados
- Los alumnos verán su comisión asignada
- Lista de compañeros de comisión
- Sistema de notificaciones

Las tablas de la base de datos ya están preparadas para estas fases.

## 💡 Tips para el día de inscripción

1. **Probá todo antes:** Verificá que el formulario, algoritmo y export funcionen
2. **Generá un QR:** Usá un generador de QR apuntando a tu URL de deploy
3. **Tené un backup:** Exportá el Excel regularmente durante el día
4. **Cerrá el registro:** Una vez que todos se inscribieron, cerrá el registro desde el admin
5. **Revisá manualmente:** Antes de guardar la distribución, revisá que tenga sentido

---

**¿Dudas o problemas?** Contactá al equipo de desarrollo o abrí un issue en GitHub.

# Guía de Base de Datos

## Configuración

Este proyecto usa **PostgreSQL en Neon** como única base de datos.

**Importante**: Local y producción usan la MISMA base de datos.

## Comandos Seguros

```bash
# Hacer backup
npm run backup

# Ver datos
npx prisma studio

# Estado de migraciones
npm run migrate:status

# Inicializar AppState (seguro, no borra nada)
npm run init-db
```

## Comandos PELIGROSOS

```bash
# Cargar datos de prueba (BORRA estudiantes)
CONFIRM_SEED=yes npm run seed

# Reset completo de BD
npm run migrate:reset
```

## Protecciones

1. Script `seed` requiere `CONFIRM_SEED=yes`
2. Script `seed` bloqueado en producción (`NODE_ENV=production`)
3. Comando `migrate:reset` tiene delay de 5 segundos
4. Sistema de backups disponible

## Migraciones

Para cambios en el schema:

```bash
# 1. Editar prisma/schema.prisma
# 2. Crear migración
npm run migrate:dev -- --name descripcion_cambio
# 3. Aplicar en producción
npm run migrate:deploy
```

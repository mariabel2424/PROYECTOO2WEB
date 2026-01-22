# 🐳 Guía de Docker para Busqueday

## 📋 Requisitos Previos

- Docker Desktop instalado
- Docker Compose v2.0+
- Al menos 4GB de RAM disponible

## 🚀 Inicio Rápido

### 1. Configurar variables de entorno

```cmd
copy .env.docker .env
```

Edita el archivo `.env` con tus credenciales.

### 2. Construir y levantar los contenedores

```cmd
docker-compose up -d --build
```

### 3. Configurar el backend (primera vez)

```cmd
docker exec -it busqueday-backend php artisan key:generate
docker exec -it busqueday-backend php artisan migrate --seed
docker exec -it busqueday-backend php artisan storage:link
```

### 4. Acceder a los servicios

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **phpMyAdmin**: http://localhost:8080
- **Base de datos**: localhost:3306

## 📦 Comandos Útiles

### Ver logs de los contenedores

```cmd
REM Todos los servicios
docker-compose logs -f

REM Solo frontend
docker-compose logs -f frontend

REM Solo backend
docker-compose logs -f backend
```

### Detener los contenedores

```cmd
docker-compose down
```

### Detener y eliminar volúmenes (⚠️ borra la base de datos)

```cmd
docker-compose down -v
```

### Reiniciar un servicio específico

```cmd
docker-compose restart frontend
docker-compose restart backend
```

### Ejecutar comandos en los contenedores

```cmd
REM Artisan commands
docker exec -it busqueday-backend php artisan migrate
docker exec -it busqueday-backend php artisan db:seed
docker exec -it busqueday-backend php artisan cache:clear

REM Composer
docker exec -it busqueday-backend composer install
docker exec -it busqueday-backend composer update

REM NPM en frontend
docker exec -it busqueday-frontend npm install
docker exec -it busqueday-frontend npm run build
```

### Acceder a la terminal de un contenedor

```cmd
REM Backend
docker exec -it busqueday-backend sh

REM Frontend
docker exec -it busqueday-frontend sh

REM Base de datos
docker exec -it busqueday-db mysql -u root -p
```

## 🔧 Desarrollo

### Modo desarrollo (con hot reload)

El `docker-compose.yml` ya está configurado para desarrollo:
- Frontend con hot reload en puerto 3000
- Backend con volúmenes montados
- Base de datos persistente

### Ver estado de los contenedores

```cmd
docker-compose ps
```

### Reconstruir un servicio

```cmd
docker-compose up -d --build frontend
docker-compose up -d --build backend
```

## 🚢 Producción

### Usar docker-compose de producción

```cmd
docker-compose -f docker-compose.prod.yml up -d --build
```

### Optimizaciones de producción

El `docker-compose.prod.yml` incluye:
- Builds optimizados
- Sin volúmenes de desarrollo
- Variables de entorno de producción
- Nginx como reverse proxy

## 🐛 Troubleshooting

### El frontend no se conecta al backend

Verifica que `NEXT_PUBLIC_API_URL` en el frontend apunte a `http://localhost:8000/api`

### Error de permisos en Laravel

```cmd
docker exec -it busqueday-backend chown -R www-data:www-data /var/www/html/storage
docker exec -it busqueday-backend chmod -R 775 /var/www/html/storage
```

### La base de datos no inicia

```cmd
docker-compose down
docker volume rm busqueday_db-data
docker-compose up -d db
```

### Limpiar todo y empezar de cero

```cmd
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

## 📊 Monitoreo

### Ver uso de recursos

```cmd
docker stats
```

### Ver volúmenes

```cmd
docker volume ls
```

### Ver redes

```cmd
docker network ls
```

## 🔐 Seguridad

Para producción, asegúrate de:

1. Cambiar todas las contraseñas en `.env`
2. Configurar SSL/TLS con certificados
3. Usar secretos de Docker para credenciales
4. Configurar firewall y limitar puertos expuestos
5. Actualizar regularmente las imágenes base

## 📝 Notas

- Los datos de la base de datos se persisten en el volumen `db-data`
- El storage de Laravel se persiste en `backend-storage`
- Redis se persiste en `redis-data`
- Los `node_modules` del frontend están en un volumen anónimo para mejor rendimiento

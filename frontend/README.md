# Sistema de Cursos Vacacionales

Sistema web para la gestión de cursos vacacionales para niños y jóvenes.

## Flujo del Sistema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     SISTEMA DE CURSOS VACACIONALES                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   TUTOR (Padre/Madre/Representante)                                         │
│      │                                                                      │
│      ├── Registra PARTICIPANTES (sus hijos)                                 │
│      │                                                                      │
│      └── Inscribe al PARTICIPANTE en un CURSO → GRUPO                       │
│             │                                                               │
│             └── Genera FACTURA → Realiza PAGO                               │
│                                                                             │
│   CURSO VACACIONAL (Natación, Fútbol, Arte, etc.)                           │
│      │                                                                      │
│      └── Tiene varios GRUPOS (horarios diferentes)                          │
│             │                                                               │
│             └── Cada GRUPO tiene INSTRUCTORES asignados                     │
│                                                                             │
│   INSTRUCTOR                                                                │
│      │                                                                      │
│      └── Imparte clases en los GRUPOS asignados                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Entidades Principales

| Entidad          | Descripción                                     |
| ---------------- | ----------------------------------------------- |
| **Participante** | Niño/joven que toma el curso vacacional         |
| **Tutor**        | Padre/madre/representante que inscribe y paga   |
| **Instructor**   | Profesor que imparte las clases                 |
| **Curso**        | Curso vacacional (natación, fútbol, arte, etc.) |
| **Grupo**        | Horario específico del curso (mañana, tarde)    |
| **Inscripción**  | Registro del participante en un grupo           |
| **Factura**      | Cobro por la inscripción                        |
| **Pago**         | Registro del pago de la factura                 |

## Roles del Sistema

| Rol               | Permisos                                    |
| ----------------- | ------------------------------------------- |
| **Administrador** | Acceso total al sistema                     |
| **Coordinador**   | Gestiona cursos, grupos e instructores      |
| **Instructor**    | Ve sus grupos y participantes asignados     |
| **Tutor**         | Registra participantes e inscribe en cursos |
| **Secretaria**    | Atiende inscripciones y registra pagos      |

## Tecnologías

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Backend**: Laravel 11, PHP 8.2
- **Base de datos**: SQLite / MySQL

## Instalación

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

### Backend

```bash
cd Proyectito-webxd-main
composer install
php artisan migrate --seed
php artisan serve
```

## Variables de Entorno

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Backend (.env)

```
APP_URL=http://localhost:8000
DB_CONNECTION=sqlite
```

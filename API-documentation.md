# Documentación de la API

Esta documentación describe los endpoints disponibles en la API, incluyendo sus métodos HTTP, rutas, parámetros de entrada, cuerpos de solicitud (DTOs) y una descripción general de sus respuestas.

---

## Módulo: ConfederationsController
Controlador para la gestión de confederaciones.

### Endpoints

#### `POST /api/confederations`
Descripción: Crea una nueva confederación.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)

**Cuerpo de la Solicitud (Request Body): `CreateConfederationDto`**
```json
{
  "name": "string" // Nombre de la confederación
}
```
Respuesta: Retorna el objeto de la confederación creada.

#### `GET /api/confederations`
Descripción: Obtiene todas las confederaciones.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)
Respuesta: Retorna un array de objetos de confederación.

#### `GET /api/confederations/:id`
Descripción: Obtiene una confederación por su ID.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)

**Parámetros de Ruta:**
- `id`: number (ID de la confederación)

Respuesta: Retorna un objeto de confederación.

#### `PATCH /api/confederations/:id`
Descripción: Actualiza una confederación existente por su ID.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)

**Parámetros de Ruta:**
- `id`: number (ID de la confederación)

**Cuerpo de la Solicitud (Request Body): `UpdateConfederationDto`**
```json
{
  "name": "string" // (Opcional) Nuevo nombre de la confederación
}
```
Respuesta: Retorna el objeto de la confederación actualizada.

#### `DELETE /api/confederations/:id`
Descripción: Elimina una confederación por su ID.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)

**Parámetros de Ruta:**
- `id`: number (ID de la confederación)

Respuesta: Retorna el resultado de la operación de eliminación.

---

## Módulo: LeaderboardController
Controlador para la gestión de tablas de clasificación (leaderboards).

### Endpoints

#### `POST /api/leaderboard`
Descripción: Crea una nueva entrada en la tabla de clasificación.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)

**Cuerpo de la Solicitud (Request Body): `CreateLeaderboardDto`**
```json
{} // Objeto vacío, se espera que el servicio maneje la lógica interna.
```
Respuesta: Retorna la entrada de la tabla de clasificación creada.

#### `GET /api/leaderboard`
Descripción: Obtiene todas las entradas de la tabla de clasificación.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)
Respuesta: Retorna un array de entradas de la tabla de clasificación.

#### `GET /api/leaderboard/:id`
Descripción: Obtiene una entrada de la tabla de clasificación por su ID.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)

**Parámetros de Ruta:**
- `id`: string (ID de la entrada de la tabla de clasificación)

Respuesta: Retorna una entrada de la tabla de clasificación.

#### `GET /api/leaderboard/pool/:poolId`
Descripción: Obtiene las entradas de la tabla de clasificación para una quiniela específica.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)

**Parámetros de Ruta:**
- `poolId`: number (ID de la quiniela)

Respuesta: Retorna un array de entradas de la tabla de clasificación para la quiniela.

#### `GET /api/leaderboard/pool/:poolId/calculate`
Descripción: Calcula la tabla de clasificación para una quiniela específica.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)

**Parámetros de Ruta:**
- `poolId`: number (ID de la quiniela)

Respuesta: Retorna el resultado del cálculo de la tabla de clasificación.

#### `GET /api/leaderboard/pool/:poolId/ranking`
Descripción: Obtiene el ranking de la tabla de clasificación para una quiniela específica.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)

**Parámetros de Ruta:**
- `poolId`: number (ID de la quiniela)

Respuesta: Retorna el ranking de la tabla de clasificación para la quiniela.

#### `POST /api/leaderboard/update/prediction/:predictionId`
Descripción: Actualiza la tabla de clasificación después de una predicción.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)

**Parámetros de Ruta:**
- `predictionId`: number (ID de la predicción)

Respuesta: Retorna el resultado de la actualización.

#### `POST /api/leaderboard/update/match/:matchId`
Descripción: Actualiza la tabla de clasificación después del resultado de un partido.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)

**Parámetros de Ruta:**
- `matchId`: number (ID del partido)

Respuesta: Retorna el resultado de la actualización.

#### `PATCH /api/leaderboard/:id`
Descripción: Actualiza una entrada de la tabla de clasificación por su ID.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)

**Parámetros de Ruta:**
- `id`: string (ID de la entrada de la tabla de clasificación)

**Cuerpo de la Solicitud (Request Body): `UpdateLeaderboardDto`**
```json
{} // Objeto vacío, se espera que el servicio maneje la lógica interna.
```
Respuesta: Retorna la entrada de la tabla de clasificación actualizada.

#### `DELETE /api/leaderboard/:id`
Descripción: Elimina una entrada de la tabla de clasificación por su ID.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)

**Parámetros de Ruta:**
- `id`: string (ID de la entrada de la tabla de clasificación)

Respuesta: Retorna el resultado de la operación de eliminación.

---

## Módulo: MatchesController
Controlador para la gestión de partidos.

### Endpoints

#### `POST /api/matches`
Descripción: Crea un nuevo partido.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)

**Cuerpo de la Solicitud (Request Body): `CreateMatchDto`**
```json
{
  "weekNumber": 0,      // Número de semana del partido
  "matchDate": "string",  // Fecha y hora del partido (ISO 8601)
  "homeTeamId": 0,      // ID del equipo local
  "awayTeamId": 0,      // ID del equipo visitante
  "scoreHome": 0,       // (Opcional) Puntuación del equipo local
  "scoreAway": 0,       // (Opcional) Puntuación del equipo visitante
  "status": "string"    // (Opcional) Estado del partido (ej. "scheduled", "finished")
}
```
Respuesta: Retorna el objeto del partido creado.

#### `GET /api/matches`
Descripción: Obtiene todos los partidos.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)
Respuesta: Retorna un array de objetos de partido.

#### `GET /api/matches/:id`
Descripción: Obtiene un partido por su ID.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)

**Parámetros de Ruta:**
- `id`: number (ID del partido)

Respuesta: Retorna un objeto de partido.

#### `PATCH /api/matches/:id`
Descripción: Actualiza un partido existente por su ID.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)

**Parámetros de Ruta:**
- `id`: number (ID del partido)

**Cuerpo de la Solicitud (Request Body): `UpdateMatchDto`**
```json
{
  "weekNumber": 0,      // (Opcional) Número de semana del partido
  "matchDate": "string",  // (Opcional) Fecha y hora del partido (ISO 8601)
  "homeTeamId": 0,      // (Opcional) ID del equipo local
  "awayTeamId": 0,      // (Opcional) ID del equipo visitante
  "scoreHome": 0,       // (Opcional) Puntuación del equipo local
  "scoreAway": 0,       // (Opcional) Puntuación del equipo visitante
  "status": "string"    // (Opcional) Estado del partido (ej. "scheduled", "finished")
}
```
Respuesta: Retorna el objeto del partido actualizado.

#### `DELETE /api/matches/:id`
Descripción: Elimina un partido por su ID.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)

**Parámetros de Ruta:**
- `id`: number (ID del partido)

Respuesta: Retorna el resultado de la operación de eliminación.

---

## Módulo: PoolsController
Controlador para la gestión de quinielas.

### Endpoints

#### `POST /api/pools`
Descripción: Crea una nueva quiniela.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)

**Cuerpo de la Solicitud (Request Body): `CreatePoolDto`**
```json
{
  "name": "string",         // Nombre de la quiniela
  "description": "string",  // (Opcional) Descripción de la quiniela
  "invitationCode": 0,      // Código de invitación único para la quiniela
  "maxParticipants": 0,     // (Opcional) Número máximo de participantes
  "isActive": true,         // (Opcional) Indica si la quiniela está activa
  "isClose": true,          // (Opcional) Indica si la quiniela está cerrada
  "startDate": "string",    // (Opcional) Fecha de inicio de la quiniela (ISO 8601)
  "endDate": "string",      // (Opcional) Fecha de fin de la quiniela (ISO 8601)
  "creatorId": 0            // ID del usuario creador de la quiniela
}
```
Respuesta: Retorna el objeto de la quiniela creada.

#### `GET /api/pools`
Descripción: Obtiene todas las quinielas.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)
Respuesta: Retorna un array de objetos de quiniela.

#### `GET /api/pools/:id`
Descripción: Obtiene una quiniela por su ID.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)

**Parámetros de Ruta:**
- `id`: number (ID de la quiniela)

Respuesta: Retorna un objeto de quiniela.

#### `PATCH /api/pools/:id`
Descripción: Actualiza una quiniela existente por su ID.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)

**Parámetros de Ruta:**
- `id`: number (ID de la quiniela)

**Cuerpo de la Solicitud (Request Body): `UpdatePoolDto`**
```json
{
  "name": "string",         // (Opcional) Nombre de la quiniela
  "description": "string",  // (Opcional) Descripción de la quiniela
  "invitationCode": 0,      // (Opcional) Código de invitación único para la quiniela
  "maxParticipants": 0,     // (Opcional) Número máximo de participantes
  "isActive": true,         // (Opcional) Indica si la quiniela está activa
  "isClose": true,          // (Opcional) Indica si la quiniela está cerrada
  "startDate": "string",    // (Opcional) Fecha de inicio de la quiniela (ISO 8601)
  "endDate": "string",      // (Opcional) Fecha de fin de la quiniela (ISO 8601)
  "creatorId": 0            // (Opcional) ID del usuario creador de la quiniela
}
```
Respuesta: Retorna el objeto de la quiniela actualizada.

#### `GET /api/pools/user/:userId`
Descripción: Obtiene todas las quinielas asociadas a un usuario.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)

**Parámetros de Ruta:**
- `userId`: number (ID del usuario)

Respuesta: Retorna un array de objetos de quiniela.

#### `GET /api/pools/user/:userId/joined`
Descripción: Obtiene las quinielas a las que un usuario se ha unido.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)

**Parámetros de Ruta:**
- `userId`: number (ID del usuario)

Respuesta: Retorna un array de objetos de quiniela.

#### `GET /api/pools/user/:userId/owned`
Descripción: Obtiene las quinielas creadas por un usuario.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)

**Parámetros de Ruta:**
- `userId`: number (ID del usuario)

Respuesta: Retorna un array de objetos de quiniela.

#### `POST /api/pools/join`
Descripción: Permite a un usuario unirse a una quiniela.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)

**Cuerpo de la Solicitud (Request Body): `JoinPoolDto`**
```json
{
  "invitationCode": 0, // Código de invitación de la quiniela
  "userId": 0          // ID del usuario que se une
}
```
Respuesta: Retorna el resultado de la operación de unión.

#### `GET /api/pools/:poolId/participants/:userId`
Descripción: Obtiene los participantes de una quiniela específica.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)

**Parámetros de Ruta:**
- `poolId`: number (ID de la quiniela)
- `userId`: number (ID del usuario)

Respuesta: Retorna un array de participantes de la quiniela.

#### `DELETE /api/pools/:id`
Descripción: Elimina una quiniela por su ID.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)

**Parámetros de Ruta:**
- `id`: number (ID de la quiniela)

Respuesta: Retorna el resultado de la operación de eliminación.

---

## Módulo: PredictionsController
Controlador para la gestión de predicciones.

### Endpoints

#### `POST /api/predictions`
Descripción: Crea una nueva predicción.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)

**Cuerpo de la Solicitud (Request Body): `CreatePredictionDto`**
```json
{
  "prediction": "home" | "draw" | "away", // Predicción del resultado
  "points": 0,                            // (Opcional) Puntos obtenidos por la predicción
  "userId": 0,                            // ID del usuario que realiza la predicción
  "matchId": 0,                           // ID del partido al que se refiere la predicción
  "poolId": 0                             // ID de la quiniela a la que pertenece la predicción
}
```
Respuesta: Retorna el objeto de la predicción creada.

#### `GET /api/predictions`
Descripción: Obtiene todas las predicciones.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)
Respuesta: Retorna un array de objetos de predicción.

#### `GET /api/predictions/:id`
Descripción: Obtiene una predicción por su ID.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)

**Parámetros de Ruta:**
- `id`: number (ID de la predicción)

Respuesta: Retorna un objeto de predicción.

#### `PATCH /api/predictions/:id`
Descripción: Actualiza una predicción existente por su ID.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)

**Parámetros de Ruta:**
- `id`: number (ID de la predicción)

**Cuerpo de la Solicitud (Request Body): `UpdatePredictionDto`**
```json
{
  "prediction": "home" | "draw" | "away", // (Opcional) Predicción del resultado
  "points": 0,                            // (Opcional) Puntos obtenidos por la predicción
  "userId": 0,                            // (Opcional) ID del usuario que realiza la predicción
  "matchId": 0,                           // (Opcional) ID del partido al que se refiere la predicción
  "poolId": 0                             // (Opcional) ID de la quiniela a la que pertenece la predicción
}
```
Respuesta: Retorna el objeto de la predicción actualizada.

#### `GET /api/predictions/user/:userId`
Descripción: Obtiene las predicciones realizadas por un usuario específico.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)

**Parámetros de Ruta:**
- `userId`: number (ID del usuario)

Respuesta: Retorna un array de objetos de predicción.

#### `GET /api/predictions/pool/:poolId`
Descripción: Obtiene las predicciones para una quiniela específica.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)

**Parámetros de Ruta:**
- `poolId`: number (ID de la quiniela)

Respuesta: Retorna un array de objetos de predicción.

#### `GET /api/predictions/match/:matchId`
Descripción: Obtiene las predicciones para un partido específico.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)

**Parámetros de Ruta:**
- `matchId`: number (ID del partido)

Respuesta: Retorna un array de objetos de predicción.

#### `DELETE /api/predictions/:id`
Descripción: Elimina una predicción por su ID.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)

**Parámetros de Ruta:**
- `id`: number (ID de la predicción)

Respuesta: Retorna el resultado de la operación de eliminación.

---

## Módulo: RolesController
Controlador para la gestión de roles de usuario.

### Endpoints

#### `POST /api/roles`
Descripción: Crea un nuevo rol.
Requiere autenticación: Sí (SupabaseAuthGuard)

**Cuerpo de la Solicitud (Request Body): `CreateRoleDto`**
```json
{
  "name": "string" // Nombre del rol
}
```
Respuesta: Retorna el objeto del rol creado.

#### `GET /api/roles`
Descripción: Obtiene todos los roles.
Requiere autenticación: Sí (SupabaseAuthGuard)
Respuesta: Retorna un array de objetos de rol.

#### `GET /api/roles/:id`
Descripción: Obtiene un rol por su ID.
Requiere autenticación: Sí (SupabaseAuthGuard)

**Parámetros de Ruta:**
- `id`: number (ID del rol)

Respuesta: Retorna un objeto de rol.

#### `PATCH /api/roles/:id`
Descripción: Actualiza un rol existente por su ID.
Requiere autenticación: Sí (SupabaseAuthGuard)

**Parámetros de Ruta:**
- `id`: number (ID del rol)

**Cuerpo de la Solicitud (Request Body): `UpdateRoleDto`**
```json
{
  "name": "string" // Nuevo nombre del rol
}
```
Respuesta: Retorna el objeto del rol actualizado.

---

## Módulo: TeamsController
Controlador para la gestión de equipos.

### Endpoints

#### `POST /api/teams`
Descripción: Crea un nuevo equipo.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)

**Cuerpo de la Solicitud (Request Body): `CreateTeamDto`**
```json
{
  "name": "string",           // Nombre del equipo
  "logoUrl": "string",        // (Opcional) URL del logo del equipo
  "isActive": true,           // (Opcional) Indica si el equipo está activo
  "confederationId": 0        // ID de la confederación a la que pertenece el equipo
}
```
Respuesta: Retorna el objeto del equipo creado.

#### `GET /api/teams`
Descripción: Obtiene todos los equipos.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)
Respuesta: Retorna un array de objetos de equipo.

#### `GET /api/teams/:id`
Descripción: Obtiene un equipo por su ID.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)

**Parámetros de Ruta:**
- `id`: number (ID del equipo)

Respuesta: Retorna un objeto de equipo.

#### `PATCH /api/teams/:id`
Descripción: Actualiza un equipo existente por su ID.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)

**Parámetros de Ruta:**
- `id`: number (ID del equipo)

**Cuerpo de la Solicitud (Request Body): `UpdateTeamDto`**
```json
{
  "name": "string",           // (Opcional) Nombre del equipo
  "logoUrl": "string",        // (Opcional) URL del logo del equipo
  "isActive": true,           // (Opcional) Indica si el equipo está activo
  "confederationId": 0        // (Opcional) ID de la confederación a la que pertenece el equipo
}
```
Respuesta: Retorna el objeto del equipo actualizado.

#### `DELETE /api/teams/:id`
Descripción: Elimina un equipo por su ID.
Requiere autenticación: No especificado (ver implementación de guardias si aplica)

**Parámetros de Ruta:**
- `id`: number (ID del equipo)

Respuesta: Retorna el resultado de la operación de eliminación.

---

## Módulo: UsersController
Controlador para la gestión de usuarios.

### Endpoints

#### `GET /api/users`
Descripción: Obtiene todos los usuarios.
Requiere autenticación: Sí (SupabaseAuthGuard)
Respuesta: Retorna un array de objetos de usuario.

#### `GET /api/users/:id`
Descripción: Obtiene un usuario por su ID.
Requiere autenticación: Sí (SupabaseAuthGuard)

**Parámetros de Ruta:**
- `id`: number (ID del usuario)

Respuesta: Retorna un objeto de usuario.

#### `PATCH /api/users/:id`
Descripción: Actualiza un usuario existente por su ID.
Requiere autenticación: Sí (SupabaseAuthGuard)

**Parámetros de Ruta:**
- `id`: number (ID del usuario)

**Cuerpo de la Solicitud (Request Body): `UpdateUserDto`**
```json
{
  "email": "string", // Correo electrónico del usuario
  "name": "string"   // Nombre del usuario
}
```
Respuesta: Retorna el objeto del usuario actualizado.

---

## Módulo: AppController
Controlador principal de la aplicación.

### Endpoints

#### `GET /`
Descripción: Página de inicio de la aplicación.
Requiere autenticación: No
Respuesta: Renderiza la vista `pages/home/index.hbs`.

---

## Módulo: AuthController
Controlador para la autenticación de usuarios.

### Endpoints

#### `POST /auth/signup`
Descripción: Registra un nuevo usuario.
Requiere autenticación: No

**Cuerpo de la Solicitud (Request Body): `CreateUserDto`**
```json
{
  "email": "string",    // Correo electrónico del usuario
  "password": "string", // Contraseña del usuario (mínimo 8 caracteres, mayúscula, minúscula, número, carácter especial)
  "name": "string"      // Nombre completo del usuario
}
```
Respuesta: Retorna el resultado del registro del usuario.

#### `POST /auth/signin`
Descripción: Inicia sesión de un usuario.
Requiere autenticación: No

**Cuerpo de la Solicitud (Request Body):**
```json
{
  "email": "string",    // Correo electrónico del usuario
  "password": "string"  // Contraseña del usuario
}
```
Respuesta: Retorna el resultado del inicio de sesión, incluyendo el perfil del usuario.

#### `POST /auth/login`
Descripción: Inicia sesión de un usuario (método alternativo/interno).
Requiere autenticación: No

**Cuerpo de la Solicitud (Request Body):**
```json
{
  "email": "string",    // Correo electrónico del usuario
  "password": "string"  // Contraseña del usuario
}
```
Respuesta: Retorna el resultado del inicio de sesión.

#### `GET /auth/profile`
Descripción: Obtiene el perfil del usuario autenticado.
Requiere autenticación: Sí (SupabaseGuard)
Respuesta: Retorna el perfil del usuario.

#### `POST /auth/signout`
Descripción: Cierra la sesión del usuario autenticado.
Requiere autenticación: Sí (SupabaseGuard)
Respuesta: Retorna el resultado del cierre de sesión.

# 📝 Microservicio REST - Reviews Service

Este proyecto es un microservicio REST diseñado para gestionar las reseñas de libros y listas de lectura dentro de la aplicación FISBook. Permite a los usuarios publicar, editar, eliminar y consultar reseñas a través de una API REST fácil de usar.

---

## ⚙️ **Características Principales**  

- **Gestión de reseñas**: proporciona endpoints REST para crear, modificar, eliminar y consultar reseñas.
  - Usuarios :
      Crear, modificar y eliminar reseñas de libros.
      Escribir reseñas sobre listas de lectura.
      Ver reseñas creadas por otros usuarios.
  - Administradores:
      Acceder a un listado completo de reseñas.
      Editar y eliminar cualquier reseña.
  - Propósito:
      Modularidad y autonomía en la gestión de reseñas.
      Integración fluida con microservicios como el catálogo de libros, gestión de usuarios y listas de lectura.  
- **Persistencia de datos**: utiliza MongoDB como base de datos NoSQL para almacenar las reseñas de forma eficiente.
- **Documentación interactiva**: Swagger facilita la visualización y prueba de los endpoints.  
- **Pruebas automatizadas**: incluye pruebas unitarias e integrales con Jest y Supertest.  
- **Dockerización**: empaquetado y despliegue en contenedores Docker para facilitar la escalabilidad.  
- **Control de acceso**: implementación de autenticación y autorización con JWT.  
- **Configuración segura de CORS**: habilitado para gestionar solicitudes desde dominios autorizados.  

---

## 📋 **Endpoints Disponibles**  

1. **Estado del servicio**  
   - **GET /api/v1/reviews/healthz**  
     Verifica si el microservicio está operativo.  
     - **200**: Servicio saludable.  
     - **500**: Error interno.  

2. **Reseñas de libros**  
   - **GET /api/v1/reviews/books**: Obtiene todas las reseñas de libros.  
   - **GET /api/v1/reviews/books/:bookID**: Recupera las reseñas de un libro específico.  
   - **POST /api/v1/reviews/books**: Crea una reseña de libro.  
     - **Cuerpo**: `{ user_id, book_id, score, title, comment }`  
   - **PUT /api/v1/reviews/books/:reviewID**: Actualiza una reseña específica.  
   - **DELETE /api/v1/reviews/books/:reviewID**: Elimina una reseña de libro.  

3. **Reseñas de listas de lectura**  
   - **GET /api/v1/reviews/reading_lists**: Obtiene todas las reseñas de listas de lectura.  
   - **GET /api/v1/reviews/reading_lists/:listID**: Recupera las reseñas de una lista de lectura específica.  
   - **POST /api/v1/reviews/reading_lists**: Crea una reseña de lista de lectura.  
     - **Cuerpo**: `{ user_id, list_id, score, comment }`  
   - **PUT /api/v1/reviews/reading_lists/:reviewID**: Actualiza una reseña específica.  
   - **DELETE /api/v1/reviews/reading_lists/:reviewID**: Elimina una reseña de lista de lectura.  

4. **Reseñas por usuario**  
   - **GET /api/v1/reviews/users/:userID/books**: Obtiene todas las reseñas de libros realizadas por un usuario.  
   - **GET /api/v1/reviews/users/:userID/reading_lists**: Obtiene todas las reseñas de listas de lectura realizadas por un usuario.
     
Para explorar y probar todos los endpoints de esta API REST, puedes acceder a la documentación interactiva generada con Swagger en la siguiente URL: http://57.152.88.187/api/v1/reviews/api-docs/

---

## 🛠️ **Tecnologías y Herramientas Usadas**  

- **Node.js**: Plataforma de desarrollo para ejecutar el microservicio.  
- **Express.js**: Framework para construir APIs REST.  
- **MongoDB + Mongoose**: Base de datos NoSQL y ORM para modelar los datos.  
- **Swagger**: Generación automática de documentación interactiva.  
- **Docker**: Contenedorización para un despliegue ágil y escalable.  
- **Jest + Supertest**: Pruebas unitarias e integrales.  
- **dotenv**: Gestión de variables de entorno.  
- **CORS**: Configuración segura para solicitudes entre dominios.  

---

## 📦 **Estructura del Proyecto**  

- **`authentication/`**:authenticateAndAuthorize.js: Contiene middlewares de autenticación y autorización (e.g., validación de JWT).
- **`bin/`**:Archivos necesarios para inicializar el servidor, como el script de arranque principal.
- **`documentacion/`**:Contiene toda la documentación requerida para este proyecto.
- **`models/`**: Esquemas de datos para las reseñas.
    - book_review.js: Modelo de reseñas de libros utilizando Mongoose.
    - reading_list_review.js: Modelo de reseñas para listas de lectura
- **`routes/`**: Rutas de la API organizadas por funcionalidad.
    - reviews.js: Define los endpoints REST relacionados con las reseñas.
- **`services/`**:
    - util_services.js: Lógica de negocio, como cálculos de puntuaciones promedio o validaciones adicionales.
- **`tests/`**: Pruebas automatizadas.
    - integration/db-integration.test.js: Pruebas de integración para la base de datos.
    - api.test.js: Pruebas de los endpoints de la API con Jest y Supertest.
- **`app.js`**: Archivo principal para configurar la aplicación Express y el middleware.
- **`db.js`**: Configuración y conexión con MongoDB Atlas. 
- **`Dockerfile`**: Configuración para crear el contenedor Docker.
- **`package.json`**: Gestión de dependencias y scripts del proyecto.

---

## 🔐 **Autenticación y Seguridad**  

- **JWT**: Gestión de autenticación y autorización.  
- **Roles de usuario**: Control de acceso para usuarios estándar y administradores.  
- **Validación**: Uso de middleware para verificar tokens y permisos.  

---

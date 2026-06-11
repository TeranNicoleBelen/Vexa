# 🌸 VEXA — Tienda de Limpieza & Belleza

Sistema completo de e-commerce para tienda de artículos de limpieza y belleza.

---

## 🚀 Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18, React Router v6, Chart.js, React-Toastify |
| Backend | Node.js, Express.js |
| Base de datos | MySQL 8 (XAMPP) |
| Auth | JWT, bcrypt, CAPTCHA (svg-captcha) |
| PDF | PDFKit |
| Archivos | Multer |
| Deploy | Docker, Kubernetes |

---

## 📁 Estructura del Proyecto

```
vexa/
├── backend/          # API Node.js/Express
│   ├── src/
│   │   ├── config/   # Conexión BD
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── utils/
│   ├── uploads/      # Imágenes subidas
│   ├── .env
│   └── package.json
├── frontend/         # React App
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── utils/
│   └── package.json
├── database/
│   └── vexa_db.sql   # Script SQL completo
├── docker-compose.yml
├── kubernetes/
│   └── vexa-k8s.yaml
└── README.md
```

---

## ⚡ Inicio Rápido (Windows + XAMPP)

### 1. Prerequisitos
- [Node.js 18+](https://nodejs.org)
- [XAMPP](https://www.apachefriends.org) (MySQL + Apache)
- [Visual Studio Code](https://code.visualstudio.com)
- [Git](https://git-scm.com)

### 2. Configurar Base de Datos
1. Iniciar XAMPP → Start **Apache** y **MySQL**
2. Abrir `http://localhost/phpmyadmin`
3. Crear base de datos `vexa_db`
4. Importar el archivo `database/vexa_db.sql`

### 3. Configurar Backend
```bash
cd vexa/backend
npm install
```
Editar `.env` si es necesario (por defecto funciona con XAMPP):
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=          # vacío en XAMPP por defecto
DB_NAME=vexa_db
```
Luego ejecutar:
```bash
npm run dev
```
El backend correrá en `http://localhost:5000`

### 4. Configurar Frontend
```bash
cd vexa/frontend
npm install
npm start
```
El frontend correrá en `http://localhost:3000`

---

## 👤 Cuentas de Prueba

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Admin | admin@vexa.com | Admin@123 |
| Vendedor | vendedor@vexa.com | Admin@123 |
| Cliente | cliente@vexa.com | Admin@123 |

> ⚠️ Los hashes en la BD fueron generados con bcrypt. Si no funcionan, crear usuarios nuevos desde el panel admin o desde el formulario de registro.

### Regenerar contraseñas (ejecutar en Node):
```js
const bcrypt = require('bcrypt');
bcrypt.hash('Admin@123', 10).then(h => console.log(h));
// Luego actualizar en BD: UPDATE usuarios SET password='...' WHERE email='admin@vexa.com';
```

---

## 🐳 Docker

### Levantar todo con Docker Compose:
```bash
# En la raíz del proyecto
docker-compose up --build -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

### Accesos:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MySQL: localhost:3307

### Build imágenes individuales:
```bash
# Backend
docker build -t vexa-backend ./backend

# Frontend
docker build -t vexa-frontend ./frontend
```

---

## ☸️ Kubernetes

### Prerequisitos:
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Minikube](https://minikube.sigs.k8s.io/) (para local)
- O un cluster cloud (GKE, EKS, AKS)

### Desplegar en Minikube:
```bash
# Iniciar Minikube
minikube start

# Cargar imágenes locales
eval $(minikube docker-env)
docker build -t vexa-backend:latest ./backend
docker build -t vexa-frontend:latest ./frontend

# Aplicar manifiestos
kubectl apply -f kubernetes/vexa-k8s.yaml

# Ver estado
kubectl get pods -n vexa
kubectl get services -n vexa

# Acceder al frontend
minikube service vexa-frontend-service -n vexa
```

### Comandos útiles:
```bash
# Ver logs del backend
kubectl logs -f deployment/vexa-backend -n vexa

# Escalar backend
kubectl scale deployment vexa-backend --replicas=4 -n vexa

# Eliminar todo
kubectl delete namespace vexa
```

---

## 📱 Dispositivo Móvil

La aplicación es completamente **responsive** y funciona en:
- 📱 Smartphones (iOS / Android) — via navegador móvil
- 📟 Tablets
- 💻 Desktop

Para acceder desde móvil en la misma red WiFi:
1. Obtener IP de tu PC: `ipconfig` en Windows → IPv4
2. Editar `frontend/src/utils/api.js`:
   ```js
   const API_URL = 'http://TU-IP-LOCAL:5000/api';
   ```
3. Acceder desde móvil: `http://TU-IP-LOCAL:3000`

---

## 🔧 API Endpoints

### Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/auth/captcha | Generar CAPTCHA |
| POST | /api/auth/login | Iniciar sesión |
| POST | /api/auth/register | Registrarse |
| POST | /api/auth/logout | Cerrar sesión |
| GET | /api/auth/me | Usuario actual |
| POST | /api/auth/check-password | Verificar fortaleza |

### Productos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/productos | Listar todos |
| GET | /api/productos/:id | Ver uno |
| POST | /api/productos | Crear (admin/vendedor) |
| PUT | /api/productos/:id | Actualizar |
| DELETE | /api/productos/:id | Eliminar lógico |

### Pedidos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/pedidos | Listar pedidos |
| GET | /api/pedidos/:id | Ver detalle |
| POST | /api/pedidos | Crear pedido |
| PUT | /api/pedidos/:id/estado | Cambiar estado |
| DELETE | /api/pedidos/:id | Eliminar lógico |

### Reportes PDF
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/reportes/pedido/:id | Ticket PDF |
| GET | /api/reportes/ventas | Reporte ventas |

### Estadísticas
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/estadisticas/dashboard | Resumen general |
| GET | /api/estadisticas/ventas-por-mes | Ventas mensuales |
| GET | /api/estadisticas/productos-mas-vendidos | Top productos |
| GET | /api/estadisticas/clientes-top | Mejores clientes |
| GET | /api/estadisticas/ventas-por-categoria | Por categoría |

---

## ✅ Funcionalidades Implementadas

- [x] Menú de navegación completo (tienda, categorías, admin)
- [x] CRUD completo de Productos (con eliminación lógica)
- [x] CRUD completo de Categorías (con eliminación lógica)
- [x] CRUD completo de Usuarios (con eliminación lógica)
- [x] CRUD completo de Pedidos (con eliminación lógica)
- [x] Frontend en React con animaciones
- [x] Backend en Node.js/Express
- [x] Validaciones en todos los formularios
- [x] Reporte PDF de tickets y ventas
- [x] Gráficas estadísticas (Bar, Line, Doughnut)
- [x] Autenticación con JWT y roles (admin, vendedor, cliente)
- [x] CAPTCHA en login
- [x] Evaluación de fortaleza de contraseña
- [x] Contraseñas encriptadas con bcrypt
- [x] Log de acceso (usuario, IP, evento, browser, fecha/hora)
- [x] Log de actividad (todas las acciones del sistema)
- [x] Subida de imágenes de productos y categorías
- [x] Carrito de compras
- [x] Checkout con QR, tarjeta o efectivo
- [x] Selección de envío a domicilio o recogida en tienda
- [x] Envío gratis en pedidos mayores a 200 Bs
- [x] Agente IA "Luna" integrado
- [x] Página de inicio animada
- [x] Página "Nosotros" con info de la empresa
- [x] Diseño responsive para móvil, tablet y desktop
- [x] Docker Compose configurado
- [x] Kubernetes manifests configurados
- [x] Panel de admin completo
- [x] Panel de vendedor completo
- [x] Panel de cliente con historial de pedidos

---

## 🎨 Colores

| Nombre | Hex |
|--------|-----|
| Rosa Pastel | #FFB6C1 |
| Rosa Oscuro | #E8637A |
| Coral Claro | #FFDAB9 |
| Coral | #FF8C69 |
| Negro | #1A1A1A |
| Blanco | #FFFFFF |

---

## 📞 Empresa (Datos Ficticios)

**VEXA** - Limpieza & Belleza  
📍 Av. Principal 123, Zona Central, La Paz, Bolivia  
📞 +591 2 123-4567  
📧 contacto@vexa.com.bo  
🌐 www.vexa.com.bo  
⏰ Lun–Sáb: 8:00 – 20:00

---

## 🤝 Equipo

Desarrollado como proyecto académico.

---

*VEXA © 2024 — Todos los derechos reservados*

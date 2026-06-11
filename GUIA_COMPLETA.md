# 📖 GUÍA COMPLETA DE INSTALACIÓN — VEXA

---

## ✅ PASO 1 — Instalar prerequisitos

Instala estos programas si no los tienes:

| Programa | Link | Para qué |
|----------|------|----------|
| Node.js 18+ | https://nodejs.org | Ejecutar backend y frontend |
| XAMPP | https://apachefriends.org | Base de datos MySQL |
| Visual Studio Code | https://code.visualstudio.com | Editor de código |
| Git | https://git-scm.com | Control de versiones |

---

## ✅ PASO 2 — Configurar la Base de Datos

1. **Abre XAMPP Control Panel**
2. Haz click en **Start** en Apache y MySQL
3. Abre tu navegador y ve a: `http://localhost/phpmyadmin`
4. En el menú izquierdo, haz click en **"Nueva"** (o "New")
5. Escribe el nombre: `vexa_db` y haz click en **Crear**
6. Con `vexa_db` seleccionada, haz click en la pestaña **Importar**
7. Haz click en **"Seleccionar archivo"** y elige `database/vexa_db.sql`
8. Haz click en **Continuar** (o "Go")
9. Verás el mensaje ✅ "Importación correcta"

---

## ✅ PASO 3 — Instalar dependencias

Abre **Visual Studio Code**, luego abre la carpeta VEXA.

Abre la terminal integrada (`Ctrl + ñ` o `Ctrl + backtick`) y ejecuta:

```bash
# Instalar dependencias del Backend
cd backend
npm install
cd ..

# Instalar dependencias del Frontend
cd frontend
npm install
cd ..
```

⚠️ Este proceso puede tardar 2-5 minutos, es normal.

---

## ✅ PASO 4 — Resetear contraseñas de usuarios

Desde la carpeta raíz (VEXA), ejecuta:

```bash
node database/reset_passwords.js
```

Deberías ver:
```
✅ Password actualizado: admin@vexa.com
✅ Password actualizado: vendedor@vexa.com
✅ Password actualizado: cliente@vexa.com
🎉 Listo!
```

---

## ✅ PASO 5 — Arrancar el proyecto

**Necesitas 2 terminales abiertas al mismo tiempo.**

### Terminal 1 — Backend:
```bash
cd backend
npm run dev
```
Deberías ver:
```
✅ Conexión a MySQL establecida correctamente
VEXA Backend API corriendo en puerto 5000
```

### Terminal 2 — Frontend:
```bash
cd frontend
npm start
```
Se abrirá automáticamente `http://localhost:3000` en tu navegador.

---

## ✅ PASO 6 — Verificar que todo funciona

- Abre `http://localhost:5000/health` → deberías ver `{"status":"ok"}`
- Abre `http://localhost:3000` → verás la tienda VEXA

### Credenciales de acceso:

| Rol | Email | Contraseña |
|-----|-------|-----------|
| 👑 Admin | admin@vexa.com | Admin@123 |
| 🏪 Vendedor | vendedor@vexa.com | Admin@123 |
| 👤 Cliente | cliente@vexa.com | Admin@123 |

---

## 🤖 PASO 7 — Activar el Chatbot (Agente Luna)

El chatbot Luna usa la API de Claude de Anthropic.

### Opción A — Con API Key (recomendado):
1. Crea una cuenta en https://console.anthropic.com
2. Ve a "API Keys" y crea una nueva key
3. Copia la key (empieza con `sk-ant-...`)
4. Abre `frontend/src/components/shared/AgenteIA.js`
5. Busca la línea con `fetch('https://api.anthropic.com/v1/messages'`
6. Agrega el header de autorización:
   ```js
   headers: {
     'Content-Type': 'application/json',
     'x-api-key': 'TU_API_KEY_AQUI',
     'anthropic-version': '2023-06-01',
     'anthropic-dangerous-direct-browser-access': 'true'
   }
   ```

### Opción B — Sin API Key (chatbot simple):
Si no quieres usar la API, el chatbot igual funciona pero responderá mensajes predefinidos.
Puedes modificar `AgenteIA.js` para usar respuestas locales sin necesidad de API.

---

## 🖼️ PASO 8 — Agregar imágenes a productos

### Desde el Panel Admin (recomendado):
1. Inicia sesión como admin: `admin@vexa.com` / `Admin@123`
2. Ve al menú **Productos** en el panel
3. Haz click en **✏️ Editar** en cualquier producto
4. En el modal verás la sección de imagen con el ícono 📷
5. Haz click ahí y selecciona una imagen desde tu PC
6. Formatos permitidos: **JPG, PNG, GIF, WEBP** (máximo 5MB)
7. Haz click en **💾 Guardar**

### Las imágenes se guardan en:
```
backend/uploads/
```

### Para agregar imágenes desde el inicio (nuevos productos):
1. Panel Admin → Productos → **+ Nuevo Producto**
2. Completa todos los campos
3. Haz click en el área de imagen y sube tu foto
4. Guarda

---

## 📄 PASO 9 — Descargar tickets PDF

Ahora el PDF funciona correctamente. Para descargar un ticket:
1. Inicia sesión como cliente
2. Haz un pedido
3. En la página de confirmación, haz click en **📄 Descargar Ticket PDF**

O desde el panel Admin:
- Pedidos → Ver pedido → **📄 Descargar PDF**
- Estadísticas → **📄 Exportar Reporte PDF**

---

## 🐳 PASO 10 — Docker (opcional)

Si tienes Docker instalado:

```bash
# Desde la carpeta VEXA
docker-compose up --build -d

# Ver que todo funcione
docker-compose ps

# Ver logs
docker-compose logs -f backend
```

Accesos con Docker:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

---

## ☸️ PASO 11 — Kubernetes (opcional)

```bash
# Iniciar Minikube
minikube start

# Cargar imágenes
eval $(minikube docker-env)
docker build -t vexa-backend:latest ./backend
docker build -t vexa-frontend:latest ./frontend

# Desplegar
kubectl apply -f kubernetes/vexa-k8s.yaml

# Ver estado
kubectl get pods -n vexa

# Acceder
minikube service vexa-frontend-service -n vexa
```

---

## 📱 PASO 12 — Acceso desde Móvil

1. Asegúrate que tu PC y móvil estén en la **misma red WiFi**
2. En tu PC, ejecuta en CMD: `ipconfig`
3. Busca tu **Dirección IPv4** (ej: 192.168.1.100)
4. Desde tu móvil, abre el navegador y ve a: `http://192.168.1.100:3000`

---

## ❓ Problemas frecuentes

### "No puedo iniciar sesión"
→ Ejecuta: `node database/reset_passwords.js`

### "Error de conexión a MySQL"
→ Verifica que XAMPP tenga MySQL activo (botón verde)
→ Verifica que `backend/.env` tenga `DB_PASSWORD=` (vacío para XAMPP por defecto)

### "El backend no arranca"
→ Verifica que el puerto 5000 esté libre
→ Verifica que hayas ejecutado `npm install` en la carpeta backend

### "El frontend muestra pantalla en blanco"
→ Verifica que el backend esté corriendo (`http://localhost:5000/health`)
→ Revisa la consola del navegador (F12 → Console)

### "El PDF dice token no proporcionado"
→ Cierra sesión y vuelve a iniciar sesión (el token puede haber expirado)

---

## 📞 Datos de la tienda (ya configurados)

- **Nombre:** VEXA — Limpieza & Belleza
- **Dirección:** Mercado Ciudad Satélite, El Alto, Bolivia
- **Teléfono 1:** +591 60612998
- **Teléfono 2:** +591 73503017
- **Email:** terannicole06@gmail.com
- **Horario:** Lun–Sáb 8:00–20:00

---

*VEXA © 2024 — Proyecto Académico*

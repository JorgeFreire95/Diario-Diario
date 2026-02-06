# 📔 Diario-Diario

Una aplicación de diario personal inteligente, moderna y segura, potenciada por inteligencia artificial de voz y diseñada con una estética vibrante y fluida.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

## ✨ Características Principales

### 🧠 Asistente de Voz Inteligente
Interactúa con tu diario sin tocar la pantalla. El asistente te escucha y responde:
-   **Creación por voz**: Di *"Crear nota hoy me sentí feliz"* y se guardará automáticamente.
-   **Lectura de recuerdos**: Pídele *"Leer notas de hoy"* o *"Leer notas del 5 de febrero"*.
-   **Edición y mantenimiento**: Comandos para *"Modificar última nota"* o *"Borrar última nota"*.
-   **Saludo Personalizado**: Te saluda por tu nombre al iniciar.

### 📝 Multimedia y Rico en Contenido
-   **Texto Transcrito**: Todo lo que dices se convierte en texto automáticamente.
-   **Grabación de Audio**: Guarda el audio original de tu voz para escuchar la emoción del momento.
-   **Soporte de Imágenes**: Sube fotos a tus recuerdos. Incluye compresión automática inteligente para ahorrar espacio.
-   **Fecha y Hora Automática**: Cada recuerdo registra el momento exacto de su creación.

### 🔐 Seguridad y Nube
-   **Autenticación Robusta**: Sistema de Login y Registro seguro mediante Firebase Auth.
-   **Datos en la Nube**: Todos tus recuerdos (texto, audio y fotos) se guardan en Firebase Firestore, accesibles desde cualquier dispositivo.
-   **Privacidad**: Solo tú puedes acceder a tus propios recuerdos.

### 🎨 Diseño y Experiencia de Usuario (UI/UX)
-   **Estética "Sunset Vibes"**: Un diseño moderno con gradientes vibrantes (Púrpura/Magenta) y efectos de vidrio (Glassmorphism).
-   **Animaciones Fluidas**: Integración de `Framer Motion` para transiciones suaves y agradables.
-   **Diseño Mobile-First**: Perfectamente optimizado para funcionar como una app en tu teléfono.

---

## 🛠️ Tecnologías Utilizadas

### Frontend
-   **React.js**: Librería principal para la interfaz de usuario.
-   **Vite**: Empaquetador ultra-rápido para desarrollo y construcción via `npm`.
-   **Framer Motion**: Para animaciones complejas y gestos.
-   **Lucide React**: Set de iconos ligeros y modernos.
-   **Web Speech API**:
    -   `SpeechRecognition`: Para convertir voz a texto.
    -   `SpeechSynthesis`: Para que el asistente "hable" (TTS).
-   **Canvas API**: Para compresión y redimensionado de imágenes en el cliente.
-   **MediaRecorder API**: Para la captura de audio nativa.

### Backend (Serverless)
-   **Firebase Authentication**: Gestión de usuarios.
-   **Firebase Firestore**: Base de datos NoSQL en tiempo real.

### Estilos
-   **CSS3 Variables**: Para un sistema de diseño consistente y temático.
-   **Diseño Responsivo**: Adaptable a móviles y escritorio.

---

## 🚀 Instalación y Ejecución

1.  **Clonar el repositorio**
    ```bash
    git clone https://github.com/tu-usuario/Diario-Diario.git
    cd Diario-Diario
    ```

2.  **Instalar dependencias**
    ```bash
    npm install
    ```

3.  **Configurar Firebase**
    -   Crea un proyecto en [Firebase Console](https://console.firebase.google.com/).
    -   Habilita **Authentication** (Email/Password).
    -   Habilita **Firestore Database**.
    -   Crea un archivo `src/firebaseConfig.js` con tus credenciales:
        ```javascript
        import { initializeApp } from "firebase/app";
        // ... (tus imports de auth/firestore)

        const firebaseConfig = {
          apiKey: "TU_API_KEY",
          authDomain: "TU_PROYECTO.firebaseapp.com",
          projectId: "TU_PROYECTO",
          // ...
        };
        // ...
        ```

4.  **Correr el proyecto**
    ```bash
    npm run dev
    ```

---

## 🗣️ Comandos de Voz Disponibles

Simplemente pulsa el micrófono del asistente y di:

| Acción | Comandos Ejemplo |
|--------|------------------|
| **Crear** | *"Crear nota comprar leche"*, *"Anotar ir al dentista"* |
| **Leer** | *"Leer notas de hoy"*, *"Buscar recuerdos de ayer"*, *"Notas del 10 de marzo"* |
| **Borrar** | *"Borrar última nota"*, *"Eliminar recuerdos de hoy"* |
| **Modificar** | *"Cambiar última nota"*, *"Corregir última nota"* |

---

Hecho con 💜 por Jorge (y su Asistente IA).

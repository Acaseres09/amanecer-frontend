# Mensajes que iluminan — PWA minimalista (Modo noche)

Esta es una versión minimalista, en español, preparada como PWA. Incluye:

- Interfaz simple en modo noche.
- Botón para activar notificaciones (se solicitará permiso).
- Archivo `sw.js` (service worker) y `manifest.json` para instalar como PWA.
- 365 mensajes generados dinámicamente en `src/messages.js`.

## Importante — Limitaciones de las notificaciones programadas

Los navegadores no permiten (a día de hoy) programar notificaciones exactas para horas futuras **sin** usar un servidor que envíe Push (Web Push). Algunas APIs experimentales (Notification Triggers) existen en Chrome, pero no están ampliamente disponibles.

Por esto hay dos opciones para notificaciones fiables cuando la app está cerrada o el navegador no está activo:
1. **Web Push (recomendado):** desplegar un pequeño backend que envíe push a cada usuario en los horarios deseados (9:30 AM y 9:30 PM hora Argentina). Esto es robusto y funciona aunque la app esté cerrada.
2. **En-app scheduling (actual):** el código intenta usar APIs experimentales y muestra notificaciones cuando la app está abierta o cuando el navegador decide ejecutar el service worker. No es 100% garantizado para todos los usuarios ni todos los navegadores.

## Cómo ejecutar localmente

1. `npm install`
2. `npm run dev`
3. Abrir `http://localhost:5173` (o el puerto que indique Vite)
4. Aceptar permisos de notificación y, si quieres, instalar la PWA desde el navegador.

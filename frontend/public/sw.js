/* Service Worker (simple) - Refinado para evitar duplicados en 'message' */

self.addEventListener('install', (ev) => {
  self.skipWaiting();
});

self.addEventListener('activate', (ev) => {
  self.clients.claim();
});

async function showNotification(title, body, tag){
  const opts = {
    body,
    tag,
    badge: '/icons/icon-192.png',
    icon: '/icons/icon-192.png',
    data: { time: Date.now() }
  };
  
  // Se intenta mostrar la notificación usando showNotification
  // Opcionalmente, se podría reintentar con showTrigger si se usa esa API experimental.
  self.registration.showNotification(title, opts);
}

// ⬅️ ESCUCHA MENSAJES DE LA PÁGINA (Botón "Activar notificaciones")
self.addEventListener('message', async (ev) => {
  const data = ev.data || {};
  const CONFIRM_TAG = 'subscription-confirmation'; // Etiqueta única para la confirmación

  if (data && data.type === 'schedule-notifications') {
    // 1. Verificar si la notificación de confirmación ya está visible
    const notifications = await self.registration.getNotifications({ tag: CONFIRM_TAG });
    
    // Si no hay notificaciones con esta etiqueta, muestra una nueva.
    if (notifications.length === 0) {
      showNotification(
        'Notificaciones activadas', 
        'Recibirás mensajes a las 9:30 AM (hora Argentina)', // Mensaje ajustado para 1 hora
        CONFIRM_TAG // Usar la etiqueta única
      );
    }
  }
});

// 🚀 ESCUCHA LAS NOTIFICACIONES PUSH DEL BACKEND
self.addEventListener('push', (event) => {
  // El payload (datos) que enviaste desde el backend con webpush.sendNotification
  const data = event.data?.json() || {}; 
  
  const title = data.title || 'Mensaje de Amanecer';
  const body = data.body || 'Nuevo mensaje diario disponible.';
  const tag = 'daily-message'; // Se usa una etiqueta diferente para el mensaje diario

  event.waitUntil(
    showNotification(title, body, tag)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.matchAll({type:'window'}).then( windowClients => {
    for (let i = 0; i < windowClients.length; i++) {
      const client = windowClients[i];
      if (client.url === '/' && 'focus' in client) return client.focus();
    }
    if (clients.openWindow) return clients.openWindow('/');
  }));
});
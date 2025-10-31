importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDPrn-LE2g6cJhR2ps4uZPztCI6ez-zKSw",
  authDomain: "comittly.firebaseapp.com",
  projectId: "comittly",
  storageBucket: "comittly.firebasestorage.app",
  messagingSenderId: "716293062416",
  appId: "1:716293062416:web:5bf8bfcca94960b9a6ef95"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/Comittly-logo.png',
    badge: '/icon-192x192.png',
    tag: 'commitly-notification',
    requireInteraction: true,
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'view',
        title: 'View'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
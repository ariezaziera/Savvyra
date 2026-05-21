// worker/index.js
self.addEventListener("push", (event) => {
  if (!event.data) return;
  let data = {};
  try { data = event.data.json(); } catch { data = { title: "Savvyra", body: event.data.text() }; }
  const { title = "Savvyra", body = "", data: extraData = {} } = data;
  event.waitUntil(
    self.registration.showNotification(title, {
      body, icon: "/logo2.png", badge: "/logo2.png",
      vibrate: [100, 50, 100], data: extraData,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes(self.location.origin) && "focus" in client)
          return client.focus();
      }
      if (clients.openWindow) return clients.openWindow("/");
    })
  );
});
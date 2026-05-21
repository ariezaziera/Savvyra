if(!self.define){let e,i={};const s=(s,r)=>(s=new URL(s+".js",r).href,i[s]||new Promise(i=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=i,document.head.appendChild(e)}else e=s,importScripts(s),i()}).then(()=>{let e=i[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e}));self.define=(r,a)=>{const n=e||("document"in self?document.currentScript.src:"")||location.href;if(i[n])return;let t={};const c=e=>s(e,n),d={module:{uri:n},exports:t,require:c};i[n]=Promise.all(r.map(e=>d[e]||c(e))).then(e=>(a(...e),t))}}define(["./workbox-86a8e45e"],function(e){"use strict";importScripts("fallback-IrI6jdixHjKvr3ixxjhF4.js"),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/Savvyra_Clean.txt",revision:"061743dc190b1f4ceba5a23ceaeb1b78"},{url:"/_next/app-build-manifest.json",revision:"e97812ab10dadc121654ce1783e4ce43"},{url:"/_next/static/IrI6jdixHjKvr3ixxjhF4/_buildManifest.js",revision:"15e671aaf852983909bd2fe1385b56f4"},{url:"/_next/static/IrI6jdixHjKvr3ixxjhF4/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/chunks/326-7d9c7a9527515147.js",revision:"IrI6jdixHjKvr3ixxjhF4"},{url:"/_next/static/chunks/413-ec1ce5ba5dd68cff.js",revision:"IrI6jdixHjKvr3ixxjhF4"},{url:"/_next/static/chunks/472-ee2bb4af09473979.js",revision:"IrI6jdixHjKvr3ixxjhF4"},{url:"/_next/static/chunks/58-b1a2a5896f50ca3c.js",revision:"IrI6jdixHjKvr3ixxjhF4"},{url:"/_next/static/chunks/app/commitments/page-44198be2c9759a59.js",revision:"IrI6jdixHjKvr3ixxjhF4"},{url:"/_next/static/chunks/app/layout-c4bb08d90c4c496c.js",revision:"IrI6jdixHjKvr3ixxjhF4"},{url:"/_next/static/chunks/app/login/page-8641b524967dfeff.js",revision:"IrI6jdixHjKvr3ixxjhF4"},{url:"/_next/static/chunks/app/not-found-7ac9ecddda3b038c.js",revision:"IrI6jdixHjKvr3ixxjhF4"},{url:"/_next/static/chunks/app/offline/page-9ff68fb9a32282c2.js",revision:"IrI6jdixHjKvr3ixxjhF4"},{url:"/_next/static/chunks/app/onboarding/page-c513fc8a2388a4be.js",revision:"IrI6jdixHjKvr3ixxjhF4"},{url:"/_next/static/chunks/app/page-197f52584a1d7690.js",revision:"IrI6jdixHjKvr3ixxjhF4"},{url:"/_next/static/chunks/app/register/page-d04c69c6fc853b95.js",revision:"IrI6jdixHjKvr3ixxjhF4"},{url:"/_next/static/chunks/app/savings/page-b78689bca56734fa.js",revision:"IrI6jdixHjKvr3ixxjhF4"},{url:"/_next/static/chunks/app/settings/page-fa0c08a8666d6134.js",revision:"IrI6jdixHjKvr3ixxjhF4"},{url:"/_next/static/chunks/app/transactions/page-5d1a74d18d0001a6.js",revision:"IrI6jdixHjKvr3ixxjhF4"},{url:"/_next/static/chunks/fd9d1056-48cb292f593715a8.js",revision:"IrI6jdixHjKvr3ixxjhF4"},{url:"/_next/static/chunks/framework-43665103d101a22d.js",revision:"IrI6jdixHjKvr3ixxjhF4"},{url:"/_next/static/chunks/main-88f621270feff8f4.js",revision:"IrI6jdixHjKvr3ixxjhF4"},{url:"/_next/static/chunks/main-app-532d0595b2a7d9ad.js",revision:"IrI6jdixHjKvr3ixxjhF4"},{url:"/_next/static/chunks/pages/_app-451d704a741dc8a8.js",revision:"IrI6jdixHjKvr3ixxjhF4"},{url:"/_next/static/chunks/pages/_error-d6885ef27f2c5e3d.js",revision:"IrI6jdixHjKvr3ixxjhF4"},{url:"/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js",revision:"837c0df77fd5009c9e46d446188ecfd0"},{url:"/_next/static/chunks/webpack-0b6292a4fe803bd3.js",revision:"IrI6jdixHjKvr3ixxjhF4"},{url:"/_next/static/css/06d29dd7ddcffb43.css",revision:"06d29dd7ddcffb43"},{url:"/_next/static/media/19cfc7226ec3afaa-s.woff2",revision:"9dda5cfc9a46f256d0e131bb535e46f8"},{url:"/_next/static/media/21350d82a1f187e9-s.woff2",revision:"4e2553027f1d60eff32898367dd4d541"},{url:"/_next/static/media/8e9860b6e62d6359-s.woff2",revision:"01ba6c2a184b8cba08b0d57167664d75"},{url:"/_next/static/media/ba9851c3c22cd980-s.woff2",revision:"9e494903d6b0ffec1a1e14d34427d44d"},{url:"/_next/static/media/c5fe6dc8356a8c31-s.woff2",revision:"027a89e9ab733a145db70f09b8a18b42"},{url:"/_next/static/media/df0a9ae256c0569c-s.woff2",revision:"d54db44de5ccb18886ece2fda72bdfe0"},{url:"/_next/static/media/e4af272ccee01ff0-s.p.woff2",revision:"65850a373e258f1c897a2b3d75eb74de"},{url:"/favicon.ico",revision:"2d22d4cb0b3be72937ef4402a6ea61b5"},{url:"/logo.png",revision:"aa9609a1fe21458f3bff28e5b9a8366d"},{url:"/logo192.png",revision:"01e4305358fd6c0290606e11483a69d3"},{url:"/logo2.png",revision:"bfa202e4b716444028c33aadb917bda6"},{url:"/logo512.png",revision:"e556a0c55dff7d7156e0b2a9cb17f0c0"},{url:"/next.svg",revision:"8e061864f388b47f33a1c3780831193e"},{url:"/offline",revision:"IrI6jdixHjKvr3ixxjhF4"},{url:"/screenshots/desktop.png",revision:"41912df34df9b120397baae4ebee6ee4"},{url:"/screenshots/mobile.png",revision:"9921731e9fda9cb66a7ca4a729817ae5"},{url:"/text.txt",revision:"8b1a9953c4611296a827abf8c47804d7"},{url:"/vercel.svg",revision:"61c6b19abff40ea7acd577be818f3976"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:i,event:s,state:r})=>i&&"opaqueredirect"===i.type?new Response(i.body,{status:200,statusText:"OK",headers:i.headers}):i},{handlerDidError:async({request:e})=>self.fallback(e)}]}),"GET"),e.registerRoute(/^https?.*/,new e.NetworkFirst({cacheName:"offlineCache",networkTimeoutSeconds:5,plugins:[{handlerDidError:async({request:e})=>self.fallback(e)}]}),"GET")});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data = {};
  try { data = event.data.json(); } catch { data = { title: "Savvyra", body: event.data.text() }; }

  const { title = "Savvyra", body = "", data: extraData = {} } = data;

  const options = {
    body,
    icon:   "/logo2.png",
    badge:  "/logo2.png",
    vibrate: [100, 50, 100],
    data:   extraData,
    actions: [
      { action: "open",    title: "Open App" },
      { action: "dismiss", title: "Dismiss"  },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus existing tab if open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open new tab
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    })
  );
});
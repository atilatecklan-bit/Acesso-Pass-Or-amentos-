// Service worker mínimo: permite instalar o app. Não guarda páginas em cache
// (os orçamentos sempre vêm atualizados do servidor).
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});

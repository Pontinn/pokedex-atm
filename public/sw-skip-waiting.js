// Importado pelo sw.js gerado (workbox.importScripts no vite.config.ts). Fix sw-legacy-button (2026-09-28).
// Abas abertas no build antigo (registerType "prompt") ainda mostram o botao "Atualizar": o clique manda
// { type: "SKIP_WAITING" } ao SW que estava em espera e so recarrega num controllerchange registrado NO clique.
// O SW novo (skipWaiting + clientsClaim) ja assumiu a aba antes disso, entao o controllerchange nunca vem.
// Aqui o SW recarrega a propria aba que mandou a mensagem. O build novo nunca manda SKIP_WAITING: sem loop.
(function (sw) {
  // abas ja sendo recarregadas (duplo clique = uma navegacao so); o id muda com o documento novo
  var navigating = new Set();

  function reloadClient(id) {
    if (!id || navigating.has(id)) return Promise.resolve();
    navigating.add(id);
    return sw.clients
      .get(id)
      .then(function (client) {
        if (!client || typeof client.navigate !== "function") return undefined;
        return client.navigate(client.url);
      })
      .catch(function () {
        return undefined;
      })
      .then(function () {
        navigating.delete(id);
      });
  }

  sw.addEventListener("message", function (event) {
    if (!event.data || event.data.type !== "SKIP_WAITING") return;
    var source = event.source;
    // so abas (WindowClient); mensagens de worker/outro SW nao recarregam nada
    if (!source || source.type !== "window" || !source.id) return;
    event.waitUntil(
      Promise.resolve(sw.skipWaiting())
        .catch(function () {
          return undefined;
        })
        .then(function () {
          return reloadClient(source.id);
        }),
    );
  });
})(self);

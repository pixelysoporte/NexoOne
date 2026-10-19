/* Service worker de NexoOne: la app funciona sin conexión una vez abierta.
 *
 * `scripts/build-web.mjs` genera `web-publicable/sw.js` a partir de esta plantilla, sustituyendo la
 * versión y la lista de archivos de la compilación. No se edita a mano en `web-publicable/`.
 *
 * - Al instalarse guarda todos los archivos de la compilación (precarga).
 * - Navegación: primero la red (para recibir versiones nuevas) y, sin conexión, la copia guardada.
 * - Resto de archivos de la app: primero la copia guardada (llevan huella en el nombre).
 * - Al activarse borra las cachés de versiones anteriores, solo las de NexoOne: en GitHub Pages todas
 *   las webs de la misma cuenta comparten origen.
 */
const VERSION = "5fff3393e443";
const CACHE_NAME = `nexoone-${VERSION}`;
const PRECACHE = [
  "./",
  "./app/static/js/web/Crypto-c155966458f2051460e8f6cb00ec69ba.js",
  "./app/static/js/web/Haptics-e36694c17a3634a7bb61471f3442c93c.js",
  "./app/static/js/web/index-8ba81b8860e0b6551feb756e9871eb8a.js",
  "./assets/assets/fonts/MaterialSymbolsOutlined-Fill.ced45154a4d541ad28cb6f210dd6707e.ttf",
  "./assets/assets/fonts/MaterialSymbolsOutlined.a634f8c3b684254a7c2d854c58c32092.ttf",
  "./assets/assets/icon.d3a3f336793e3efdc1fb517e7512079e.png",
  "./assets/assets/nexo-logo-mark.b561e9f500bcbbe341a33d02efdbb3d3.png",
  "./assets/vendor/@expo-google-fonts/plus-jakarta-sans/200ExtraLight/PlusJakartaSans_200ExtraLight.fdd89758261c9786825d3cdeaf8bc77d.ttf",
  "./assets/vendor/@expo-google-fonts/plus-jakarta-sans/200ExtraLight_Italic/PlusJakartaSans_200ExtraLight_Italic.61fa32023bed315ba0b30c3c65e72a4e.ttf",
  "./assets/vendor/@expo-google-fonts/plus-jakarta-sans/300Light/PlusJakartaSans_300Light.96e9519e0b4b43793371e04336d658cb.ttf",
  "./assets/vendor/@expo-google-fonts/plus-jakarta-sans/300Light_Italic/PlusJakartaSans_300Light_Italic.896f455ad601bd4cea2e2865e7f8ba82.ttf",
  "./assets/vendor/@expo-google-fonts/plus-jakarta-sans/400Regular/PlusJakartaSans_400Regular.dd3a1370a03dc0f2d7d093bd0ffe7c0b.ttf",
  "./assets/vendor/@expo-google-fonts/plus-jakarta-sans/400Regular_Italic/PlusJakartaSans_400Regular_Italic.991a0b32ae96c0baea0bde1d089c31c1.ttf",
  "./assets/vendor/@expo-google-fonts/plus-jakarta-sans/500Medium/PlusJakartaSans_500Medium.0a825b3e08f62af5a9bc9130843b12ff.ttf",
  "./assets/vendor/@expo-google-fonts/plus-jakarta-sans/500Medium_Italic/PlusJakartaSans_500Medium_Italic.398aa3fc207279a90a3311589d865743.ttf",
  "./assets/vendor/@expo-google-fonts/plus-jakarta-sans/600SemiBold/PlusJakartaSans_600SemiBold.73de6fb49299ccb6478575127008c120.ttf",
  "./assets/vendor/@expo-google-fonts/plus-jakarta-sans/600SemiBold_Italic/PlusJakartaSans_600SemiBold_Italic.949372fb28f6081d7f1704c83f96a64c.ttf",
  "./assets/vendor/@expo-google-fonts/plus-jakarta-sans/700Bold/PlusJakartaSans_700Bold.bac8ecad2d6da4aa6b4200699a80a9dd.ttf",
  "./assets/vendor/@expo-google-fonts/plus-jakarta-sans/700Bold_Italic/PlusJakartaSans_700Bold_Italic.0018f3803beb3f4896077c1a132a3623.ttf",
  "./assets/vendor/@expo-google-fonts/plus-jakarta-sans/800ExtraBold/PlusJakartaSans_800ExtraBold.f90855567d2c693a26e66f7184645099.ttf",
  "./assets/vendor/@expo-google-fonts/plus-jakarta-sans/800ExtraBold_Italic/PlusJakartaSans_800ExtraBold_Italic.c28e0379a2d9a6e859e1729ba6a68a79.ttf",
  "./assets/vendor/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Feather.ca4b48e04dc1ce10bfbddb262c8b835f.ttf",
  "./assets/vendor/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.b4eb097d35f44ed943676fd56f6bdc51.ttf",
  "./assets/vendor/@react-navigation/elements/lib/module/assets/back-icon-mask.0a328cd9c1afd0afe8e3b1ec5165b1b4.png",
  "./assets/vendor/@react-navigation/elements/lib/module/assets/back-icon.35ba0eaec5a4f5ed12ca16fabeae451d.png",
  "./assets/vendor/@react-navigation/elements/lib/module/assets/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55.png",
  "./assets/vendor/@react-navigation/elements/lib/module/assets/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@2x.png",
  "./assets/vendor/@react-navigation/elements/lib/module/assets/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@3x.png",
  "./assets/vendor/@react-navigation/elements/lib/module/assets/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@4x.png",
  "./assets/vendor/@react-navigation/elements/lib/module/assets/close-icon.808e1b1b9b53114ec2838071a7e6daa7.png",
  "./assets/vendor/@react-navigation/elements/lib/module/assets/close-icon.808e1b1b9b53114ec2838071a7e6daa7@2x.png",
  "./assets/vendor/@react-navigation/elements/lib/module/assets/close-icon.808e1b1b9b53114ec2838071a7e6daa7@3x.png",
  "./assets/vendor/@react-navigation/elements/lib/module/assets/close-icon.808e1b1b9b53114ec2838071a7e6daa7@4x.png",
  "./assets/vendor/@react-navigation/elements/lib/module/assets/search-icon.286d67d3f74808a60a78d3ebf1a5fb57.png",
  "./favicon.ico",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./index.html",
  "./manifest.json",
  "./metadata.json"
];

const scopeUrl = (path) => new URL(path, self.registration.scope).href;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE.map(scopeUrl)))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("nexoone-") && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(scopeUrl("./"), copy));
          return response;
        })
        .catch(() => caches.match(scopeUrl("./")).then((cached) => cached || caches.match(scopeUrl("./index.html"))))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
    )
  );
});

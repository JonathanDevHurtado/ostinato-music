# Privacidad y red

Política de Ostinato Music: **cero telemetría**. Nada de analítica, nada de reportes de uso, nada de
identificadores enviados a nuestros servidores. Este documento inventaría qué sale a la red,
cuándo y por qué, para poder auditarlo en cada actualización de upstream.

Última auditoría: **2026-10-27**, sobre Ostinato Music 0.1.1 (base Glassy Music 4.1.1).

---

## 1. Resultado de la auditoría

| Comprobación                                   | Resultado                                                                               |
| ---------------------------------------------- | --------------------------------------------------------------------------------------- |
| SDK de analítica en dependencias               | **Ninguno** (no hay Sentry, PostHog, Mixpanel, Amplitude, Segment…)                     |
| Código de telemetría en la app (`src/`)        | **Ninguno**                                                                             |
| Código de telemetría en la extensión de letras | **Ninguno**                                                                             |
| Permisos de la extensión                       | `storage`, `alarms`, host `*://music.youtube.com/*`                                     |
| Reporte de crashes a un servidor               | **No configurado**; no se inicia `crashReporter`                                        |
| Identificadores de usuario enviados            | **Ninguno** a servidores del proyecto                                                   |
| Unison (letras compartidas)                    | **Desactivado**: eliminado de la lista de proveedores y bloqueado en `providerPriority` |
| Avatares de Music Together                     | **Locales** (SVG generado en el cliente)                                                |

Conclusión: la app no envía telemetría. El riesgo real está en las funciones opcionales que
salen a terceros (letras, scrobbling, traducción, SponsorBlock) y en el auto-actualizador.

---

## 2. Inventario de red

### 2.1 Núcleo de la app

| Destino                                                                                                  | Cuándo se usa                                                            | Qué envía                                 | Estado en el fork     |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------- | --------------------- |
| `api.github.com` / `github.com/JonathanDevHurtado/ostinato-music`                                        | Auto-update, poco después de arrancar, solo si `autoUpdates` está activo | Petición de versión; sin datos de usuario | Apunta a nuestro repo |
| `raw.githubusercontent.com/JonathanDevHurtado/ostinato-music/master/changelog.json` + `cdn.jsdelivr.net` | Al abrir “Acerca de” o al detectar una actualización                     | GET de un JSON público                    | Apunta a nuestro repo |
| `music.youtube.com`, `i.ytimg.com`, `googlevideo.com`, `accounts.google.com`                             | Contenido y sesión de YouTube Music                                      | Tráfico normal de la web de YouTube Music | Inevitable            |
| `127.0.0.1`                                                                                              | Proxy local opcional del plugin `auth-proxy`                             | Nada externo                              | Mantener              |
| Socket local de Discord                                                                                  | Rich Presence, si está activado                                          | Título/artista de la canción              | Local, sin red        |

### 2.2 Letras (Better Lyrics)

Los proveedores por defecto consultan varios servicios públicos al cargar una canción. No
envían tu historial ni tu cuenta, pero sí el título/artista/duración de la canción que estás
viendo.

| Destino                                                                     | Proveedor                                    | Estado                             |
| --------------------------------------------------------------------------- | -------------------------------------------- | ---------------------------------- |
| `rics.betterlyrics.org`                                                     | Better Lyrics (rich sync)                    | Activo por defecto                 |
| `lyrics-api.binimum.org`                                                    | BiniLyrics                                   | Activo por defecto                 |
| `lyrics.api.dacubeking.com`                                                 | Cubey / Portato / Legato                     | Activo por defecto                 |
| `lrclib.net`                                                                | LRCLib                                       | Activo por defecto                 |
| `www.musixmatch.com`                                                        | Musixmatch                                   | Activo por defecto                 |
| `unison.betterlyrics.org`, `unison.boidu.dev`, `blrcunison.vercel.app`      | Unison                                       | **Desactivado en el build**        |
| `translate.googleapis.com`                                                  | Traducción de letras                         | Solo si se activa                  |
| `themes.betterlyrics.org`, `raw.githubusercontent.com/better-lyrics/themes` | Galería de temas                             | Solo al abrirla                    |
| `models.betterlyrics.org`                                                   | Descarga de modelos de letras                | Solo si se activa                  |
| `api.fontshare.com`, `fonts.googleapis.com`, `fonts.gstatic.com`            | Tipografías usadas por la interfaz de letras | Se piden al cargar la UI de letras |
| `placehold.co`                                                              | Imágenes de respaldo de temas                | Solo si un tema las usa            |

### 2.3 Funciones opcionales

| Destino                                         | Función                                 | Qué envía                                            |
| ----------------------------------------------- | --------------------------------------- | ---------------------------------------------------- |
| `ws.audioscrobbler.com`, `api.listenbrainz.org` | Scrobbler                               | Historial de escucha, solo si conectas la cuenta     |
| `sponsor.ajay.app`                              | SponsorBlock                            | Hash de segmentos del video                          |
| `zoundhub.com/api/artists/all`                  | Skip AI Music (desactivado por defecto) | GET de una lista comunitaria; no envía tu biblioteca |
| `raw.githubusercontent.com/uBlockOrigin/...`    | Listas de filtros del adblocker         | GET                                                  |

### 2.4 Lo que ya no sale

| Antes                                                            | Ahora                                                                                             |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `ui-avatars.com/api/?name=<nick>` en Music Together              | SVG generado localmente con iniciales y un color derivado del nombre                              |
| `unison.betterlyrics.org` con `x-key-id` en cada carga de letras | Proveedor eliminado de la lista por defecto y filtrado aunque una configuración vieja lo conserve |

---

## 3. Cambios obligatorios en el fork

1. **Auto-update**: `electron-builder.yml` → `publish.owner: JonathanDevHurtado`,
   `publish.repo: ostinato`. El `app-update.yml` generado apunta al fork. El enlace de
   descarga manual en `src/index.ts` también.
2. **Unison**: eliminado de `PROVIDER_CONFIGS`, filtrado en `providerPriority` y retirado de
   `externally_connectable` en el submódulo `better-lyrics-glassy`. Ver
   `docs/disable-unison.patch`.
3. **Avatares**: `src/plugins/music-together/types.ts` genera el SVG en local.
4. **Sin telemetría nueva**: cualquier PR de upstream que agregue analítica se rechaza en el
   merge (ver `docs/UPSTREAM-SYNC.md`, tabla de archivos críticos).

---

## 4. Cómo verificar después de cada actualización

```bash
# 1. Sin SDKs de analítica
grep -riE "sentry|posthog|mixpanel|amplitude|segment|gtag|sendBeacon" src/ | grep -v node_modules

# 2. Sin Unison en la app ni en el submódulo
grep -rn "unison" src/ extensions-src/better-lyrics-glassy/src/modules/lyrics/providers/ \
  extensions-src/better-lyrics-glassy/manifest.json | grep -v selfcheck | grep -v "Dock\|dock\|position"
grep -rn "unison" extensions/bl/manifest.json || true

# 3. Sin el avatar externo
grep -rn "ui-avatars" src/ extensions/ || echo "sin ui-avatars"

# 4. Auto-update apunta al fork
grep -n "owner\|repo" electron-builder.yml

# 5. Versión del changelog
grep -n "JonathanDevHurtado" src/changelog.ts
```

Comprobación en caliente (con la app abierta): DevTools → Network, filtrar por dominio y
confirmar que en reposo **solo** aparecen dominios de YouTube, las tipografías de la UI de
letras y, como mucho, el chequeo de actualización a nuestro GitHub. Reproducir una canción y
confirmar que no hay peticiones a `unison.betterlyrics.org` ni a `ui-avatars.com`.

Ruta de datos locales en Linux: `~/.config/Ostinato Music` (o `$XDG_CONFIG_HOME/Ostinato Music`). Los
dumps de crash, si el sistema los genera, quedan ahí; no se suben.

---

## 5. Compromiso

- No se agrega analítica, ni “anonymous usage stats”, ni crash reporting remoto.
- Toda función que salga a un tercero debe ser **opt-in** y estar listada en la tabla.
- Si upstream agrega un endpoint nuevo, se documenta aquí **antes** de publicar release.

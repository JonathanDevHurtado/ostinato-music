# Privacidad y red

Política del fork: **cero telemetría**. Nada de analítica, nada de reportes de uso, nada de
identificadores. Este documento inventaría qué sale a la red, cuándo y por qué, para poder
auditarlo en cada actualización de upstream.

Última auditoría: **2026-10-26**, sobre Glassy Music 4.1.1.

---

## 1. Resultado de la auditoría

| Comprobación | Resultado |
| --- | --- |
| SDK de analítica en dependencias | **Ninguno** (no hay Sentry, PostHog, Mixpanel, Amplitude, Segment…) |
| Código de telemetría en la app (`src/`) | **Ninguno** |
| Código de telemetría en la extensión de letras | **Ninguno** |
| Permisos de la extensión | `storage`, `alarms`, host `*://music.youtube.com/*` |
| Reporte de crashes a un servidor | **No configurado** (`crashReporter` no se inicia; los dumps quedan locales en `~/.config/Glassy Music/Crashpad`) |
| Identificadores de usuario enviados | **Ninguno** |

Conclusión: la app base **no envía telemetría**. El riesgo real está en endpoints de
funciones opcionales y en el auto-actualizador, que en un fork apuntaría al repo equivocado.

---

## 2. Inventario de red

| Destino | Cuándo se usa | Qué envía | Estado en el fork |
| --- | --- | --- | --- |
| `api.github.com` / `github.com/NanKillBro/...` | Auto-update, 2 s tras arrancar, solo si `autoUpdates` está activo | Petición de versión; sin datos de usuario | **Repuntar a nuestro repo** |
| `raw.githubusercontent.com/.../changelog.json` + `cdn.jsdelivr.net` | Al abrir "Acerca de" o al detectar update | Nada (GET de un JSON público) | Repuntar o dejar; sin datos |
| `zoundhub.com/api/artists/all` | Plugin *Skip AI Music* con lista comunitaria (desactivado por defecto) | GET; no envía tu biblioteca | Mantener desactivado por defecto |
| `unison.betterlyrics.org`, `blrcunison.vercel.app`, `unison.boidu.dev` | Letras compartidas ("Unison"), función opcional | Nickname y sala al usarla | **Eliminar del build** |
| `themes.betterlyrics.org`, `raw.githubusercontent.com/better-lyrics/themes` | Galería de temas, solo al abrirla | GET | Mantener (acción explícita) |
| `translate.googleapis.com` | Traducción de letras, si se activa | Texto de la letra a traducir | Mantener (opt-in) |
| `ws.audioscrobbler.com`, `api.listenbrainz.org` | Scrobbler, solo si configuras cuenta | Historial de escucha | Mantener (opt-in explícito) |
| `sponsor.ajay.app` | Plugin SponsorBlock | Hash de segmentos | Mantener (opt-in) |
| `raw.githubusercontent.com/uBlockOrigin/...` | Listas de filtros del adblocker | GET | Mantener |
| `models.betterlyrics.org` | Descarga de modelos de letras | GET | Mantener (opt-in) |
| `ui-avatars.com/api/?name=<nick>` | Plugin *Music Together* | **Tu nickname en la URL de un tercero** | **Sustituir por avatar local** |
| `127.0.0.1` | Proxy local opcional (auth-proxy) | Nada externo | Mantener |

Notas:

- Los dumps de crash son **locales**; no hay `uploadToServer`.
- Las peticiones a YouTube (`music.youtube.com`, `ytimg`, `googlevideo`) son el contenido
  de la app y no se pueden eliminar.
- OAuth de Last.fm/ListenBrainz solo ocurre si el usuario conecta la cuenta.

---

## 3. Cambios obligatorios en el fork

1. **Auto-update**: `electron-builder.yml` → `publish.owner: JonathanDevHurtado`,
   `publish.repo: glassy-music-nankill`. El `app-update.yml` generado apuntará al fork.
   Cambiar también el `downloadLink` hardcodeado en `src/index.ts`.
2. **Unison**: quitar `unison.*` de `externally_connectable` y de la lista de hosts de la
   extensión, o bloquearlo en `src/plugins/better-lyrics/index.ts`.
3. **Avatares**: reemplazar `ui-avatars.com` por un SVG generado en local (iniciales +
   color derivado del nombre).
4. **Sin telemetría nueva**: cualquier PR de upstream que agregue analítica se rechaza en
   el merge (ver `docs/UPSTREAM-SYNC.md`, tabla de archivos críticos).

---

## 4. Cómo verificar después de cada actualización

```bash
# 1. Sin SDKs de analítica
grep -riE "sentry|posthog|mixpanel|amplitude|segment|gtag|sendBeacon" src/ | grep -v node_modules

# 2. Inventario de hosts
grep -rhoE "https://[a-zA-Z0-9._-]+" src/ extensions/ | sort -u

# 3. Permisos de la extensión
python3 -c "import json;m=json.load(open('extensions/bl/manifest.json'));print(m['permissions'], m['host_permissions'])"

# 4. Auto-update apunta al fork
grep -n "owner\|repo" electron-builder.yml
```

Comprobación en caliente (con la app abierta): DevTools → Network, filtrar por dominio y
confirmar que en reposo **solo** aparecen dominios de YouTube y, como mucho, el chequeo de
actualización a nuestro GitHub.

---

## 5. Compromiso

- No se agrega analítica, ni "anonymous usage stats", ni crash reporting remoto.
- Toda función que salga a un tercero debe ser **opt-in** y estar listada en la tabla.
- Si upstream agrega un endpoint nuevo, se documenta aquí **antes** de publicar release.

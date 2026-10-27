# Actualizar Ostinato Music desde Glassy Music

Runbook para sincronizar este fork con `NanKillBro/glassy-music-nankill` sin perder los
cambios propios. Pensado para ejecutarse en cada release de upstream o, como mínimo, una vez
al mes.

---

## 1. Mapa de repositorios

| Repo                                                   | Rol                                                                  |
| ------------------------------------------------------ | -------------------------------------------------------------------- |
| `JonathanDevHurtado/ostinato-music`                    | **Nuestro fork** (la app). Aquí vive todo lo nuestro.                |
| `NanKillBro/glassy-music-nankill`                      | Upstream de la app. Solo lectura.                                    |
| `JonathanDevHurtado/better-lyrics-glassy`              | Fork del submódulo de letras (fix de diálogos y Unison desactivado). |
| `NanKillBro/better-lyrics-glassy`                      | Upstream del submódulo.                                              |
| `NanKillBro/shaders-glassy`, `NanKillBro/tacet-glassy` | Submódulos sin cambios locales.                                      |

El repositorio de la app se llamó `ostinato` hasta la versión 0.1.1. GitHub redirige las URLs
antiguas, pero la documentación y el updater ya usan `ostinato-music`.

Remotes locales:

```bash
git remote add upstream https://github.com/NanKillBro/glassy-music-nankill.git
git remote set-url --push upstream DISABLED   # nunca empujar a upstream
git remote set-url origin https://github.com/JonathanDevHurtado/ostinato-music.git
```

---

## 2. Modelo de ramas y versiones

- `master` → versión publicable. Solo recibe merges de `upstream/master` y commits ya
  probados.
- `sync/upstream-<version>` → rama temporal para resolver el merge.
- `feat/*` → trabajo en curso.
- Los tags son `v<version>` y deben coincidir exactamente con `version` en `package.json`
  (`v0.1.1`, `v0.2.0`…). El workflow de release aborta si no coinciden.
- No se hace rebase de `master`: el fork es público y otra gente puede tenerlo clonado.

---

## 3. Antes de actualizar

```bash
git fetch upstream --tags
git log --oneline master..upstream/master | head -50
git diff --stat master..upstream/master
```

Revisar si upstream tocó alguno de los archivos críticos del punto 6. Si tocó uno, leer el
cambio antes de mergear.

Revisar también los submódulos:

```bash
git diff master..upstream/master -- .gitmodules
git ls-tree upstream/master extensions-src/
```

Si upstream movió el pin de `better-lyrics-glassy`, decidir si se re-aplican nuestros dos
parches (fix de diálogos y Unison desactivado, punto 7) sobre el nuevo commit.

---

## 4. Merge

```bash
git checkout master
git pull --ff-only origin master
git checkout -b sync/upstream-$(node -p "require('./package.json').version")
git merge upstream/master --no-commit
```

Resolver conflictos (punto 6), luego:

```bash
pnpm install --frozen-lockfile
pnpm build
git commit
git push -u origin sync/upstream-<version>
```

`pnpm typecheck` y `pnpm lint` tienen errores heredados de upstream. No se usan como puerta
de release; sí conviene comprobar que no aumentaron:

```bash
pnpm typecheck 2>&1 | tail -20
pnpm lint 2>&1 | tail -30
```

Probar la app antes de mergear a `master`:

```bash
pnpm dev
```

Checklist manual mínimo:

- [ ] Arranca y reproduce audio.
- [ ] La ventana baja hasta 420×320 sin recortes.
- [ ] A 419 px o menos no se puede reducir (salvo que se desactive el mínimo).
- [ ] A 719 px los labels desaparecen y el hamburguesa abre el panel completo.
- [ ] A 720 px vuelven los cinco labels, sin nodos duplicados.
- [ ] Los submenús caben en la ventana a 420×320 y se cierran al hacer clic fuera.
- [ ] Abrir/cerrar diálogos de YouTube Music (Compartir, Guardar en playlist) varias veces
      **no** deja la UI sin responder (regresión del backdrop atascado).
- [ ] Ajustes → plugins siguen listados y se pueden activar.
- [ ] `Ctrl+R` no pierde sesión.
- [ ] No aparece ninguna petición a `unison.betterlyrics.org` ni a `ui-avatars.com`.

Si todo pasa:

```bash
git checkout master
git merge --no-ff sync/upstream-<version>
```

---

## 5. Publicar

```bash
# 1. Subir la versión en package.json y agregar la entrada en changelog.json
# 2. Commit de preparación
git tag -a v<version> -m "Ostinato Music <version>"
git push origin master
git push origin v<version>
```

El workflow `.github/workflows/release-linux.yml` compila AppImage, deb, rpm y tar.gz para
x64, genera `latest-linux.yml` y crea el Release. Verificar que los seis archivos estén adjuntos antes de anunciar
(AppImage, deb, rpm, tar.gz, `latest-linux.yml` y `SHA256SUMS`).

No se publican builds de macOS ni Windows desde este fork. Si se necesitan, se compilan
localmente con `pnpm dist:mac` / `pnpm dist:win`; no hay workflow que los suba.

---

## 6. Archivos críticos (puntos de conflicto esperados)

| Archivo                                          | Qué es nuestro                                                                                                                            | Cómo resolver                                                                                                                  |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `src/index.ts`                                   | `minWidth/minHeight` 420×320, `app.setName('ostinato')`, `--class=ostinato`, appID de Windows, URL de descarga y fallback del menú nativo | Conservar nuestros valores; aceptar el resto del diff de upstream                                                              |
| `src/plugins/in-app-menu/renderer/TitleBar.tsx`  | Modo compacto (<720 px), panel vertical, cierre por clic externo en fase de captura, `data-compact`                                       | Mantener el bloque `CompactMenuRenderer` y las señales `isCompact`/`compactOpen`; integrar el resto de los cambios de upstream |
| `src/plugins/in-app-menu/renderer/PanelItem.tsx` | `min-width: 0`, `overflow: hidden`, `text-overflow: ellipsis`, `white-space: nowrap` en labels                                            | Mantener las cuatro propiedades; son las que evitan filas superpuestas con nombres largos                                      |
| `src/plugins/in-app-menu/titlebar.css`           | Media query `max-width: 719px` que oculta los `<li>` del titlebar                                                                         | Mantener la query; si upstream cambia el layout del titlebar, revalidar el breakpoint                                          |
| `src/plugins/music-together/types.ts`            | Avatar SVG local en lugar de `ui-avatars.com`                                                                                             | Conservar `localAvatar()`; no reintroducir la URL externa                                                                      |
| `electron-builder.yml`                           | `appId`, `productName`, `publish.owner/repo` (`ostinato-music`), targets Linux x64, iconos                                                | Conservar branding y publish; aceptar nuevas dependencias o targets de upstream solo si se prueban                             |
| `package.json`                                   | `name: ostinato`, `productName`, `desktopName`, repositorio, `author`/`contributors`, versión                                             | Conservar `name` y branding; la versión se decide en el release                                                                |
| `.gitmodules`                                    | URL del submódulo de letras apunta a nuestro fork                                                                                         | Conservar nuestra URL y el pin con los parches                                                                                 |
| `extensions-src/better-lyrics-glassy` (gitlink)  | Commit con el fix de diálogos y Unison desactivado                                                                                        | Actualizar solo si los parches del punto 7 siguen aplicando limpio                                                             |
| `src/changelog.ts`                               | URLs del changelog apuntan a nuestro repo                                                                                                 | Conservar nuestro owner/repo                                                                                                   |
| `src/plugins/discord/utils.ts`                   | Botón “View App On GitHub” apunta a nuestro repo                                                                                          | Conservar nuestra URL                                                                                                          |
| `changelog.json`                                 | Entrada propia de Ostinato Music al inicio                                                                                                | Mantenerla arriba y agregar una por release                                                                                    |
| `.github/workflows/*`                            | `ci.yml`, `release-linux.yml`, `dependency-review.yml`, `reviewdog.yml`                                                                   | Ignorar los workflows de upstream; no volver a agregar `build.yml`, `pr-build-artifacts.yml` ni `issue-triage.yml`             |
| `docs/*`, `README.md`                            | Documentación del fork                                                                                                                    | Conservar y actualizar cuando cambie el comportamiento                                                                         |

---

## 7. Re-aplicar los parches del submódulo de letras

El submódulo `extensions-src/better-lyrics-glassy` tiene dos cambios propios:

### 7.1 Fix del backdrop de diálogos

El bug: `fix.js` comprobaba `hasAttribute('opened')`, pero Polymer expone `opened` como
**propiedad**. Eso deja un `tp-yt-iron-overlay-backdrop` a pantalla completa interceptando
todos los clics.

Nuestro fork ya lo tiene en `public/fix.js`. Si upstream reescribe ese archivo:

```bash
cd extensions-src/better-lyrics-glassy
git fetch origin
git checkout <nuevo-commit-upstream>
git checkout -b fix/opened-property-check-<fecha>
git apply ../../docs/fix-opened-property.patch
node --check public/fix.js
```

Criterio de aceptación, en cualquier versión futura:

1. Existe una comprobación de `el.opened` como propiedad (con fallback a atributo).
2. Ningún `setTimeout` pone `display: none` sobre un overlay cuyo `opened === true`.
3. Al abrir y cerrar diálogos repetidamente, `document.elementFromPoint()` **nunca**
   devuelve `TP-YT-IRON-OVERLAY-BACKDROP` con el diálogo cerrado.

### 7.2 Unison desactivado

Unison envía `x-key-id` (un identificador persistente generado en el cliente) y los datos
de la canción a `unison.betterlyrics.org` en cada carga de letras. Está en la lista de
proveedores por defecto de Better Lyrics. En Ostinato Music se elimina de la lista de proveedores
y se bloquea aunque una configuración vieja lo tenga guardado.

Después de actualizar el submódulo:

```bash
cd extensions-src/better-lyrics-glassy
git apply ../../docs/disable-unison.patch
npm run typecheck
npm run build
```

Criterio de aceptación:

1. `PROVIDER_CONFIGS` no contiene ninguna clave que empiece con `unison-`.
2. `providerPriority` filtra las claves de Unison aunque `preferredProviderList` las
   incluya.
3. `manifest.json` no declara `unison.betterlyrics.org` ni `blrcunison.vercel.app` en
   `externally_connectable`.
4. Con la app abierta, DevTools → Network no muestra peticiones a `unison.betterlyrics.org`
   al reproducir una canción sin letra.

Después, actualizar el pin en el repo principal:

```bash
cd ../..
git add extensions-src/better-lyrics-glassy
git commit -m "chore: bump better-lyrics-glassy with dialog and Unison patches"
```

---

## 8. Verificación del adaptativo

Con la app abierta, redimensionar (o usar Polonium) y comprobar:

| Ancho     | Esperado                                                                  |
| --------- | ------------------------------------------------------------------------- |
| ≥ 1280    | Layout completo, sidebar visible                                          |
| 1000–1279 | Sin scroll horizontal; sidebar de YouTube Music según su propio layout    |
| 720–999   | Titlebar completo con los cinco labels                                    |
| 420–719   | Titlebar compacto: solo hamburguesa; panel y submenús dentro del viewport |
| < 420     | Bloqueado por `minWidth` (salvo que se desactive el mínimo)               |

Comandos rápidos en DevTools:

```js
// scroll horizontal
document.documentElement.scrollWidth > document.documentElement.clientWidth + 2;

// estado del titlebar
const nav = document.getElementById('ytmd-title-bar-main-panel');
({
  width: innerWidth,
  compact: nav.dataset.compact,
  labels: nav.querySelectorAll(':scope > li').length,
});
```

En ventanas reales, Polonium puede recolocar la ventana a un tamaño distinto del pedido. Para
probar anchos exactos, usar la emulación de dispositivo de DevTools o desactivar el tiling
temporalmente.

---

## 9. Rollback

```bash
git revert -m 1 <merge-commit>
git push origin master
```

Para volver a una release anterior, reinstalar el artefacto del Release correspondiente. Los
tags no se borran ni se mueven.

---

## 10. Registro de sincronizaciones

| Fecha      | Upstream | Nuestra versión | Notas                                                                                                        |
| ---------- | -------- | --------------- | ------------------------------------------------------------------------------------------------------------ |
| 2026-10-26 | 4.1.1    | 0.1.0           | Fork inicial: mínimo 420×320, titlebar compacto, iconos, avatares locales, Unison desactivado, release Linux |

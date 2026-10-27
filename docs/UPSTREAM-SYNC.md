# Actualizar Glassy Adaptive desde upstream

Runbook para sincronizar nuestro fork con `NanKillBro/glassy-music-nankill` sin perder
los cambios propios. Pensado para ejecutarse en cada release de upstream (o cada mes).

---

## 1. Mapa de repositorios

| Repo | Rol |
| --- | --- |
| `JonathanDevHurtado/glassy-music-nankill` | **Nuestro fork** (la app). Aquí vive todo lo nuestro. |
| `NanKillBro/glassy-music-nankill` | Upstream. Solo lectura. |
| `JonathanDevHurtado/better-lyrics-glassy` | Fork del submódulo de letras (contiene `fix.js`). |
| `NanKillBro/better-lyrics-glassy` | Upstream del submódulo. |

Remotes locales:

```bash
git remote add upstream https://github.com/NanKillBro/glassy-music-nankill.git
git remote set-url --push upstream DISABLED   # nunca empujar a upstream
```

---

## 2. Modelo de ramas

- `master` → nuestra versión publicable. Solo recibe merges de `upstream/master` y
  commits nuestros ya probados.
- `sync/upstream-<version>` → rama temporal para resolver el merge.
- `feat/*` → trabajo en curso (adaptativo, privacidad, etc.).

Nunca hacemos rebase de `master`: el fork es público y otra gente puede tenerlo clonado.

---

## 3. Antes de actualizar

```bash
git fetch upstream --tags
git log --oneline master..upstream/master | head -50
```

Revisar en ese diff si upstream tocó alguno de los **archivos críticos** de la tabla del
punto 6. Si tocó uno, leer el cambio antes de mergear.

También revisar los submódulos:

```bash
git diff master..upstream/master -- .gitmodules
git ls-tree upstream/master extensions-src/
```

Si upstream movió el pin de `better-lyrics-glassy`, hay que decidir si re-aplicamos
nuestro parche de `fix.js` sobre el nuevo commit (ver punto 7).

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
pnpm typecheck
pnpm lint
git commit
git push -u origin sync/upstream-<version>
```

Probar la app antes de mergear a `master`:

```bash
pnpm dev
```

Checklist manual mínimo:

- [ ] Arranca y reproduce audio.
- [ ] La ventana se puede estrechar hasta ~480 px sin recortes raros.
- [ ] Abrir/cerrar diálogos de YouTube Music (Compartir, Guardar en playlist) varias veces
      **no** deja la UI sin responder (regresión del backdrop atascado).
- [ ] Ajustes → plugins siguen listados y se pueden activar.
- [ ] `Ctrl+R` no pierde sesión.

Si todo pasa:

```bash
git checkout master
git merge --no-ff sync/upstream-<version>
```

---

## 5. Publicar

```bash
git tag v<version>-adaptive.<n>
git push origin master --tags
```

El workflow `release-linux.yml` compila AppImage, deb y rpm y crea el Release.
Verificar que los artefactos estén adjuntos antes de anunciar.

---

## 6. Archivos críticos (puntos de conflicto esperados)

| Archivo | Qué es nuestro | Cómo resolver |
| --- | --- | --- |
| `src/index.ts` | `minWidth/minHeight` bajos (480×320) y sin restaurar geometría agresiva | Conservar nuestros valores; aceptar el resto del diff de upstream |
| `src/music-player.css` | Bloque `/* === Glassy Adaptive === */` con media queries | Mantener el bloque completo al final del archivo |
| `electron-builder.yml` | `appId`, `productName`, `publish.owner/repo`, targets solo Linux | Conservar branding; aceptar nuevas deps/targets que agregue upstream |
| `.github/workflows/*` | Nuestro `release-linux.yml` | Ignorar los cambios de upstream en `build.yml` (no lo usamos) |
| `package.json` | `name`, `version`, scripts propios | Conservar `name`; el `version` se decide en el release |
| `.gitmodules` | URL del submódulo de letras apunta a nuestro fork | Conservar nuestra URL y el pin con el fix |
| `extensions-src/better-lyrics-glassy` (gitlink) | Commit con el parche de `fix.js` | Actualizar solo si el parche sigue aplicando limpio |
| `src/plugins/better-lyrics/index.ts` | Lista de hosts bloqueados / sin Unison | Revisar que upstream no reintroduzca los endpoints |
| `changelog.md` / `changelog.json` | Generados | Aceptar los de upstream; nuestro release usa notas propias |

---

## 7. Re-aplicar el parche de `fix.js`

El bug: `fix.js` comprobaba `hasAttribute('opened')`, pero Polymer expone `opened` como
**propiedad**. Eso deja un `tp-yt-iron-overlay-backdrop` a pantalla completa interceptando
todos los clics.

Nuestro fork del submódulo ya lo tiene en `public/fix.js`. Si upstream reescribe ese
archivo:

```bash
cd extensions-src/better-lyrics-glassy
git fetch origin
git checkout <nuevo-commit-upstream>
git checkout -b fix/opened-property-check-<fecha>
# aplicar de nuevo el diff de docs/fix-opened-property.patch
node --check public/fix.js
```

Criterio de aceptación del parche, en cualquier versión futura:

1. Existe una comprobación de `el.opened` como propiedad (con fallback a atributo).
2. Ningún `setTimeout` pone `display: none` sobre un overlay cuyo `opened === true`.
3. Al abrir y cerrar diálogos repetidamente, `document.elementFromPoint()` **nunca**
   devuelve `TP-YT-IRON-OVERLAY-BACKDROP` con el diálogo cerrado.

Después, actualizar el pin en el repo principal:

```bash
cd ../..
git add extensions-src/better-lyrics-glassy
git commit -m "chore: bump better-lyrics-glassy with opened-property fix"
```

---

## 8. Verificación del adaptativo

Con la app abierta, redimensionar (o usar Polonium) y comprobar:

| Ancho | Esperado |
| --- | --- |
| ≥1280 | Layout completo, sidebar visible |
| 1000–1279 | Sidebar compacta, sin scroll horizontal |
| 760–999 | Barra de reproducción en dos filas, controles secundarios ocultos |
| 480–759 | Modo minimal: sidebar como overlay, carátula pequeña, sin recortes |

Comando rápido para detectar scroll horizontal:

```js
document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
```

---

## 9. Rollback

```bash
git revert -m 1 <merge-commit>
git push origin master
```

Para volver a una release anterior, reinstalar el artefacto del Release correspondiente.
Los tags no se borran ni se mueven.

---

## 10. Registro de sincronizaciones

| Fecha | Upstream | Nuestra versión | Notas |
| --- | --- | --- | --- |
| 2026-10-26 | 4.1.1 | 4.1.1-adaptive.0 | Fork inicial, parche `fix.js`, mínimo 480×320 |

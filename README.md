<div align="center">

# Ostinato

**A tiling-friendly, local-first YouTube Music desktop player.**

[![CI](https://github.com/JonathanDevHurtado/ostinato/actions/workflows/ci.yml/badge.svg)](https://github.com/JonathanDevHurtado/ostinato/actions/workflows/ci.yml)
[![GPL-3.0](https://img.shields.io/badge/license-GPL--3.0-blue.svg)](LICENSE)
[![Latest release](https://img.shields.io/github/v/release/JonathanDevHurtado/ostinato?label=release&color=orange)](https://github.com/JonathanDevHurtado/ostinato/releases)

</div>

Ostinato is a fork of [Glassy Music](https://github.com/NanKillBro/glassy-music-nankill),
which itself is based on [Pear Desktop](https://github.com/pear-devs/pear-desktop). It keeps
the improved lyrics integration, themes, ad blocking and playback plugins, and adds a UI
that behaves well in narrow, tiled and stacked windows.

The name comes from Italian: an *ostinato* is a short melodic pattern repeated over and
over. It is a nod to the music player part, not to a bug in the shuffle algorithm.

## Why this fork?

- **Adaptive window.** The minimum size is **420×320**, not 1280×720. The player fits
  KDE Polonium, Hyprland, Sway and any other tiling setup.
- **Compact titlebar.** Below **720 px** the five top-level menu labels collapse into one
  hamburger button. The panel and its submenus stay inside the viewport and close when you
  click outside them.
- **No telemetry.** No analytics SDKs, no usage reporting, no remote crash uploads. See
  [docs/PRIVACY.md](docs/PRIVACY.md).
- **Local avatars.** Music Together placeholders are generated on the machine instead of
  being fetched from `ui-avatars.com`.
- **Linux releases.** Every tag builds AppImage, deb, rpm and tar.gz artifacts on GitHub
  Actions, including the `latest-linux.yml` file used by the auto-updater.
- **Upstream-friendly.** Local changes are documented so the fork can merge new Glassy
  Music releases without losing them. See [docs/UPSTREAM-SYNC.md](docs/UPSTREAM-SYNC.md).

## Install

Download the latest **Linux x64** artifact from
[Releases](https://github.com/JonathanDevHurtado/ostinato/releases):

| Format | Use |
| --- | --- |
| `Ostinato-*.AppImage` | Portable, `chmod +x` and run |
| `Ostinato-*.deb` | Debian, Ubuntu, Linux Mint |
| `Ostinato-*.rpm` | Fedora, openSUSE, RHEL |
| `Ostinato-*.tar.gz` | Manual install or packaging |

The AppImage auto-updater reads `latest-linux.yml` from the same release. Other formats are
updated by downloading the new package.

Fedora and openSUSE may need `libuuid`; Debian-based distributions pull the GTK, NSS, ALSA
and GBM runtime dependencies declared by the package.

## Adaptive behavior

| Window width | What changes |
| --- | --- |
| ≥ 720 px | Full titlebar with the five top-level menu labels |
| < 720 px | Hamburger button opens one vertical menu with every top-level entry |
| 420–475 px | Content still fits; YouTube Music's own sign-in button starts to clip below 420 px |
| < 420 px | Not reachable by resizing; the minimum window size is 420×320 |

The compact menu is part of the bundled `in-app-menu` plugin. If you disable that plugin,
Ostinato hides the native menu bar below 720 px as a fallback and leaves it visible on
wider windows. Press <kbd>Alt</kbd> to show a hidden native menu.

You can still disable the minimum size in **Options → Advanced options → Disable Minimum
Window Size**, but YouTube Music itself is not usable below roughly 420 px.

## Build from source

### Requirements

- Git
- Node.js 22 or newer
- pnpm 11 or newer
- Linux packaging tools: `rpm` for the rpm target, and the usual Electron runtime
  libraries

### Steps

```bash
git clone --recurse-submodules https://github.com/JonathanDevHurtado/ostinato.git
cd ostinato
pnpm install --frozen-lockfile
pnpm build
```

Package only what you need:

```bash
pnpm exec electron-builder --linux AppImage --x64 --publish never
pnpm exec electron-builder --linux deb rpm tar.gz --x64 --publish never
```

Artifacts are written to `pack/`. For day-to-day development:

```bash
pnpm dev
```

The `better-lyrics-glassy` submodule points at
[JonathanDevHurtado/better-lyrics-glassy](https://github.com/JonathanDevHurtado/better-lyrics-glassy)
and contains the dialog-backdrop fix described in
[docs/fix-opened-property.patch](docs/fix-opened-property.patch).

## Releases

Releases are tag-driven:

```bash
# 1. Update the version in package.json and add an entry to changelog.json
# 2. Commit the release prep
git tag -a v0.1.0 -m "Ostinato 0.1.0"
git push origin master
git push origin v0.1.0
```

The `Release Linux` workflow checks that the tag matches `package.json`, builds the four
Linux x64 formats plus `latest-linux.yml`, and publishes a GitHub Release with generated
notes. If the tag does not match the version, the workflow stops before packaging.

## Privacy

The privacy policy is short: the app has no telemetry. Network access is limited to
YouTube Music, the optional online features you enable (lyrics providers, scrobbling,
SponsorBlock, translations, theme gallery), the ad-block filter list, and the update check
against this repository.

Unison, the shared lyrics feature that sends a persistent key identifier to
`unison.betterlyrics.org`, is disabled in this build. Music Together avatars no longer
leave the machine. The full inventory is in [docs/PRIVACY.md](docs/PRIVACY.md).

## License and credits

- **GPL-3.0** for this fork. See [LICENSE](LICENSE).
- Original Glassy Music by [nankill](https://github.com/NanKillBro/glassy-music-nankill).
- Based on [Pear Desktop](https://github.com/pear-devs/pear-desktop), MIT, copyright
  pear-devs. See [NOTICE](NOTICE).
- [Better Lyrics](https://github.com/better-lyrics/better-lyrics) and
  [Better Lyrics Shaders](https://github.com/better-lyrics/shaders) provide the lyrics and
  visual effects bundled here.
- Theme inspiration: [chengggit](https://github.com/chengggit), zobiron, SKMJi,
  [tposejank](https://github.com/tposejank) and
  [WolfTheE](https://github.com/WolfTheE).

Ostinato is an independent, non-profit project. It is not affiliated with, endorsed by or
connected to Google LLC, YouTube, or any of their subsidiaries. “Google”, “YouTube” and
“YouTube Music” are trademarks of their respective owners. The software is provided “as
is”, without warranty of any kind; you use it at your own risk.

## FAQ

### The menu labels disappeared

You are below 720 px. Click the hamburger button on the left. The panel contains the same
entries as the wide titlebar.

### Why is the minimum size 420×320?

YouTube Music's own layout stops fitting below roughly 420 px: the sign-in button and the
right side of the navigation bar are clipped. 420 is the smallest width where the navigation
bar still works without horizontal scrolling.

### Can I still use the native menu?

Yes. Disable the `in-app-menu` plugin. Ostinato then hides the native bar below 720 px to
save vertical space and restores it when the window grows. Press <kbd>Alt</kbd> to reveal a
hidden bar.

### Where are settings stored?

Under Electron's user data directory, normally `~/.config/ostinato` on Linux. The exact
path depends on `XDG_CONFIG_HOME`.

### How do I update the fork from Glassy Music?

Follow [docs/UPSTREAM-SYNC.md](docs/UPSTREAM-SYNC.md). It lists the files that carry local
changes, the submodule pin, and the checks to run before tagging a release.

# ASCII Wallpapers for Antigravity

Live, animated backgrounds for the [Antigravity](https://antigravity.google) desktop app, drawn entirely in text characters. 50 themes, a searchable sidebar picker, and nothing leaves your machine.

**[Watch the demo and see the themes →](https://mix4o445.github.io/antigravity-ascii-wallpapers/)**

![Jellyfish theme with the picker open](assets/picker.jpg)

> Unofficial community mod. Not affiliated with or endorsed by Google. It patches your local copy of the app (with a verified backup), so use it at your own risk.

## Features

- **50 live themes**: 22 light and 28 dark. Cloud Drift, Aurora, Honu Lagoon, Koi Pond, Jellyfish, Paper Boats, Sakura, Fireflies, Moonlit, Ember Dunes, Night Rain, Snowfall, Sky Lanterns, Windy Meadow, Spiral Galaxy, Bamboo Grove, Digital Rain, Morning Tide, Autumn Leaves, Alpine Dawn, Retro Sunset, Lava Lamp, Starry Catnap, Supercell, Black Smokers, Candlelight, Neon Alley, Black Hole, Volcano, Swirling Night, Radar Scope, Ice Giant, Kelp Forest, Signal Glitch, Peacock Feathers, Blueprint, Stained Glass, Ink Wash, Ice Cave, Hot Air Balloons, Coral Reef, Pop Art, Paper Cranes, Matcha, Desert Oasis, Lavender Fields, Windmills, Island Palms, Moire and Zen Garden.
- **Sidebar picker**: themes open in a panel docked to the right, with live previews, names, search, a Light/Dark filter and Shuffle. Arrow keys move through the grid.
- **Whole-app theming (or wallpaper-only)**: the sidebar, menus, composer, title bar and window controls are recolored to match each scene, or uncheck **Adjust → Theme app** to keep Antigravity's stock UI chrome.
- **Three ways to open or switch**: click **Themes** in the top right, press **Ctrl+Alt+W** (or **Cmd+Option+W** on macOS), or type `/theme` in the composer (including direct commands like `/theme catnap`, `/theme random` or `/theme off`).
- **Controls**: Pause freezes the animation, Adjust sets intensity, glyph style (**ASCII**, **Braille**, **Blocks**, **Katakana**) and grid density (**Fine**, **Normal**, **Chunky**), and Off restores the stock look instantly.
- **Reacts to your agents**: the scene speeds up and brightens while agents are running, with scene-specific touches (Catnap's ear twitches and tail swishes, Digital Rain adds streams, Aurora flares, Koi and Fireflies liven up). When an agent finishes, a ripple spreads out from the composer. If the window was hidden at the time, the ripple plays when you come back. Turn it off under **Adjust → React to agents**.
- **Model quota on screen**: a small bar in the title bar shows your lowest remaining model quota. Click it to see every model with its percentage and time until reset. It refreshes every minute and after each agent finishes. Turn it off under **Adjust → Show quota**.
- **Stays out of the way**: the background sits behind your text and the composer stays fully interactive. Rendering pauses while the window is hidden, and reduced-motion settings are respected.
- **Private**: no network requests leave your machine. The quota bar only asks Antigravity's own local server (`127.0.0.1`), the same way the app does. Your pick is saved locally in `%APPDATA%\Antigravity\ascii-wallpapers-preferences.json` on Windows, `~/Library/Application Support/Antigravity/ascii-wallpapers-preferences.json` on macOS, or `~/.config/Antigravity/ascii-wallpapers-preferences.json` on Linux.

| | | |
|---|---|---|
| ![Aurora](assets/aurora.jpg) | ![Ember Dunes](assets/dunes.jpg) | ![Koi Pond](assets/koi.jpg) |
| ![Sakura](assets/sakura.jpg) | ![Night Rain](assets/rain.jpg) | ![Retro Sunset](assets/retro.jpg) |

## Requirements

- Windows or macOS, with the standalone Antigravity app installed in the default location (`/Applications/Antigravity.app` on macOS, `%LOCALAPPDATA%\Programs\antigravity` on Windows).
- [Node.js](https://nodejs.org) 18 or newer.

Versions **2.29.0** and **2.28.2** were inspected by hand. Other versions are checked automatically before anything is changed (see [Safety checks](#safety-checks)), and the installer refuses any build that fails them.

## Install

1. Download this repository (**Code → Download ZIP**) and extract it.
2. Close Antigravity completely.
3. Open Terminal (Linux or macOS) or PowerShell (Windows) in the extracted folder and run:

   **Linux:**
   ```bash
   node manage-wallpapers.cjs install
   ```
   *(If installed in `/opt` or system directories requiring root privileges, use `sudo node manage-wallpapers.cjs install`)*

   **macOS:**
   ```bash
   node manage-wallpapers.cjs install
   ```
   *(If your `/Applications` folder requires admin privileges, use `sudo node manage-wallpapers.cjs install`)*

   **Windows:**
   ```powershell
   node .\manage-wallpapers.cjs install
   ```

   *(Optional)* If Antigravity is installed in a non-standard location, pass the path directly:
   ```bash
   node manage-wallpapers.cjs install /path/to/Antigravity.app
   ```

4. Reopen Antigravity and click **Themes**.

To check that the archive rebuild works without changing anything, run `node manage-wallpapers.cjs verify` first. `node manage-wallpapers.cjs status` shows the detected app version, whether wallpapers are installed, and whether the build can be patched.

## After an Antigravity update

Updates replace the app archive, which removes the wallpapers. Close Antigravity and run the install command again:

```powershell
node .\manage-wallpapers.cjs install
```

The installer detects the new build, runs the safety checks, and keeps the old build's backup next to the new one as `app.asar.ascii-wallpapers.backup.<old version>-<timestamp>`. You can delete that file once the new version works.

## Uninstall

Close Antigravity, then run:

**Linux:**
```bash
node manage-wallpapers.cjs restore
# or
node manage-wallpapers.cjs uninstall
```
*(If installed in `/opt` or system directories requiring root privileges, prefix with `sudo`)*

**macOS:**
```bash
node manage-wallpapers.cjs restore
# or
node manage-wallpapers.cjs uninstall
```

**Windows:**
```powershell
node .\manage-wallpapers.cjs restore
# or
node .\manage-wallpapers.cjs uninstall
```

`uninstall` is supported as an alias for `restore`. The original archive is kept next to the app as `app.asar.ascii-wallpapers.backup`. Restore checks hashes first and refuses to overwrite a newer app version.

## Safety checks

Before patching a build that wasn't inspected by hand, the installer requires all of the following and changes nothing if any fails:

- `package.json` names the app as Antigravity, with `dist/main.js` as its entry point.
- `dist/preload.js` and `dist/main.js` are packed in the archive and don't already contain the mod.
- The patched `dist/preload.js` and `dist/main.js` compile. This catches syntax or name clashes with the new app code.
- Electron's `EnableEmbeddedAsarIntegrityValidation` fuse is off. On macOS an unreadable fuse blocks installation; on Linux and Windows it produces a warning. If the fuse is on, an edited archive would stop the app from launching.

It also prints a note if an optional hook is missing. In that case only that feature stops working: saved preferences, title bar colors, or agent reactivity.

## How it works

The installer appends the wallpaper scripts to Antigravity's `dist/preload.js` and `dist/main.js` inside `app.asar`, rebuilds the archive, and updates every integrity hash. It then re-verifies every packed file before replacing the archive. It runs through the app's existing isolated preload: Node integration and context isolation stay as shipped.

Agent reactivity uses the running-agent count that Antigravity already sends from the page to the main process for its tray menu (`agent:update-active-count`). The preload watches that call as it passes through. It doesn't read the page or your conversations.

| File | Purpose |
|---|---|
| `wallpaper-scenes.js` | The 50 scene renderers |
| `ascii-wallpapers.js` | Theme definitions, picker UI and app recoloring |
| `wallpapers-main.js` | Saves your preferences in the main process |
| `manage-wallpapers.cjs` | Install, verify, status and restore |

## License

MIT. See [LICENSE](LICENSE).

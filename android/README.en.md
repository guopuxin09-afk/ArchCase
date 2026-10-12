# ArchCase Android

[简体中文](README.md) · [繁體中文](README.zh-TW.md) · English

This Capacitor Android app packages the architecture case map with 221 cases, 12 categories, search and filters, marker clustering, Chinese / English controls, and light / dark themes. Primary case links open the Markdown study notes in this repository; optional original Notion sources may require permission.

The Markdown study notes are the collection's contents; the APK is one way to browse its map and index. The documents are in [`notes/`](../notes/README.md) (guide in Simplified Chinese), and can be downloaded and imported into Notion, Obsidian, or other tools. The APK does not automatically download external full-text notes or images to your phone.

## Download and install

- [Download archcase-debug.apk](https://github.com/guopuxin09-afk/ArchCase/raw/refs/heads/main/android/apk/archcase-debug.apk): version `1.0.1`, versionCode `2`, package ID `com.archcase.atlas`.
- [`apk/archcase-debug.apk.sha256`](apk/archcase-debug.apk.sha256): the file's SHA-256 checksum for checking download integrity.
- Requires Android 7.0 (API 24) or later; targets Android 16 (API 36).

1. On your Android phone, tap **Download archcase-debug.apk** above and wait for the download to finish.
2. Open `archcase-debug.apk` from your browser's downloads list or your phone's file manager.
3. If Android blocks installation from that source, follow the prompt to Settings, allow the current browser or file manager to install apps, then return to the installer. The setting's name varies by device.
4. Tap **Install**, then **Open**, or launch **ArchCase** from your app list.

This is a Debug trial build with a verified signature. It has not been released as a production-signed app-store version. If an older installation uses a different debug signing key, Android may require you to uninstall it before installing this APK; uninstalling clears that version's local app data. After installation, you can turn off the installation permission for that source in system settings.

## Offline and online use

The APK includes the map interface, complete case index, map runtime libraries, and Natural Earth world overview. These resources do not need to be downloaded on first launch. Search, categories, markers and clusters, the world overview, detail indexes, themes, and language switching work offline. Online street-map tiles, full case notes on GitHub, original Notion sources, and surrounding maps require a connection.

Offline street maps and building footprints are not included. Some case coordinates represent city centers. Use the index as a starting point, and check dates, architects, categories, and locations against original sources.

## Build

Requires Node.js ≥ 22.12, JDK 21, Android SDK API 36, and Build Tools 36.0.0. npm dependencies are locked in `package-lock.json`. With `JAVA_HOME` and `ANDROID_HOME` already configured, run from the repository root:

```sh
cd android
npm ci
npm run sync:android
cd android
./gradlew assembleDebug
```

For the complete Windows setup and verification workflow, run these commands from the repository's top-level `android/` directory, where `package.json` is located:

```powershell
npm.cmd run setup:android
npm.cmd run doctor
npm.cmd run apk:debug
```

`setup:android` downloads the JDK and Android SDK, verifies the official archive hashes, and installs dependencies. `apk:debug` builds the website, checks local static resources, syncs Capacitor, compiles the APK, verifies its signature, and compares the SHA-256 of each bundled web resource against `www/`. With a complete local cache, use `scripts/build-android.ps1 -Offline`.

Tools are stored in the project's `.tools/` directory by default; set `ARCHCASE_TOOLS_ROOT` to use another local directory. Tool caches, `node_modules/`, logs, `local.properties`, build outputs, and debug signing keys are ignored and should not be committed to the public repository. Keep your own release signing key separately.

## Where to edit

| Path | Purpose |
| --- | --- |
| `source/archcase-orange-glass.html` | Editable map HTML and case index |
| `web/native.css`, `web/native.js` | Safe areas, system bars, keyboard viewport, and Back button behavior |
| `web/public/` | Bundled runtime libraries, world overview data, and licenses |
| `www/` | Built website that can be previewed independently |
| `android/` | Native project, Gradle Wrapper, and synced web resources |
| `scripts/` | Integration, environment setup, builds, and browser checks |
| `apk/` | Current downloadable APK and verification files |

`web/index.html` and `www/` are generated files; edit `source/`. The website project and this project contain copies of the same map source, so update both when changing the index. To preview the website, run `npm run build`, then `npm run preview`.

## Verification and limitations

The public version was rebuilt from the prepared source on 2026-10-13. Gradle `assembleDebug` succeeded, APK Signature Scheme v2 verification passed, and each bundled web resource's hash matched the build output. Chromium checks covered 390×844, 360×640, 844×390, and 1280×800. With all external requests blocked, the world overview, 221 cases, and interactions remained available, with no JavaScript errors or horizontal overflow.

The APK has not yet been installed and run on a physical Android device or Android emulator. Browser checks cannot verify device status bars, the system keyboard, Back gestures, or launching an external browser.

## Licenses

Map runtime licenses are retained in `web/public/vendor/`. The MIT licenses for Capacitor Core, App, and Android are in `web/public/licenses/` and bundled with the app; other native components retain their applicable upstream notices. See the repository root for the scope of rights covering case notes and third-party materials.

## Reusing the source for iOS

The project lists `@capacitor/ios` at the same version as its corresponding Capacitor packages, but no iOS app has been generated or released. On a Mac with a compatible Xcode installation, run `npm run ios:add`, `npm run sync:ios`, and `npm run ios:open`, then configure signing and build the app yourself. Skip `ios:add` if `ios/` already exists.

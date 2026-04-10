# Webflasher: how to add a new device

This guide describes where and how to add a new device/firmware in this project.
It follows the current project structure with language switching and firmware filtering by language.

## 1) Prepare firmware binaries

Place all required binaries in the `firmware/` directory.

Example:
- `firmware/MyDevice/bootloader.bin`
- `firmware/MyDevice/partitions.bin`
- `firmware/MyDevice/boot_app0.bin`
- `firmware/MyDevice/mydevice_en.bin`
- `firmware/MyDevice/mydevice_ru.bin`

If your workflow expects checksum files, add/update corresponding `*.md5` files.

## 2) Create manifest files in `manifest/`

Create one or more files:
- `manifest/MyDevice_EN.manifest.json`
- `manifest/MyDevice_RU.manifest.json`
- optionally `manifest/MyDevice_EN_DEV.manifest.json`, `manifest/MyDevice_RU_DEV.manifest.json`

### Minimal manifest template

```json
{
  "name": "mydevice-firmware",
  "new_install_prompt_erase": true,
  "new_install_improv_wait_time": 10,
  "description": "Default description (fallback if translation is not set in js/i18n.js).",
  "builds": [
    {
      "chipFamily": "ESP32-C6",
      "chipLabel": "ESP32-C6",
      "improv": false,
      "parts": [
        { "path": "../firmware/MyDevice/bootloader.bin?v=R_2026-04.02", "offset": 0 },
        { "path": "../firmware/MyDevice/partitions.bin?v=R_2026-04.02", "offset": 32768 },
        { "path": "../firmware/MyDevice/boot_app0.bin?v=R_2026-04.02", "offset": 57344 },
        { "path": "../firmware/MyDevice/mydevice_en.bin?v=R_2026-04.02", "offset": 65536 }
      ]
    }
  ]
}
```

### Important manifest rules

- Keep `chipFamily` as a real chip id (`ESP32-C3`, `ESP32-C6`, `ESP32-S3`, ...).
- Use `chipLabel` for UI display text.
  - Example: `chipFamily: "ESP32-C3"` + `chipLabel: "ESP32-C3 (OLD_VERSION_ALTRUIST)"`.
- If you have multiple chips, add multiple objects in `builds`.
- `parts[].offset` and file set must match your flashing layout.

## 3) Add new firmware options in `index.html`

File: `index.html`

Inside `<select name="firmware">`, add options with:
- `value` = manifest base name (without `.manifest.json`)
- `data-firmware-key` = same key for i18n mapping

Example:

```html
<option value="MyDevice_EN" data-firmware-key="MyDevice_EN">MyDevice EN</option>
<option value="MyDevice_EN_DEV" data-firmware-key="MyDevice_EN_DEV">MyDevice EN DEV</option>
<option value="MyDevice_RU" data-firmware-key="MyDevice_RU">MyDevice RU</option>
<option value="MyDevice_RU_DEV" data-firmware-key="MyDevice_RU_DEV">MyDevice RU DEV</option>
```

## 4) Add translations in `js/i18n.js`

File: `js/i18n.js`

For each new `data-firmware-key`, add:
- label in `firmwareLabels` for `en` and `ru`
- description in `manifestDescriptions` for `en` and `ru`

Example:

```js
firmwareLabels: {
  // ...
  MyDevice_EN: 'MyDevice EN',
  MyDevice_EN_DEV: 'MyDevice EN DEV',
  MyDevice_RU: 'MyDevice RU',
  MyDevice_RU_DEV: 'MyDevice RU DEV'
},
manifestDescriptions: {
  // ...
  MyDevice_EN: 'Firmware for MyDevice.',
  MyDevice_EN_DEV: 'Firmware for MyDevice (dev).',
  MyDevice_RU: 'Прошивка для MyDevice.',
  MyDevice_RU_DEV: 'Прошивка для MyDevice (dev).'
}
```

## 5) Understand language-based firmware filtering

Current logic in `js/main.js`:
- EN mode shows only keys containing `_EN` (+ neutral keys without `_EN/_RU`).
- RU mode shows only keys containing `_RU` (+ neutral keys without `_EN/_RU`).

So naming matters:
- Use `_EN`/`_RU` in firmware keys if they are language-specific.
- Do not use `_EN`/`_RU` for language-neutral firmware (example: `em-esp32`, `Hikikomory`).

## 6) Quick checklist before commit

- Manifest file names match option `value` in `index.html`.
- Every new firmware option has `data-firmware-key`.
- Every key exists in `js/i18n.js` (`firmwareLabels` + `manifestDescriptions`, both languages).
- All binary paths in manifest are valid.
- All `chipFamily` values are valid real chip ids.
- UI-only chip naming uses `chipLabel`.

## 7) Typical mistakes

- Putting custom text into `chipFamily` instead of `chipLabel`.
- Adding new option in `index.html` but forgetting i18n entries.
- Using wrong manifest filename in option `value`.
- Missing one of EN/RU variants while expecting it in language-specific filtering.

## 8) Minimal end-to-end example

To add `MyDevice` with EN/RU:
1. Add binaries to `firmware/MyDevice/`.
2. Add `manifest/MyDevice_EN.manifest.json` and `manifest/MyDevice_RU.manifest.json`.
3. Add two `<option>` entries in `index.html`.
4. Add two keys in `firmwareLabels` and `manifestDescriptions` for both `en` and `ru` in `js/i18n.js`.
5. Open page, switch language, verify the firmware appears only in matching language list and flashes correctly.

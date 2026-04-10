# Webflasher: как добавить новое устройство

Этот документ описывает, куда и как вносить изменения, чтобы добавить новое устройство/прошивку в проект.
Инструкция соответствует текущей структуре проекта с переключением языка и фильтрацией прошивок по языку.

## 1) Подготовьте бинарники прошивки

Разместите все нужные файлы в каталоге `firmware/`.

Пример:
- `firmware/MyDevice/bootloader.bin`
- `firmware/MyDevice/partitions.bin`
- `firmware/MyDevice/boot_app0.bin`
- `firmware/MyDevice/mydevice_en.bin`
- `firmware/MyDevice/mydevice_ru.bin`

Если в вашем процессе используются контрольные суммы, добавьте/обновите `*.md5`.

## 2) Создайте manifest-файлы в `manifest/`

Создайте один или несколько файлов:
- `manifest/MyDevice_EN.manifest.json`
- `manifest/MyDevice_RU.manifest.json`
- при необходимости `manifest/MyDevice_EN_DEV.manifest.json`, `manifest/MyDevice_RU_DEV.manifest.json`

### Минимальный шаблон manifest

```json
{
  "name": "mydevice-firmware",
  "new_install_prompt_erase": true,
  "new_install_improv_wait_time": 10,
  "description": "Базовое описание (будет fallback, если перевод не задан в js/i18n.js).",
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

### Важные правила для manifest

- В `chipFamily` указывайте только реальный id чипа (`ESP32-C3`, `ESP32-C6`, `ESP32-S3`, ...).
- Для отображаемого названия используйте `chipLabel`.
  - Пример: `chipFamily: "ESP32-C3"` + `chipLabel: "ESP32-C3 (OLD_VERSION_ALTRUIST)"`.
- Если устройство поддерживает несколько чипов, добавляйте несколько объектов в `builds`.
- `parts[].offset` и набор файлов должны совпадать с вашей схемой прошивки.

## 3) Добавьте прошивки в `index.html`

Файл: `index.html`

Внутри `<select name="firmware">` добавьте опции:
- `value` = имя manifest без `.manifest.json`
- `data-firmware-key` = такой же ключ для i18n

Пример:

```html
<option value="MyDevice_EN" data-firmware-key="MyDevice_EN">MyDevice EN</option>
<option value="MyDevice_EN_DEV" data-firmware-key="MyDevice_EN_DEV">MyDevice EN DEV</option>
<option value="MyDevice_RU" data-firmware-key="MyDevice_RU">MyDevice RU</option>
<option value="MyDevice_RU_DEV" data-firmware-key="MyDevice_RU_DEV">MyDevice RU DEV</option>
```

## 4) Добавьте переводы в `js/i18n.js`

Файл: `js/i18n.js`

Для каждого нового `data-firmware-key` добавьте:
- подпись в `firmwareLabels` для `en` и `ru`
- описание в `manifestDescriptions` для `en` и `ru`

Пример:

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

## 5) Как работает фильтрация прошивок по языку

Текущая логика в `js/main.js`:
- в EN-режиме видны только ключи с `_EN` (+ нейтральные ключи без `_EN/_RU`);
- в RU-режиме видны только ключи с `_RU` (+ нейтральные ключи без `_EN/_RU`).

Отсюда правила именования:
- используйте `_EN`/`_RU`, если прошивка языко-зависимая;
- не используйте `_EN`/`_RU` для нейтральных прошивок (например `em-esp32`, `Hikikomory`).

## 6) Быстрый чеклист перед коммитом

- Имя manifest-файла совпадает со `value` в `index.html`.
- У каждой новой опции есть `data-firmware-key`.
- Для каждого ключа есть записи в `js/i18n.js` (`firmwareLabels` и `manifestDescriptions`, в обоих языках).
- Все пути к бинарникам в manifest корректны.
- Все значения `chipFamily` являются валидными id чипов.
- Кастомное название чипа задано через `chipLabel`, а не через `chipFamily`.

## 7) Частые ошибки

- Добавили кастомный текст в `chipFamily` вместо `chipLabel`.
- Добавили опцию в `index.html`, но забыли i18n-ключи.
- Ошибка в `value` (не совпадает с именем manifest).
- Ожидается языковая фильтрация, но ключи прошивок не содержат `_EN`/`_RU`.

## 8) Минимальный сценарий добавления (end-to-end)

Чтобы добавить `MyDevice` с EN/RU:
1. Добавьте бинарники в `firmware/MyDevice/`.
2. Создайте `manifest/MyDevice_EN.manifest.json` и `manifest/MyDevice_RU.manifest.json`.
3. Добавьте две опции `<option>` в `index.html`.
4. Добавьте ключи в `firmwareLabels` и `manifestDescriptions` (для `en` и `ru`) в `js/i18n.js`.
5. Откройте страницу, переключите язык и проверьте:
   - в списке отображаются только прошивки соответствующего языка,
   - прошивка успешно запускается для выбранного устройства.

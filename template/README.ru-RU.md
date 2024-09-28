# Шаблон

[![En](https://img.shields.io/badge/Language-English-green.svg)](README.md)

- [Шаблон](#шаблон)
  - [Структура папок](#структура-папок)
  - [Описание файлов](#описание-файлов)
  - [Как использовать шаблон](#как-использовать-шаблон)

Эта папка шаблонов предназначена для помощи в создании новых записей о продуктах и брендах. Следуйте приведенным ниже шагам для эффективного использования этого шаблона.

## Структура папок

```text
template/
  brand-name/
    meta.json
    model-name/
      README.md
      meta.json
      dashboard/
        README.md
        dashboard-name.json
      PROTOCOL/
        brand-model-protocol-version.conf
```

## Описание файлов

1. **meta.json** (внутри папки `brand-name`)

   ```json
   {
       "website": "",
       "brand": "Название бренда сенсора",
       "description": "",
       "logo": "Ссылка на логотип бренда"
   }
   ```

   Этот файл содержит информацию о бренде. Заполните поля `website`, `brand`, `description`, и `logo`.

2. **meta.json** (внутри папки `model-name`)

   ```json
   {
       "vendor": "Название бренда сенсора",
       "model": "Имя модели сенсора",
       "url": "ссылка на сайт сенсора",
       "documentation": "Ссылка на документацию датчика (pdf, zip, etc.)",
       "description": "",
       "image_url": "",
       "tags": ["tag1", "tag2"]
   }
   ```

   Этот файл содержит информацию о модели продукта. Заполните поля `vendor`, `model`, `url`, `documentation`, `description`, `image_url`, и `tags`.

3. **README.md** (внутри папки `model-name`)

   ```markdown
   # Brand-name model-name

   - [Brand-name model-name](#brand-name-model-name)
     - [Info](#info)
     - [Changelog](#changelog)
       - [SNMP](#snmp)
       - [Modbus RTU](#modbus-rtu)
       - [Modbus TCP](#modbus-tcp)
       - [Other](#other)

   ## Info

   ## Changelog

   ### SNMP

   version 1.0.0

   - change info

   ### Modbus RTU

   --

   ### Modbus TCP

   --

   ### Other
   ```

   Этот файл содержит структуру документации для модели продукта. Заполните разделы `Информация` и `Изменения`.

4. **README.md** (внутри папки `dashboard`)

   Этот файл содержит информацию о панели мониторинга. Заполните его соответствующей информацией.

5. **dashboard-name.json** (внутри папки `dashboard`)

   Ваш экспортированный дашборд из Grafana, [КАК ЭТО СДЕЛАТЬ](https://grafana.com/docs/grafana/latest/dashboards/share-dashboards-panels/#export-a-dashboard-as-json)

## Как использовать шаблон

1. Скопируйте папку `template/brand-name` в нужное место в вашем каталоге, например, `catalog/YourBrand`.
2. Переименуйте папку `brand-name` в название вашего бренда.
3. Переименуйте папку `model-name` в название вашей модели.
4. Заполните файлы `meta.json` и `README.md` соответствующей информацией.
5. Добавьте папку протокола (например, `catalog\YourBrand\ModelName\SNMP`) и конфигурацию датчика (например, `YourBrand-ModelName-SNMP-version.conf`).
6. При необходимости добавьте и заполните файлы в папке `dashboard`.

Пример использования:

```text
catalog/
  YourBrand/
    meta.json
    YourModel/
      README.md
      meta.json
      dashboard/
        README.md
        dashboard-name.json
      SNMP/
        YourBrand-YourModel-SNMP-1.0.0.conf
      modbusTCP/
        YourBrand-YourModel-modbusTCP-1.0.0.conf
```

Заполните все файлы информацией о вашем бренде и модели.

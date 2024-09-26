# Template

- [Template](#template)
  - [Folder Structure](#folder-structure)
  - [File Descriptions](#file-descriptions)
  - [How to Use the Template](#how-to-use-the-template)

This template folder is designed to help you create new product and brand entries. Follow the steps below to use this template effectively.

## Folder Structure

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

## File Descriptions

1. **meta.json** (inside `brand-name` folder)

   ```json
   {
       "website": "",
       "brand": "brand-name",
       "description": "",
       "logo": "logo url"
   }
   ```

   This file contains information about the brand. Fill in the fields `website`, `brand`, `description`, and `logo`.

2. **meta.json** (inside `model-name` folder)

   ```json
   {
       "vendor": "brand-name",
       "model": "model-name",
       "url": "url to product page",
       "documentation": "url to documentation (pdf, zip, etc.)",
       "description": "",
       "image_url": "",
       "tags": ["tag1", "tag2"]
   }
   ```

   This file contains information about the product model. Fill in the fields `vendor`, `model`, `url`, `documentation`, `description`, `image_url`, and `tags`.

3. **README.md** (inside `model-name` folder)

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

   This file contains the documentation structure for the product model. Fill in the sections `Info` and `Changelog`.

4. **README.md** (inside `dashboard` folder)

   This file contains information about the dashboard. Fill it with the relevant information.

5. **dashboard-name.json** (inside `dashboard` folder)

   Your exported dashboard from Grafana, [HOW TO DO](https://grafana.com/docs/grafana/latest/dashboards/share-dashboards-panels/#export-a-dashboard-as-json)

## How to Use the Template

1. Copy the [`template/brand-name`](./brand-name/) folder to the desired location in your catalog, e.g., `catalog/YourBrand`.
2. Rename the `brand-name` folder to your brand name.
3. Rename the `model-name` folder to your model name.
4. Fill in the `meta.json` and `README.md` files with the relevant information.
5. Add a protocol folder (for example, `catalog\YourBrand\ModelName\SNMP`) and sensor configuration (for example name `YourBrand-ModelName-SNMP-version.conf`).
6. If necessary, add and fill in files in the `dashboard` folder.

Example usage:

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

Fill in all files with information about your brand and model.

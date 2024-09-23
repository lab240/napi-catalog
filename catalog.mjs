// SPDX-FileCopyrightText: 2024 Igor Kha.
// SPDX-License-Identifier: MIT.

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATALOG_PATH = path.join(__dirname, 'catalog');
const OUTPUT_FILE_PATH = path.join(__dirname, 'catalog.json');
const RAW_URL = "https://raw.githubusercontent.com/lab240/napi-catalog/refs/heads/main/";
const READ_URL = "https://github.com/lab240/napi-catalog/blob/main/";

/**
 * Reads and parses a JSON file.
 * @param {string} filePath - Path to the JSON file.
 * @returns {Object|null} Parsed JSON object or null if an error occurs.
 */
async function readMetaJson(filePath) {
  if (typeof filePath !== 'string') {
    throw new TypeError('filePath must be a string');
  }

  try {
    const data = await fs.readFile(filePath, 'utf8');
    if (!data.trim()) {
      console.warn(`Warning: ${filePath} is empty.`);
      return null;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return null;
  }
}

/**
 * Traverses a directory and builds a catalog structure.
 * @param {string} dirPath - Path to the directory.
 * @returns {Object} Catalog structure.
 */
async function traverseDirectory(dirPath) {
  if (typeof dirPath !== 'string') {
    throw new TypeError('dirPath must be a string');
  }

  const result = {};
  const items = await fs.readdir(dirPath);

  await Promise.all(items.map(async (item) => {
    const itemPath = path.join(dirPath, item);
    const stats = await fs.stat(itemPath);

    if (stats.isDirectory()) {
      const lowerCaseItem = item.toLowerCase();
      result[lowerCaseItem] = await traverseDirectory(itemPath);
    } else if (item.toLowerCase() === 'meta.json') {
      const metaJson = await readMetaJson(itemPath);
      if (metaJson) {
        result.meta = { ...result.meta, ...metaJson };
      }
    } else if (item.toLowerCase() === 'readme.md') {
      result.meta = result.meta || {};
      result.meta.readme = `${READ_URL}${path.relative(__dirname, itemPath)}`;
    } else if (item.endsWith('.conf') || item.endsWith('.json')) {
      result.files = result.files || [];
      result.files.push({
        name: item,
        url: `${RAW_URL}${path.relative(__dirname, itemPath)}`
      });
    }
  }));

  return result;
}

(async () => {
  try {
    const catalogStructure = await traverseDirectory(CATALOG_PATH);
    await fs.writeFile(OUTPUT_FILE_PATH, JSON.stringify(catalogStructure, null, 2), 'utf8');
    console.log(`Catalog structure saved to ${OUTPUT_FILE_PATH}`);
  } catch (err) {
    console.error(`Error processing catalog:`, err);
  }
})();

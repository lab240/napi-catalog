/*
 * SPDX-FileCopyrightText: 2024 Igor Kha.
 * SPDX-License-Identifier: MIT.
 */
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const catalogPath = path.join(__dirname, 'catalog');
const outputFilePath = path.join(__dirname, 'catalog.json');
const rawUrl = "https://raw.githubusercontent.com/lab240/napi-catalog/refs/heads/main/";
const readUrl = "https://github.com/lab240/napi-catalog/blob/main/";

async function readMetaJson(filePath) {
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

async function traverseDirectory(dirPath) {
  const result = {};
  const items = await fs.readdir(dirPath);

  for (const item of items) {
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
      result.meta.readme = `${readUrl}${path.relative(__dirname, itemPath)}`;
    } else if (item.endsWith('.conf') || item.endsWith('.json')) {
      result.files = result.files || [];
      result.files.push({
        name: item,
        url: `${rawUrl}${path.relative(__dirname, itemPath)}`
      });
    }
  }

  return result;
}

(async () => {
  try {
    const catalogStructure = await traverseDirectory(catalogPath);
    await fs.writeFile(outputFilePath, JSON.stringify(catalogStructure, null, 2), 'utf8');
    console.log(`Catalog structure saved to ${outputFilePath}`);
  } catch (err) {
    console.error(`Error processing catalog:`, err);
  }
})();

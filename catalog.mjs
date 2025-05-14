// SPDX-FileCopyrightText: 2024 Igor Kha.
// SPDX-License-Identifier: MIT.

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Directory and path setup
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = path.join(__dirname, "catalog");
const OUTPUT_FILE_PATH = path.join(__dirname, "catalog.json");
const RAW_URL =
  "https://raw.githubusercontent.com/lab240/napi-catalog/refs/heads/main/";
const READ_URL = "https://github.com/lab240/napi-catalog/blob/main/";

// Protocol types for config classification
const PROTOCOL_NAMES = new Set([
  "modbusrtu",
  "modbustcp",
  "mqtt",
  "opcua",
  "snmp",
  "http",
]);

/**
 * @typedef {Object} FileObject
 * @property {string} name - File name
 * @property {string} url - URL to the file
 * @property {string} [tag] - Optional tag for the file
 */

/**
 * @typedef {Object} TraverseOptions
 * @property {boolean} [isDashboard=false] - Whether the current directory is a dashboard
 * @property {boolean} [parentIsProtocol=false] - Whether the parent directory is a protocol
 */

/**
 * Reads and parses a JSON file
 * @param {string} filePath - Path to the JSON file
 * @returns {Promise<Object|null>} Parsed JSON object or null if an error occurs
 */
async function readMetaJson(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return data.trim() ? JSON.parse(data) : null;
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    return null;
  }
}

/**
 * Creates a file object with name and URL
 * @param {string} itemPath - Path to the file
 * @param {string} itemName - Name of the file
 * @returns {FileObject} File object with name and URL
 */
function createFileObject(itemPath, itemName) {
  return {
    name: itemName,
    url: `${RAW_URL}${path.relative(__dirname, itemPath)}`,
  };
}

/**
 * Processes a file based on its type and location
 * @param {string} itemPath - Path to the file
 * @param {string} itemName - Name of the file
 * @param {Object} result - The result object to update
 * @param {Object} options - Processing options
 */
function processFile(
  itemPath,
  itemName,
  result,
  { isDashboard, isProtocol, dirName, passUpConfigs }
) {
  const lowerCaseName = itemName.toLowerCase();

  if (lowerCaseName === "meta.json") {
    // Meta.json files are handled separately with async reading
    return;
  } else if (lowerCaseName === "readme.md") {
    result.meta = result.meta || {};
    result.meta.readme = `${READ_URL}${path.relative(__dirname, itemPath)}`;
  } else if (itemName.endsWith(".conf")) {
    const config = createFileObject(itemPath, itemName);

    if (isProtocol) {
      config.tag = dirName;
      passUpConfigs.push(config);
    } else {
      const collection = isDashboard ? "files" : "configs";
      result[collection] = result[collection] || [];
      result[collection].push(config);
    }
  } else if (itemName.endsWith(".json")) {
    result.files = result.files || [];
    result.files.push(createFileObject(itemPath, itemName));
  }
}

/**
 * Traverses a directory and builds a catalog structure with flattened protocols
 * @param {string} dirPath - Path to the directory
 * @param {TraverseOptions} options - Additional options
 * @returns {Promise<Object>} Catalog structure
 */
async function traverseDirectory(dirPath, options = {}) {
  const result = {};

  try {
    const items = await fs.readdir(dirPath);
    const relativePath = path.relative(CATALOG_PATH, dirPath).toLowerCase();
    const isDashboard =
      relativePath === "dashboard" || relativePath.startsWith("dashboard/");
    const dirName = path.basename(dirPath).toLowerCase();
    const isProtocol = PROTOCOL_NAMES.has(dirName);

    // Storage for configs that need to be passed up to parent
    const passUpConfigs = [];

    // Group files by type for better processing
    const directories = [];
    const metaFiles = [];
    const otherFiles = [];

    // First pass: categorize items
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = await fs.stat(itemPath);

      if (stats.isDirectory()) {
        directories.push({ name: item, path: itemPath });
      } else if (item.toLowerCase() === "meta.json") {
        metaFiles.push({ name: item, path: itemPath });
      } else {
        otherFiles.push({ name: item, path: itemPath });
      }
    }

    // Process meta files first to set up metadata
    await Promise.all(
      metaFiles.map(async ({ name, path }) => {
        const metaJson = await readMetaJson(path);
        if (metaJson) {
          result.meta = { ...result.meta, ...metaJson };
        }
      })
    );

    // Process other files
    otherFiles.forEach(({ name, path }) => {
      processFile(path, name, result, {
        isDashboard,
        isProtocol,
        dirName,
        passUpConfigs,
      });
    });

    // Process directories last (depth-first traversal)
    await Promise.all(
      directories.map(async ({ name, path }) => {
        const lowerCaseItem = name.toLowerCase();
        const subResult = await traverseDirectory(path, {
          isDashboard,
          parentIsProtocol: isProtocol,
        });

        // Handle configs passed up from protocol directories
        if (subResult.passUpConfigs?.length > 0) {
          result.configs = result.configs || [];
          result.configs.push(...subResult.passUpConfigs);
          // Remove passUpConfigs so it doesn't appear in the final structure
          delete subResult.passUpConfigs;
        }

        // Only add subdirectory if it has content
        if (Object.keys(subResult).length > 0) {
          result[lowerCaseItem] = subResult;
        }
      })
    );

    // If this is a protocol directory, pass configs up to parent
    if (isProtocol && passUpConfigs.length > 0) {
      return { passUpConfigs };
    }

    // If we got configs to pass up, add them to the result
    if (passUpConfigs.length > 0) {
      result.passUpConfigs = passUpConfigs;
    }

    return result;
  } catch (err) {
    console.error(`Error processing directory ${dirPath}:`, err.message);
    // Return an empty result rather than failing completely
    return result;
  }
}

/**
 * Main execution function
 */
async function main() {
  const startTime = performance.now();

  try {
    console.log(`Starting catalog build from ${CATALOG_PATH}...`);
    const catalogStructure = await traverseDirectory(CATALOG_PATH);

    // Remove any remaining passUpConfigs property from the root
    if (catalogStructure.passUpConfigs) {
      delete catalogStructure.passUpConfigs;
    }

    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_FILE_PATH);
    await fs.mkdir(outputDir, { recursive: true });

    await fs.writeFile(
      OUTPUT_FILE_PATH,
      JSON.stringify(catalogStructure, null, 2),
      "utf8"
    );

    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    console.log(
      `Catalog structure saved to ${OUTPUT_FILE_PATH} (${duration}s)`
    );
  } catch (err) {
    console.error("Error processing catalog:", err);
    process.exit(1);
  }
}

// Execute the program if this module is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error("Uncaught error:", err);
    process.exit(1);
  });
}

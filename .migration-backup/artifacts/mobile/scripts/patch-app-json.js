#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const appJsonPath = resolve(__dirname, "../app.json");

const devDomain = process.env.REPLIT_DEV_DOMAIN;
if (!devDomain) {
  console.log("REPLIT_DEV_DOMAIN not set, skipping app.json patch");
  process.exit(0);
}

const origin = `https://${devDomain}`;
const appJson = JSON.parse(readFileSync(appJsonPath, "utf8"));

const plugins = appJson.expo.plugins || [];
appJson.expo.plugins = plugins.map((plugin) => {
  if (Array.isArray(plugin) && plugin[0] === "expo-router") {
    return [plugin[0], { ...plugin[1], origin }];
  }
  return plugin;
});

writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + "\n");
console.log(`Patched app.json with origin: ${origin}`);

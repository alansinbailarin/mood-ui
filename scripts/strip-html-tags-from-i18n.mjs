#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";

const COMPONENT_NAMES = [
  "ClientOnly",
  "ModoProvider",
  "NuxtLayout",
  "NuxtPage",
  "ToastContainer",
  "ConfirmDialog",
  "Modal",
  "Tooltip",
  "PopoverPanel",
  "Drawer",
  "Button",
  "Card",
  "Input",
  "RouterView",
  "App",
];
const HTML_TAGS = ["body", "head", "html"];

for (const locale of ["en", "es"]) {
  const path = `apps/showroom/i18n/locales/${locale}/docs.json`;
  let raw = readFileSync(path, "utf8");
  for (const name of [...COMPONENT_NAMES, ...HTML_TAGS]) {
    const open = new RegExp(`<${name}([\\s/]*)>`, "g");
    const close = new RegExp(`</${name}>`, "g");
    raw = raw.replace(open, name);
    raw = raw.replace(close, name);
  }
  writeFileSync(path, raw);
  console.log(`Patched ${path}`);
}

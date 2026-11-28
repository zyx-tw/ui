// Fails when the one stylesheet every app imports
// (registry/zyx/styles/globals.css) drifts from what the registry ships
// to other projects: the base item's tokens in registry.json, and the
// keyframes and animations of the component items.
import { readFile } from "node:fs/promises";

const root = new URL("..", import.meta.url);
const css = await readFile(
  new URL("registry/zyx/styles/globals.css", root),
  "utf8"
);
const registry = JSON.parse(
  await readFile(new URL("registry.json", root), "utf8")
);

const normalize = (value) =>
  value.replace(/\s+/g, " ").replace(/\( /g, "(").replace(/ \)/g, ")").trim();

function readBlock(selector) {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`globals.css has no ${selector} block`);
  const body = css.slice(start, css.indexOf("\n}", start));
  return Object.fromEntries(
    [...body.matchAll(/--([\w*-]+):\s*([^;]+);/g)].map((m) => [
      m[1],
      normalize(m[2]),
    ])
  );
}

let failed = false;
function compare(scope, actual, expected) {
  for (const name of new Set([
    ...Object.keys(actual),
    ...Object.keys(expected),
  ])) {
    if (actual[name] !== expected[name]) {
      console.error(
        `${scope} --${name}: globals.css=${actual[name]} registry.json=${expected[name]}`
      );
      failed = true;
    }
  }
}

const base = registry.items.find((item) => item.name === "base");
if (!base?.cssVars)
  throw new Error("registry.json has no base item with cssVars");

// @theme inline also maps the colors, which the CLI writes on its own; the
// rest must be exactly the base's theme plus the components' animations.
const theme = readBlock("@theme inline");
const shipped = { ...base.cssVars.theme };
for (const item of registry.items) {
  for (const [name, value] of Object.entries(item.cssVars?.theme ?? {})) {
    if (item !== base) shipped[name] = value;
  }
}
compare(
  "theme",
  Object.fromEntries(
    Object.entries(theme).filter(([name]) => !name.startsWith("color-"))
  ),
  Object.fromEntries(
    Object.entries(shipped).map(([name, value]) => [name, normalize(value)])
  )
);
compare("light", readBlock(":root"), base.cssVars.light);
// One fixed theme: there is no .dark block to compare.
if (base.cssVars.dark) {
  console.error("registry.json base ships a dark theme; there is one theme");
  failed = true;
}

// Every color the base defines is mapped for Tailwind, and nothing else is.
const colors = Object.keys(theme).filter((name) => name.startsWith("color-"));
const defined = Object.keys(base.cssVars.light).filter(
  (name) => name !== "radius"
);
compare(
  "color mapping",
  Object.fromEntries(colors.map((name) => [name, theme[name]])),
  Object.fromEntries(defined.map((name) => [`color-${name}`, `var(--${name})`]))
);

// And the other way: a utility defined here that a shipped file uses must
// ship with some item, or a project outside this repo renders it as nothing.
const shippedUtilities = new Set(
  registry.items.flatMap((item) =>
    Object.keys(item.css ?? {})
      .filter((rule) => rule.startsWith("@utility "))
      .map((rule) => rule.slice("@utility ".length))
  )
);
const sources = await Promise.all(
  registry.items
    .flatMap((item) => item.files ?? [])
    .map((file) =>
      readFile(new URL(`apps/ui/${file.path}`, root), "utf8").catch(() => "")
    )
);
const shippedSource = sources.join("\n");
for (const [, name] of css.matchAll(/@utility ([\w-]+\*?) \{/g)) {
  if (shippedUtilities.has(name)) continue;
  const stem = name.replace(/\*$/, "");
  const pattern = new RegExp(
    `(?<![\\w-])${stem}${name.endsWith("*") ? "\\d" : "(?![\\w-])"}`
  );
  if (pattern.test(shippedSource)) {
    console.error(
      `registry ships a file that uses @utility ${name}, but no item ships it`
    );
    failed = true;
  }
}

// Plain selector rules an item ships (a component's own CSS) must exist here
// with the same values, so a project that adds the item gets what this site
// shows. Every block for the selector counts; :root and selector lists are
// left to the token checks above.
const ruleProps = (selector) => {
  const found = {};
  let at = css.indexOf(`\n${selector} {`);
  if (at === -1) return null;
  while (at !== -1) {
    const body = css.slice(at, css.indexOf("\n}", at + 1));
    for (const m of body.matchAll(/^\s*([\w-]+)\s*:\s*([^;]+);/gm))
      found[m[1]] = normalize(m[2]);
    at = css.indexOf(`\n${selector} {`, at + 1);
  }
  return found;
};
for (const item of registry.items) {
  for (const [rule, props] of Object.entries(item.css ?? {})) {
    if (rule.startsWith("@") || rule.startsWith(":root") || rule.includes(","))
      continue;
    if (Object.values(props).some((value) => typeof value === "object"))
      continue;
    const actual = ruleProps(rule);
    if (!actual) {
      console.error(`globals.css has no rule ${rule} (from ${item.name})`);
      failed = true;
      continue;
    }
    for (const [name, value] of Object.entries(props)) {
      if (actual[name] !== normalize(value)) {
        console.error(
          `${item.name} ${rule} ${name}: globals.css=${actual[name]} registry.json=${value}`
        );
        failed = true;
      }
    }
  }
}

// Utilities and keyframes the registry ships must exist here too.
for (const item of registry.items) {
  for (const rule of Object.keys(item.css ?? {})) {
    if (!rule.startsWith("@utility") && !rule.startsWith("@keyframes"))
      continue;
    if (!css.includes(`${rule} {`)) {
      console.error(`globals.css is missing ${rule} (from ${item.name})`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log("theme in sync");

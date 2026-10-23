import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const directory = dirname(fileURLToPath(import.meta.url));
const [html, css, javascript] = await Promise.all([
  readFile(join(directory, "index.html"), "utf8"),
  readFile(join(directory, "styles.css"), "utf8"),
  readFile(join(directory, "script.js"), "utf8"),
]);

const standalone = html
  .replace(
    '<link rel="stylesheet" href="styles.css">',
    `<style>\n${css}\n    </style>`,
  )
  .replace(
    '<script src="script.js"></script>',
    `<script>\n${javascript}\n    </script>`,
  );

await writeFile(join(directory, "agencyos-landing.html"), standalone, "utf8");

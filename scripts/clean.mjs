import { rmSync } from "node:fs";
// Clean generated output so deleting a recipe or making it a draft unpublishes it.
rmSync(new URL("../_site/", import.meta.url), { recursive: true, force: true });

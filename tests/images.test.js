import { test } from "node:test";
import assert from "node:assert/strict";
import { prepareImage } from "../src/images.js";
test("rechaza archivos no admitidos y demasiado grandes antes de decodificar", async () => {
  await assert.rejects(
    prepareImage({ type: "image/svg+xml", size: 20 }),
    /JPG, PNG o WebP/,
  );
  await assert.rejects(
    prepareImage({ type: "image/jpeg", size: 9 * 1024 * 1024 }),
    /8 MB/,
  );
});

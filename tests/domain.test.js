import { test } from "node:test";
import assert from "node:assert/strict";
import { nextStock, csv } from "../src/config.js";
test("entradas, salidas y ajuste a cero", () => {
  assert.equal(nextStock(5, "entrada", 3), 8);
  assert.equal(nextStock(5, "salida", 3), 2);
  assert.equal(nextStock(5, "ajuste", 0), 0);
  assert.throws(() => nextStock(5, "salida", 6));
  assert.throws(() => nextStock(5, "entrada", NaN));
  assert.throws(() => nextStock(5, "salida", 0));
});
test("CSV escapa comillas y neutraliza fórmulas", () => {
  const result = csv([
    {
      name: "=SUM(A1)",
      sku: 'A"B',
      category: "",
      description: "",
      cost: 1,
      price: 2,
      quantity: 3,
      minimum: 1,
    },
  ]);
  assert.ok(result.includes("'="));
  assert.ok(result.includes('A""B'));
  assert.ok(result.startsWith("\uFEFF"));
});
test("fracciones y límites de stock", () => {
  assert.equal(nextStock(0.1, "entrada", 0.2), 0.3);
  assert.throws(() => nextStock(1, "inventado", 2));
  assert.throws(() => nextStock(1000000000, "entrada", 1));
});

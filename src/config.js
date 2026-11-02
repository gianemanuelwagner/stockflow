export const APP_NAME = "StockFlow";
export const money = (n) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(n);
export function date(v) {
  const parsed = v?.toDate ? v.toDate() : new Date(v);
  if (!Number.isFinite(parsed.getTime())) return 'Fecha no disponible';
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(parsed);
}
export function nextStock(current, type, amount) {
  if (!["entrada", "salida", "ajuste"].includes(type))
    throw new Error("El tipo de movimiento no es válido.");
  if (
    !Number.isFinite(amount) ||
    amount > 1000000000 ||
    amount < 0 ||
    (type !== "ajuste" && amount === 0)
  )
    throw new Error("Ingresá una cantidad válida.");
  const next =
    type === "entrada"
      ? current + amount
      : type === "salida"
        ? current - amount
        : amount;
  if (!Number.isFinite(next) || next < 0)
    throw new Error("No hay stock suficiente.");
  if (next > 1000000000)
    throw new Error("La cantidad supera el máximo admitido.");
  return Math.round(next * 1000000) / 1000000;
}
export function csv(products) {
  const cell = (value) =>
    '"' +
    String(/^(?:\s*[=+\-@]|[\t\r\n])/.test(String(value)) ? "'" + value : value).replaceAll(
      '"',
      '""',
    ) +
    '"';
  return (
    "\uFEFF" +
    [
      [
        "Nombre",
        "SKU",
        "Categoría",
        "Descripción",
        "Costo ARS",
        "Venta ARS",
        "Cantidad",
        "Mínimo",
        "Archivado",
      ],
      ...products.map((p) => [
        p.name,
        p.sku,
        p.category,
        p.description,
        p.cost,
        p.price,
        p.quantity,
        p.minimum,
        p.archived ? "Sí" : "No",
      ]),
    ]
      .map((row) => row.map(cell).join(";"))
      .join("\r\n")
  );
}
export function errorMessage(error) {
  const messages = {
    "auth/invalid-credential": "El email o la contraseña no coinciden.",
    "auth/email-already-in-use": "Ese email ya tiene una cuenta.",
    "auth/weak-password": "Usá una contraseña de al menos 6 caracteres.",
    "auth/invalid-email": "Revisá el email ingresado.",
    "auth/network-request-failed": "No pudimos conectar. Revisá tu conexión.",
    "auth/too-many-requests": "Demasiados intentos. Probá de nuevo más tarde.",
    "permission-denied":
      "No tenés acceso. Tu cuenta puede estar suspendida o faltan desplegar las reglas.",
    unavailable: "No pudimos conectar con la base de datos.",
    "resource-exhausted": "Se alcanzó la cuota gratuita. Probá más tarde.",
  };
  return (
    messages[error.code] ||
    error.message ||
    "No pudimos completar la operación."
  );
}

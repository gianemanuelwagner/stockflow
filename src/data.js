import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  setDoc,
  updateDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { nextStock } from "./config";
export const listen = (type, uid, callback, error) =>
  onSnapshot(
    uid
      ? query(collection(db, type), where("ownerId", "==", uid))
      : collection(db, type),
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    error,
  );
export async function saveProduct(uid, values, existing) {
  const ref = existing
    ? doc(db, "products", existing.id)
    : doc(collection(db, "products"));
  if (existing) return updateDoc(ref, values);
  const movement = doc(collection(db, "movements"));
  return runTransaction(db, async (tx) => {
    tx.set(ref, {
      ...values,
      quantity: values.quantity,
      ownerId: uid,
      archived: false,
      createdAt: serverTimestamp(),
    });
    tx.set(movement, {
      ownerId: uid,
      productId: ref.id,
      productName: values.name,
      type: "inicial",
      amount: values.quantity,
      before: 0,
      after: values.quantity,
      reason: "Stock inicial",
      date: new Date().toISOString(),
      createdAt: serverTimestamp(),
    });
  });
}
export async function moveStock(uid, product, type, amount, reason, date) {
  const ref = doc(db, "products", product.id),
    movement = doc(collection(db, "movements"));
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists() || snap.data().archived)
      throw new Error("El producto ya no está disponible.");
    const before = snap.data().quantity,
      after = nextStock(before, type, amount);
    tx.update(ref, { quantity: after });
    tx.set(movement, {
      ownerId: uid,
      productId: product.id,
      productName: snap.data().name,
      type,
      amount,
      before,
      after,
      reason,
      date,
      createdAt: serverTimestamp(),
    });
  });
}
export const saveCategory = (uid, name, id) =>
  id
    ? updateDoc(doc(db, "categories", id), { name })
    : setDoc(doc(collection(db, "categories")), { ownerId: uid, name });

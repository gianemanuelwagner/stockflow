import { test, before, after } from "node:test";
import { readFileSync } from "node:fs";
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from "@firebase/rules-unit-testing";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
let env;
const enabled = !!process.env.FIRESTORE_EMULATOR_HOST;
before(async () => {
  if (!enabled) return;
  env = await initializeTestEnvironment({
    projectId: "demo-stockflow",
    firestore: { rules: readFileSync("firestore.rules", "utf8") },
  });
  await env.withSecurityRulesDisabled(async (ctx) => {
    for (const [id, role, status] of [
      ["alice", "user", "active"],
      ["bob", "user", "active"],
      ["boss", "admin", "active"],
      ["blocked", "user", "suspended"],
    ])
      await setDoc(doc(ctx.firestore(), "users", id), {
        name: id,
        business: "Prueba",
        email: id + "@example.test",
        role,
        status,
        createdAt: new Date(),
      });
    for (const uid of ["alice", "bob", "blocked"])
      await setDoc(doc(ctx.firestore(), "products", uid), {
        ownerId: uid,
        name: "Yerba",
        sku: uid,
        category: "",
        description: "",
        cost: 100,
        price: 200,
        quantity: 5,
        minimum: 1,
        archived: false,
        createdAt: new Date(),
      });
  });
});
after(async () => {
  if (env) await env.cleanup();
});
const db = (id) =>
  env.authenticatedContext(id, { email: id + "@example.test" }).firestore();
test(
  "aislamiento, consultas y administración",
  { skip: !enabled },
  async () => {
    await assertSucceeds(getDoc(doc(db("alice"), "products", "alice")));
    await assertFails(getDoc(doc(db("alice"), "products", "bob")));
    await assertFails(getDocs(collection(db("alice"), "products")));
    await assertSucceeds(
      getDocs(
        query(
          collection(db("alice"), "products"),
          where("ownerId", "==", "alice"),
        ),
      ),
    );
    await assertSucceeds(getDoc(doc(db("boss"), "products", "bob")));
    await assertSucceeds(getDocs(collection(db("boss"), "users")));
    await assertFails(getDocs(collection(db("alice"), "users")));
    await assertFails(
      getDoc(
        doc(env.unauthenticatedContext().firestore(), "products", "alice"),
      ),
    );
  },
);
test(
  "roles, estado e identidad no se pueden escalar",
  { skip: !enabled },
  async () => {
    await assertFails(
      updateDoc(doc(db("alice"), "users", "alice"), { role: "admin" }),
    );
    await assertFails(
      updateDoc(doc(db("alice"), "users", "alice"), {
        email: "other@example.test",
      }),
    );
    await assertFails(
      updateDoc(doc(db("blocked"), "users", "blocked"), { status: "active" }),
    );
    await assertFails(getDoc(doc(db("blocked"), "products", "blocked")));
    await assertFails(
      updateDoc(doc(db("alice"), "products", "alice"), { ownerId: "bob" }),
    );
    await assertFails(
      updateDoc(doc(db("alice"), "products", "alice"), { quantity: -1 }),
    );
    await assertFails(deleteDoc(doc(db("alice"), "users", "alice")));
    await assertSucceeds(
      updateDoc(doc(db("boss"), "users", "bob"), { status: "suspended" }),
    );
    await assertFails(getDoc(doc(db("bob"), "products", "bob")));
    await assertSucceeds(
      updateDoc(doc(db("boss"), "users", "bob"), { status: "active" }),
    );
    await assertSucceeds(getDoc(doc(db("bob"), "products", "bob")));
  },
);
test(
  "registro solo crea usuario activo y sin contraseñas",
  { skip: !enabled },
  async () => {
    const profile = {
      name: "Nuevo",
      business: "Prueba",
      email: "new@example.test",
      role: "admin",
      status: "active",
      createdAt: serverTimestamp(),
    };
    await assertFails(setDoc(doc(db("new"), "users", "new"), profile));
    await assertFails(
      setDoc(doc(db("new"), "users", "new"), {
        ...profile,
        role: "user",
        password: "nunca",
      }),
    );
    await assertSucceeds(
      setDoc(doc(db("new"), "users", "new"), { ...profile, role: "user" }),
    );
  },
);
test(
  "categorías y movimientos también aíslan propietarios y validan campos",
  { skip: !enabled },
  async () => {
    const alice = db("alice");
    await assertSucceeds(
      setDoc(doc(alice, "categories", "cat-a"), {
        ownerId: "alice",
        name: "Almacén",
      }),
    );
    await assertFails(getDoc(doc(db("bob"), "categories", "cat-a")));
    await assertSucceeds(getDoc(doc(db("boss"), "categories", "cat-a")));
    await assertFails(
      setDoc(doc(alice, "categories", "cat-b"), {
        ownerId: "bob",
        name: "Ajeno",
      }),
    );
    const movement = {
      ownerId: "alice",
      productId: "alice",
      productName: "Yerba",
      type: "entrada",
      amount: 2,
      before: 5,
      after: 7,
      reason: "Compra",
      date: new Date().toISOString(),
      createdAt: serverTimestamp(),
    };
    await assertSucceeds(setDoc(doc(alice, "movements", "move-a"), movement));
    await assertFails(getDoc(doc(db("bob"), "movements", "move-a")));
    await assertSucceeds(getDoc(doc(db("boss"), "movements", "move-a")));
    await assertFails(
      updateDoc(doc(alice, "movements", "move-a"), { amount: 999 }),
    );
    await assertFails(deleteDoc(doc(alice, "movements", "move-a")));
    await assertFails(
      setDoc(doc(alice, "movements", "move-b"), {
        ...movement,
        password: "nunca",
      }),
    );
    await assertSucceeds(deleteDoc(doc(alice, "categories", "cat-a")));
  },
);

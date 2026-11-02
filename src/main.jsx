import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import {
  Package,
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  ShieldCheck,
  Plus,
  Search,
  LogOut,
  Download,
  X,
  ArrowUpRight,
  Archive,
  Pencil,
  Menu,
} from "lucide-react";
import { APP_NAME, money, date, csv, nextStock, errorMessage } from "./config";
import { auth, db, configured } from "./firebase";
import { listen, saveProduct, moveStock, saveCategory } from "./data";
import "./style.css";
import ImagePicker from "./ImagePicker";
const seed = [
  {
    id: "1",
    name: "Yerba mate · 1 kg",
    sku: "ALM-001",
    category: "Almacén",
    description: "Datos de ejemplo",
    cost: 4200,
    price: 5900,
    quantity: 24,
    minimum: 8,
  },
  {
    id: "2",
    name: "Café molido · 250 g",
    sku: "ALM-002",
    category: "Almacén",
    description: "Datos de ejemplo",
    cost: 5100,
    price: 7400,
    quantity: 5,
    minimum: 6,
  },
  {
    id: "3",
    name: "Aceite de girasol · 900 ml",
    sku: "ALM-003",
    category: "Almacén",
    description: "Datos de ejemplo",
    cost: 2400,
    price: 3400,
    quantity: 18,
    minimum: 5,
  },
  {
    id: "4",
    name: "Jabón líquido · 500 ml",
    sku: "LIM-001",
    category: "Limpieza",
    description: "Datos de ejemplo",
    cost: 1800,
    price: 2700,
    quantity: 3,
    minimum: 5,
  },
].map((p) => ({ ...p, ownerId: "demo", archived: false }));
const emptyProduct = {
  name: "",
  sku: "",
  category: "",
  description: "",
  cost: 0,
  price: 0,
  quantity: 0,
  minimum: 0,
};
function Field({ label, ...props }) {
  return (
    <label>
      {label}
      <input {...props} />
    </label>
  );
}
function App() {
  const [user, setUser] = useState(null),
    [profile, setProfile] = useState(null),
    [ready, setReady] = useState(!configured),
    [demo, setDemo] = useState(false),
    [page, setPage] = useState(
      location.pathname === "/admin" ? "admin" : "dashboard",
    );
  const [products, setProducts] = useState([]),
    [categories, setCategories] = useState([]),
    [movements, setMovements] = useState([]),
    [accounts, setAccounts] = useState([]),
    [selected, setSelected] = useState(null),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState(""),
    [archived, setArchived] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [imageBusy, setImageBusy] = useState(false),
    [loading, setLoading] = useState(false),
    [modal, setModal] = useState(null),
    [menu, setMenu] = useState(false),
    [mode, setMode] = useState("login");
  useEffect(() => {
    if (!modal) return;
    const previous = document.activeElement;
    const dialog = document.querySelector('[role="dialog"]');
    const focusables = () => [
      ...dialog.querySelectorAll("button:not([disabled]),input,select"),
    ];
    focusables()[0]?.focus();
    const key = (e) => {
      if (e.key === "Escape" && !busy) setModal(null);
      if (e.key === "Tab") {
        const elements = focusables(),
          first = elements[0],
          last = elements.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, [modal, busy]);
  const report = (e) => setError(errorMessage(e));
  const execute = async (fn) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await fn();
      return true;
    } catch (e) {
      report(e);
      return false;
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    document.title = APP_NAME;
    if (!configured) return;
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setProfile(null);
      setReady(true);
    });
  }, []);
  useEffect(() => {
    if (!user || demo) return;
    return onSnapshot(
      doc(db, "users", user.uid),
      (s) => setProfile(s.exists() ? s.data() : { missing: true }),
      report,
    );
  }, [user, demo]);
  const uid = selected?.id || user?.uid;
  useEffect(() => {
    if (demo || !profile || profile.status !== "active") return;
    setLoading(true);
    setProducts([]);
    setCategories([]);
    setMovements([]);
    let count = 0;
    const loaded = (setter) => (data) => {
      setter(data);
      if (++count >= 3) setLoading(false);
    };
    const failed = (e) => {
      setLoading(false);
      report(e);
    };
    const stops = [
      listen("products", uid, loaded(setProducts), failed),
      listen("categories", uid, loaded(setCategories), failed),
      listen("movements", uid, loaded(setMovements), failed),
    ];
    return () => stops.forEach((f) => f());
  }, [uid, profile, demo]);
  useEffect(() => {
    if (!demo && profile?.role === "admin" && profile.status === "active")
      return listen("users", null, setAccounts, report);
  }, [profile, demo]);
  useEffect(() => {
    const handler = () =>
      setPage(
        location.pathname === "/admin"
          ? "admin"
          : location.pathname === "/privacy"
            ? "privacy"
            : "dashboard",
      );
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);
  function navigate(p) {
    setPage(p);
    setMenu(false);
    history.pushState(
      {},
      "",
      p === "admin" ? "/admin" : p === "privacy" ? "/privacy" : "/",
    );
  }
  function startDemo() {
    setDemo(true);
    setUser({ uid: "demo" });
    setProfile({
      name: "Tu negocio de ejemplo",
      business: "Almacén de ejemplo",
      role: "user",
      status: "active",
    });
    setProducts(seed);
    setCategories([
      { id: "c1", name: "Almacén" },
      { id: "c2", name: "Limpieza" },
    ]);
    setMovements([]);
    navigate("dashboard");
  }
  async function authenticate(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    await execute(async () => {
      if (mode === "reset") {
        await sendPasswordResetEmail(auth, f.email);
        setNotice(
          "Si el email está registrado, vas a recibir las instrucciones.",
        );
        return;
      }
      if (mode === "register") {
        const credential = await createUserWithEmailAndPassword(
          auth,
          f.email,
          f.password,
        );
        await setDoc(doc(db, "users", credential.user.uid), {
          name: f.name.trim(),
          business: f.business.trim(),
          email: credential.user.email,
          role: "user",
          status: "active",
          createdAt: serverTimestamp(),
        });
      } else await signInWithEmailAndPassword(auth, f.email, f.password);
    });
  }
  async function logout() {
    if (!demo) await execute(() => signOut(auth));
    setDemo(false);
    setUser(null);
    setProfile(null);
    setSelected(null);
    setProducts([]);
    setMovements([]);
    navigate("dashboard");
  }
  const privacy = (
    <>
      <h1>Privacidad</h1>
      <p>
        Guardamos tu email, nombre, nombre del negocio, fecha de alta, estado de
        la cuenta y los productos, categorías y movimientos que cargás, incluida
        tu foto de perfil y las imágenes de productos que elijas guardar.
      </p>
      <p>
        Firebase Authentication administra tu contraseña. Nunca se guarda en
        Firestore ni se muestra en la aplicación. El administrador del servicio
        puede consultar la información de las cuentas y sus inventarios para
        administrar la plataforma, y suspender o reactivar cuentas.
      </p>
      <p>
        Los datos se alojan en Firebase (Google). Para solicitar correcciones o
        eliminación, contactá al responsable de la instancia que estás usando.
        Esta aplicación no incluye publicidad ni herramientas de seguimiento.
      </p>
      <button onClick={() => navigate("dashboard")}>Volver</button>
    </>
  );
  if (page === "privacy" || location.pathname === "/privacy")
    return <main className="privacy">{privacy}</main>;
  if (!ready)
    return (
      <main className="auth">
        <p>Cargando tu sesión…</p>
      </main>
    );
  if (!user)
    return (
      <div className="auth">
        <section className="auth-story">
          <div className="brand">
            <Package />
            {APP_NAME}
            <span> / </span>
          </div>
          <div>
            <span className="eyebrow">MENOS PLANILLAS. MÁS CLARIDAD.</span>
            <h1>
              Tu negocio,
              <br />
              en orden.
            </h1>
            <p>
              Todo tu inventario en un solo lugar.
              <br />
              Simple, gratuito y a tu ritmo.
            </p>
            <div className="story-line">
              01 — Productos &nbsp; 02 — Movimientos &nbsp; 03 — Control
            </div>
          </div>
          <small>Hecho para pequeños negocios.</small>
        </section>
        <section className="auth-form">
          <span className="eyebrow">BIENVENIDO A TU ESPACIO</span>
          <h2>
            {mode === "register"
              ? "Creá tu cuenta"
              : mode === "reset"
                ? "Recuperá tu acceso"
                : "Qué bueno verte"}
          </h2>
          <p className="muted">Empezá a llevar el control de tu stock.</p>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="notice">
              {notice}
            </p>
          )}
          {configured ? (
            <form onSubmit={authenticate}>
              {mode === "register" && (
                <>
                  <Field
                    label="Tu nombre"
                    name="name"
                    required
                    maxLength="120"
                  />
                  <Field
                    label="Nombre del negocio"
                    name="business"
                    required
                    maxLength="120"
                  />
                </>
              )}
              <Field
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
              {mode !== "reset" && (
                <Field
                  label="Contraseña"
                  name="password"
                  type="password"
                  minLength="6"
                  autoComplete={
                    mode === "register" ? "new-password" : "current-password"
                  }
                  required
                />
              )}
              <button className="primary" disabled={busy}>
                {busy
                  ? "Un momento…"
                  : mode === "register"
                    ? "Crear cuenta"
                    : mode === "reset"
                      ? "Enviar instrucciones"
                      : "Ingresar"}
              </button>
            </form>
          ) : (
            <p className="notice">
              Falta conectar Firebase. Podés explorar la demo local con datos de
              ejemplo.
            </p>
          )}
          <div className="auth-links">
            {configured && (
              <>
                <button
                  onClick={() =>
                    setMode(mode === "register" ? "login" : "register")
                  }
                >
                  {mode === "register" ? "Ya tengo cuenta" : "Crear una cuenta"}
                </button>
                <button
                  onClick={() => setMode(mode === "reset" ? "login" : "reset")}
                >
                  {mode === "reset"
                    ? "Volver a ingresar"
                    : "Olvidé mi contraseña"}
                </button>
              </>
            )}
            <button onClick={startDemo}>
              Explorar demo de ejemplo <ArrowUpRight size={15} />
            </button>
            <button onClick={() => navigate("privacy")}>Privacidad</button>
          </div>
        </section>
      </div>
    );
  if (!profile)
    return (
      <main className="privacy">
        Cargando tu perfil… {error && <p role="alert">{error}</p>}
        <button onClick={logout}>Cerrar sesión</button>
      </main>
    );
  if (profile.missing)
    return (
      <main className="privacy">
        <h1>Completá tu perfil</h1>
        <p>
          Tu acceso se creó, pero falta guardar los datos del negocio. Volvé a
          completarlos.
        </p>
        {error && <p role="alert">{error}</p>}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = Object.fromEntries(new FormData(e.currentTarget));
            execute(() =>
              setDoc(doc(db, "users", user.uid), {
                name: f.name,
                business: f.business,
                email: user.email,
                role: "user",
                status: "active",
                createdAt: serverTimestamp(),
              }),
            );
          }}
        >
          <Field name="name" label="Tu nombre" required maxLength="120" />
          <Field name="business" label="Negocio" required maxLength="120" />
          <button disabled={busy}>Guardar perfil</button>
        </form>
        <button onClick={logout}>Cerrar sesión</button>
      </main>
    );
  if (profile.status !== "active")
    return (
      <main className="privacy">
        <h1>Cuenta suspendida</h1>
        <p>Contactá al administrador para recuperar el acceso a tus datos.</p>
        <button onClick={logout}>Cerrar sesión</button>
      </main>
    );
  const active = products.filter((p) => !p.archived),
    low = active.filter((p) => p.quantity <= p.minimum),
    visible = products.filter(
      (p) =>
        !!p.archived === archived &&
        (!filter || p.category === filter) &&
        `${p.name} ${p.sku}`
          .toLocaleLowerCase("es")
          .includes(search.toLocaleLowerCase("es")),
    ),
    recent = [...movements].sort((a, b) => new Date(b.date) - new Date(a.date)),
    readOnly = !!selected;
  const headings = {
    dashboard: ["Resumen", "Una mirada clara a tu negocio."],
    products: ["Productos", "Tu inventario, siempre al día."],
    movements: ["Movimientos", "Cada cambio de stock, en un solo lugar."],
    categories: ["Categorías", "Organizá los productos a tu manera."],
    admin: ["Administración", "Cuentas y actividad de la plataforma."],
  };
  async function submitModal(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const ok = await execute(async () => {
      if (modal.type === "profile") {
        const values = {
          name: f.name.trim(),
          business: f.business.trim(),
          photo: modal.image ?? profile.photo ?? "",
        };
        if (!values.name || !values.business)
          throw new Error("Completá tu nombre y el negocio.");
        if (demo) setProfile((p) => ({ ...p, ...values }));
        else await updateDoc(doc(db, "users", user.uid), values);
      } else if (modal.type === "product") {
        const values = {
          name: f.name.trim(),
          sku: f.sku.trim(),
          category: f.category,
          description: f.description.trim(),
          cost: Number(f.cost),
          price: Number(f.price),
          minimum: Number(f.minimum),
          image: modal.image ?? modal.product?.image ?? "",
        };
        if (!values.name || !values.sku)
          throw new Error("Completá nombre y código.");
        if (
          products.some(
            (p) =>
              p.id !== modal.product?.id &&
              p.sku.toLowerCase() === values.sku.toLowerCase(),
          )
        )
          throw new Error("Ya existe un producto con ese código.");
        if (!modal.product) values.quantity = Number(f.quantity);
        if (demo) {
          if (modal.product)
            setProducts((ps) =>
              ps.map((p) =>
                p.id === modal.product.id ? { ...p, ...values } : p,
              ),
            );
          else {
            const id = crypto.randomUUID();
            setProducts((ps) => [
              ...ps,
              { ...values, id, ownerId: "demo", archived: false },
            ]);
            setMovements((ms) => [
              ...ms,
              {
                id: crypto.randomUUID(),
                productId: id,
                productName: values.name,
                type: "inicial",
                amount: values.quantity,
                before: 0,
                after: values.quantity,
                reason: "Stock inicial",
                date: new Date().toISOString(),
              },
            ]);
          }
        } else await saveProduct(uid, values, modal.product);
      } else if (modal.type === "movement") {
        const p = products.find((p) => p.id === f.product);
        const amount = Number(f.amount);
        if (!f.reason.trim()) throw new Error("Ingresá un motivo.");
        if (demo) {
          const after = nextStock(p.quantity, f.type, amount);
          setProducts((ps) =>
            ps.map((item) =>
              item.id === p.id ? { ...item, quantity: after } : item,
            ),
          );
          setMovements((ms) => [
            ...ms,
            {
              id: crypto.randomUUID(),
              productName: p.name,
              type: f.type,
              amount,
              before: p.quantity,
              after,
              reason: f.reason,
              date: new Date(f.date).toISOString(),
            },
          ]);
        } else
          await moveStock(
            uid,
            p,
            f.type,
            amount,
            f.reason.trim(),
            new Date(f.date).toISOString(),
          );
      } else {
        const name = f.name.trim();
        if (!name) throw new Error("Ingresá un nombre.");
        if (
          categories.some(
            (c) =>
              c.id !== modal.category?.id &&
              c.name.toLowerCase() === name.toLowerCase(),
          )
        )
          throw new Error("Esa categoría ya existe.");
        if (demo)
          setCategories((cs) =>
            modal.category
              ? cs.map((c) => (c.id === modal.category.id ? { ...c, name } : c))
              : [...cs, { id: crypto.randomUUID(), name }],
          );
        else await saveCategory(uid, name, modal.category?.id);
      }
    });
    if (ok) setModal(null);
  }
  const table = (
    <div className="table-wrap inventory-table">
      <table>
        <thead>
          <tr>
            <th>PRODUCTO / CÓDIGO</th>
            <th>CATEGORÍA</th>
            <th>STOCK</th>
            <th>COSTO</th>
            <th>VENTA</th>
            <th>ESTADO</th>
            <th>
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {visible.map((p) => (
            <tr key={p.id}>
              <td data-label="Producto">
                <div className="product-cell">
                  <span className="product-icon">
                    {p.image ? (
                      <img src={p.image} alt={p.name} loading="lazy" />
                    ) : (
                      <Package size={18} />
                    )}
                  </span>
                  <div>
                    <strong>{p.name}</strong>
                    <small>{p.sku}</small>
                  </div>
                </div>
              </td>
              <td data-label="Categoría">
                <span className="category-tag">
                  {p.category || "Sin categoría"}
                </span>
              </td>
              <td data-label="Stock">
                <strong>{p.quantity}</strong> <span className="muted">un.</span>
              </td>
              <td data-label="Costo">{money(p.cost)}</td>
              <td data-label="Venta">{money(p.price)}</td>
              <td data-label="Estado">
                <span
                  className={
                    "badge " +
                    (p.archived
                      ? ""
                      : p.quantity <= p.minimum
                        ? "warning"
                        : "good")
                  }
                >
                  {p.archived
                    ? "Archivado"
                    : p.quantity <= p.minimum
                      ? "Stock bajo"
                      : "En stock"}
                </span>
              </td>
              <td data-label="Acciones">
                {!readOnly && (
                  <div className="row-actions">
                    <button
                      aria-label={"Editar " + p.name}
                      onClick={() => setModal({ type: "product", product: p })}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      aria-label={
                        p.archived ? "Restaurar producto" : "Archivar producto"
                      }
                      onClick={() =>
                        execute(() =>
                          demo
                            ? setProducts((ps) =>
                                ps.map((x) =>
                                  x.id === p.id
                                    ? { ...x, archived: !x.archived }
                                    : x,
                                ),
                              )
                            : updateDoc(doc(db, "products", p.id), {
                                archived: !p.archived,
                              }),
                        )
                      }
                    >
                      <Archive size={15} />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {visible.length === 0 && (
        <div className="empty">
          <Package />
          <h3>No hay productos para mostrar</h3>
          <p>Agregá tu primer producto o cambiá los filtros.</p>
        </div>
      )}
    </div>
  );
  const movementTable = (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>FECHA</th>
            <th>PRODUCTO</th>
            <th>TIPO</th>
            <th>CANTIDAD</th>
            <th>ANTES → DESPUÉS</th>
            <th>MOTIVO</th>
          </tr>
        </thead>
        <tbody>
          {(page === "dashboard" ? recent.slice(0, 5) : recent).map((m) => (
            <tr key={m.id}>
              <td>{date(m.date)}</td>
              <td>
                <strong>{m.productName}</strong>
              </td>
              <td>
                <span className={"badge movement-" + m.type}>{m.type}</span>
              </td>
              <td>{m.amount}</td>
              <td>
                {m.before} → {m.after}
              </td>
              <td>{m.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!recent.length && (
        <div className="empty">
          <ArrowLeftRight />
          <p>Todavía no registraste movimientos.</p>
        </div>
      )}
    </div>
  );
  return (
    <div className="app">
      {menu && (
        <button
          className="nav-scrim"
          aria-label="Cerrar menú"
          onClick={() => setMenu(false)}
        />
      )}
      <aside className={menu ? "open" : ""}>
        <div className="brand">
          <Package />
          {APP_NAME}
          <span> / </span>
        </div>
        <div className="workspace">
          <span className="avatar">{profile.business[0]}</span>
          <div>
            <strong>{profile.business}</strong>
            <small>Mi espacio de trabajo</small>
          </div>
        </div>
        <span className="nav-label">TU NEGOCIO</span>
        <nav>
          {[
            ["dashboard", "Resumen", LayoutDashboard],
            ["products", "Productos", Package],
            ["movements", "Movimientos", ArrowLeftRight],
            ["categories", "Categorías", Tags],
            ...(profile.role === "admin"
              ? [["admin", "Administración", ShieldCheck]]
              : []),
          ].map(([id, label, Icon]) => (
            <button
              key={id}
              className={page === id ? "active" : ""}
              onClick={() => navigate(id)}
            >
              <Icon size={19} />
              {label}
              {id === "products" && <small>{active.length}</small>}
            </button>
          ))}
        </nav>
        <div className="aside-bottom">
          <div className="free">
            <span className="dot" /> Plan gratuito{" "}
            <small>Código abierto. Siempre tuyo.</small>
          </div>
          <button onClick={() => navigate("privacy")}>Privacidad</button>
          <button onClick={logout}>
            <LogOut size={17} />
            Cerrar sesión
          </button>
        </div>
      </aside>
      <div className="main">
        <header>
          <button
            className="mobile-menu"
            aria-label="Abrir menú"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            <Menu />
          </button>
          <span className="breadcrumb">
            Mi negocio <span>/</span> {headings[page]?.[0]}
          </span>
          <div className="header-search search">
            <Search size={16} />
            <input
              aria-label="Buscar en el inventario"
              placeholder="Buscá en tu inventario…"
              value={search}
              onFocus={() => navigate("products")}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="header-profile">
            <span className="dot" />
            {demo ? "Demo local" : "Conectado"}
            <button
              className="avatar profile-button"
              title="Editar mi perfil"
              aria-label="Editar mi perfil y foto"
              onClick={() => setModal({ type: "profile" })}
            >
              {profile.photo ? (
                <img src={profile.photo} alt="Tu foto de perfil" />
              ) : (
                profile.name[0]
              )}
            </button>
          </div>
        </header>
        <main>
          {demo && (
            <div className="demo-banner">
              DEMO · Datos de ejemplo. Los cambios se guardan solo durante esta
              sesión.
            </div>
          )}
          {selected && (
            <div className="notice">
              Consultando {selected.business} · Solo lectura{" "}
              <button onClick={() => setSelected(null)}>
                Volver a mi negocio
              </button>
            </div>
          )}
          {error && (
            <div className="error" role="alert">
              {error}
              <button onClick={() => setError("")} aria-label="Cerrar error">
                <X size={16} />
              </button>
            </div>
          )}
          <div className="page-title">
            <div>
              <span className="eyebrow">TU INVENTARIO, BAJO CONTROL</span>
              <h1>{headings[page]?.[0]}</h1>
              <p>{headings[page]?.[1]}</p>
            </div>
            {!readOnly && page !== "admin" && (
              <button
                className="primary"
                onClick={() =>
                  setModal({
                    type:
                      page === "movements"
                        ? "movement"
                        : page === "categories"
                          ? "category"
                          : "product",
                  })
                }
              >
                <Plus size={18} />
                {page === "movements"
                  ? "Registrar movimiento"
                  : page === "categories"
                    ? "Nueva categoría"
                    : "Nuevo producto"}
              </button>
            )}
          </div>
          {loading && <p role="status">Cargando inventario…</p>}
          {page === "dashboard" && (
            <div className="stats">
              <article>
                <span>
                  Productos activos <Package size={18} />
                </span>
                <strong>{active.length}</strong>
                <small>En tu inventario</small>
              </article>
              <article>
                <span>
                  Valor del inventario <ArrowUpRight size={18} />
                </span>
                <strong>
                  {money(active.reduce((s, p) => s + p.cost * p.quantity, 0))}
                </strong>
                <small>Valuado al precio de costo</small>
              </article>
              <article>
                <span>
                  Stock bajo <span className="dot amber" />
                </span>
                <strong>{low.length.toString().padStart(2, "0")}</strong>
                <small>Productos para reponer</small>
              </article>
            </div>
          )}
          {(page === "products" || page === "dashboard") && (
            <section className="panel">
              <div className="panel-title">
                <div>
                  <h2>
                    {page === "dashboard"
                      ? "Tu inventario"
                      : "Todos los productos"}
                  </h2>
                  <p>
                    {active.length} productos activos · {low.length} con stock
                    bajo
                  </p>
                </div>
                <button
                  onClick={() => {
                    const url = URL.createObjectURL(
                      new Blob([csv(products)], {
                        type: "text/csv;charset=utf-8",
                      }),
                    );
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "productos.csv";
                    a.click();
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                  }}
                >
                  <Download size={16} />
                  Exportar CSV
                </button>
              </div>
              <div className="filters">
                <div className="search">
                  <Search size={18} />
                  <input
                    aria-label="Buscar productos"
                    placeholder="Buscá por nombre o código…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <select
                  aria-label="Filtrar categoría"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="">Todas las categorías</option>
                  {[
                    ...new Set([
                      ...categories.map((c) => c.name),
                      ...products.map((p) => p.category).filter(Boolean),
                    ]),
                  ].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={archived}
                    onChange={(e) => setArchived(e.target.checked)}
                  />
                  Archivados
                </label>
              </div>
              {table}
              <div className="panel-footer">
                {visible.length} productos{" "}
                <span>Precios en pesos argentinos</span>
              </div>
            </section>
          )}
          {(page === "movements" || page === "dashboard") && (
            <section className="panel">
              <div className="panel-title">
                <div>
                  <h2>Movimientos {page === "dashboard" ? "recientes" : ""}</h2>
                  <p>El detalle de cada entrada, salida y ajuste.</p>
                </div>
                {page === "dashboard" && (
                  <button onClick={() => navigate("movements")}>
                    Ver todos <ArrowUpRight size={16} />
                  </button>
                )}
              </div>
              {movementTable}
            </section>
          )}
          {page === "categories" && (
            <section className="panel">
              {categories.length ? (
                categories.map((c) => (
                  <div className="category-row" key={c.id}>
                    <Tags size={19} />
                    <strong>{c.name}</strong>
                    <span>
                      {
                        products.filter(
                          (p) => p.category === c.name && !p.archived,
                        ).length
                      }{" "}
                      productos
                    </span>
                    {!readOnly && (
                      <>
                        <button
                          onClick={() =>
                            setModal({ type: "category", category: c })
                          }
                        >
                          <Pencil size={15} />
                          Renombrar
                        </button>
                        <button
                          aria-label={"Eliminar categoría " + c.name}
                          onClick={() =>
                            execute(() =>
                              demo
                                ? setCategories((cs) =>
                                    cs.filter((x) => x.id !== c.id),
                                  )
                                : deleteDoc(doc(db, "categories", c.id)),
                            )
                          }
                        >
                          <X size={15} />
                        </button>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <div className="empty">
                  Creá una categoría para organizar tu inventario.
                </div>
              )}
              <p className="category-note">
                Las categorías son etiquetas. Al renombrarlas, los productos
                existentes conservan su etiqueta anterior; podés actualizarla al
                editar cada producto.
              </p>
            </section>
          )}
          {page === "admin" &&
            (profile.role === "admin" ? (
              <>
                <div className="stats">
                  <article>
                    <span>Cuentas registradas</span>
                    <strong>{accounts.length}</strong>
                  </article>
                  <article>
                    <span>Cuentas activas</span>
                    <strong>
                      {accounts.filter((a) => a.status === "active").length}
                    </strong>
                  </article>
                </div>
                <section className="panel table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>CUENTA</th>
                        <th>NEGOCIO</th>
                        <th>ALTA</th>
                        <th>ESTADO</th>
                        <th>ACCIONES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accounts.map((a) => (
                        <tr key={a.id}>
                          <td>
                            <strong>{a.name}</strong>
                            <small>{a.email}</small>
                          </td>
                          <td>{a.business}</td>
                          <td>{a.createdAt ? date(a.createdAt) : "—"}</td>
                          <td>
                            {a.status === "active" ? "Activa" : "Suspendida"}
                          </td>
                          <td>
                            <div className="row-actions">
                              <button
                                onClick={() => {
                                  setSelected(a);
                                  navigate("products");
                                }}
                              >
                                Consultar
                              </button>
                              {a.id !== user.uid && (
                                <button
                                  disabled={busy}
                                  onClick={() =>
                                    execute(() =>
                                      updateDoc(doc(db, "users", a.id), {
                                        status:
                                          a.status === "active"
                                            ? "suspended"
                                            : "active",
                                      }),
                                    )
                                  }
                                >
                                  {a.status === "active"
                                    ? "Suspender"
                                    : "Reactivar"}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              </>
            ) : (
              <div className="error">
                Solo una cuenta administradora puede acceder a esta ruta.
              </div>
            ))}
          <footer>
            {APP_NAME}{" "}
            <span>Un poco más de orden. Un montón de posibilidades.</span>
          </footer>
        </main>
      </div>
      {modal && (
        <div className="modal-backdrop">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="panel-title">
              <h2 id="modal-title">
                {modal.type === "profile"
                  ? "Mi perfil"
                  : modal.type === "product"
                    ? modal.product
                      ? "Editar producto"
                      : "Nuevo producto"
                    : modal.type === "movement"
                      ? "Registrar movimiento"
                      : modal.category
                        ? "Renombrar categoría"
                        : "Nueva categoría"}
              </h2>
              <button
                aria-label="Cerrar formulario"
                onClick={() => setModal(null)}
              >
                <X />
              </button>
            </div>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <form onSubmit={submitModal}>
              {modal.type === "profile" ? (
                <>
                  <ImagePicker
                    avatar
                    value={modal.image ?? profile.photo ?? ""}
                    onBusy={setImageBusy}
                    onChange={(image) =>
                      setModal((current) => current && { ...current, image })
                    }
                  />
                  <Field
                    label="Tu nombre"
                    name="name"
                    required
                    maxLength="120"
                    defaultValue={profile.name}
                  />
                  <Field
                    label="Nombre del negocio"
                    name="business"
                    required
                    maxLength="120"
                    defaultValue={profile.business}
                  />
                </>
              ) : modal.type === "product" ? (
                <>
                  <ImagePicker
                    value={modal.image ?? modal.product?.image ?? ""}
                    onBusy={setImageBusy}
                    onChange={(image) =>
                      setModal((current) => current && { ...current, image })
                    }
                  />
                  <Field
                    autoFocus
                    label="Nombre del producto"
                    name="name"
                    required
                    maxLength="160"
                    defaultValue={modal.product?.name || ""}
                  />
                  <div className="form-grid">
                    <Field
                      label="Código / SKU"
                      name="sku"
                      required
                      maxLength="80"
                      defaultValue={modal.product?.sku || ""}
                    />
                    <label>
                      Categoría
                      <select
                        name="category"
                        defaultValue={modal.product?.category || ""}
                      >
                        <option value="">Sin categoría</option>
                        {[
                          ...new Set(
                            [
                              ...categories.map((c) => c.name),
                              modal.product?.category,
                            ].filter(Boolean),
                          ),
                        ].map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <Field
                    label="Descripción (opcional)"
                    name="description"
                    maxLength="1000"
                    defaultValue={modal.product?.description || ""}
                  />
                  <div className="form-grid">
                    {[
                      ["cost", "Costo ($)"],
                      ["price", "Venta ($)"],
                      ["minimum", "Stock mínimo"],
                      ...(!modal.product
                        ? [["quantity", "Cantidad inicial"]]
                        : []),
                    ].map(([key, label]) => (
                      <Field
                        key={key}
                        label={label}
                        name={key}
                        type="number"
                        step="0.01"
                        min="0"
                        max="1000000000"
                        required
                        defaultValue={modal.product?.[key] ?? emptyProduct[key]}
                      />
                    ))}
                  </div>
                  {modal.product && (
                    <p className="muted">
                      Para modificar cantidades, registrá un movimiento.
                    </p>
                  )}
                </>
              ) : modal.type === "movement" ? (
                <>
                  <label>
                    Producto
                    <select name="product" required>
                      {active.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} · {p.quantity} un.
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="form-grid">
                    <label>
                      Tipo
                      <select name="type">
                        <option value="entrada">Entrada</option>
                        <option value="salida">Salida</option>
                        <option value="ajuste">Ajuste (stock final)</option>
                      </select>
                    </label>
                    <Field
                      label="Cantidad / stock final"
                      name="amount"
                      type="number"
                      min="0"
                      max="1000000000"
                      step="0.01"
                      required
                    />
                  </div>
                  <Field
                    label="Fecha"
                    name="date"
                    type="datetime-local"
                    required
                    defaultValue={new Date(
                      Date.now() - new Date().getTimezoneOffset() * 60000,
                    )
                      .toISOString()
                      .slice(0, 16)}
                  />
                  <Field
                    label="Motivo"
                    name="reason"
                    required
                    maxLength="500"
                  />
                  <p className="muted">
                    En un ajuste, la cantidad indica el stock final deseado.
                  </p>
                </>
              ) : (
                <Field
                  autoFocus
                  label="Nombre de la categoría"
                  name="name"
                  required
                  maxLength="100"
                  defaultValue={modal.category?.name || ""}
                />
              )}
              <div className="modal-actions">
                <button type="button" onClick={() => setModal(null)}>
                  Cancelar
                </button>
                <button
                  className="primary"
                  disabled={
                    busy ||
                    imageBusy ||
                    (modal.type === "movement" && !active.length)
                  }
                >
                  {busy ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);

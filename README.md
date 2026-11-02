# StockFlow

Aplicación gratuita y de código abierto para el inventario de pequeños negocios. Interfaz en español rioplatense, adaptable a celular y computadora. El nombre del producto se cambia en `src/config.js` (`APP_NAME`).

## Primera versión

- Registro con email, contraseña, nombre y negocio; inicio/cierre de sesión y recuperación por email.
- Panel con productos activos, valuación al costo, alertas y movimientos recientes.
- Alta, edición, archivo y restauración de productos; búsqueda, filtros y exportación CSV compatible con planillas (con neutralización de fórmulas).
- Categorías, entradas, salidas y ajustes de stock; historial inmutable desde el cliente.
- Movimientos y cantidades actualizados juntos mediante transacciones de Firestore para evitar pérdidas por concurrencia. Cantidades fraccionarias admitidas; importes en ARS.
- Ruta `/admin`: cuentas, métricas, consulta del inventario y movimientos de otra cuenta en modo lectura, suspensión y reactivación.
- Ruta `/privacy`: datos almacenados y acceso del administrador.
- Demo local explícitamente identificada, sin datos reales ni conexión a Firebase; se reinicia al recargar.

Stack: React, Vite, JavaScript, Tailwind CSS, Lucide React, Firebase Authentication, Cloud Firestore y Firebase Hosting clásico. Sin Functions, Storage ni App Hosting.

## Ejecutar

Requisitos: Node.js 22.12+ (probado con Node 24), npm. Java 21 para las pruebas de reglas.

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

Sin configuración, usá **Explorar demo de ejemplo**. La demo vive solo en memoria y nunca representa una cuenta real. Para producción, completá todas las variables de `.env` con la configuración de tu aplicación web Firebase. Reiniciá Vite después de cambiar el archivo.

```powershell
npm run build
npm run preview
npm test
npx firebase emulators:exec --project demo-stockflow --only firestore "node --test tests/rules.test.js"
```

`npm test` ejecuta las pruebas de dominio y omite las pruebas de reglas cuando no hay emulador. El comando separado inicia el emulador de Firestore y prueba aislamiento entre cuentas, consultas, administrador, registro seguro, suspensión y bloqueo de escalada. El emulador puede descargar su componente Java en la primera ejecución; no usa servicios pagos.

## Configurar Firebase sin facturación

1. Entrá en [Firebase Console](https://console.firebase.google.com/) con tu cuenta. Creá un proyecto en **Spark**. No agregues medio de pago ni enlaces una cuenta de facturación. Podés desactivar Analytics, que esta app no utiliza.
2. En Configuración del proyecto → Tus apps, registrá una aplicación **web**. Copiá los campos de configuración a `.env` usando los nombres de `.env.example`. No descargues claves privadas ni cuentas de servicio.
3. En Authentication → Sign-in method, habilitá únicamente **Email/Password**. En Settings → Authorized domains, agregá `localhost` para desarrollo y verificá el dominio de Hosting para producción. Los proyectos nuevos pueden no incluir localhost automáticamente.
4. En Firestore Database, creá la base **(default), edición Standard**, en modo producción y elegí una región apropiada. No habilites funciones adicionales pagas, backups, PITR o TTL.
5. Autenticá la CLI desde tu computadora y desplegá las reglas **antes** de guardar datos:

```powershell
npx firebase login
npx firebase projects:list
npx firebase deploy --only firestore:rules --project TU_PROJECT_ID
```

No hace falta ejecutar `firebase init`: la configuración ya está en `firebase.json`. No uses App Hosting (es un producto diferente).

### Crear el primer administrador

1. Creá tu propia cuenta desde la aplicación conectada a Firebase.
2. En Firebase Console → Firestore → `users`, buscá el documento cuyo ID es tu UID (podés verlo en Authentication).
3. Cambiá **manualmente en Console** el campo `role` de `user` a `admin`. Mantené `status: active`.
4. La aplicación recibe el cambio; entrá a **Administración** o `/admin`.

No hay credenciales fijas ni un botón público de promoción. El cliente solamente puede crear perfiles `user` activos. Ningún cliente, incluido el panel de administración, puede modificar roles. El panel permite cambiar únicamente el estado de otras cuentas; no puede suspenderse a sí mismo.

### Publicar en Hosting

Con las variables completas, sin modificar el plan Spark:

```powershell
npm run build
npx firebase deploy --only firestore:rules,hosting --project TU_PROJECT_ID
```

Firebase muestra la URL `https://TU_PROJECT_ID.web.app`. Las rutas internas funcionan gracias a la reescritura SPA. Antes de compartirla, probá registro, recuperación y dos cuentas distintas. Revisá que el proyecto siga en Spark. No se creó ni desplegó ningún proyecto Firebase automáticamente.

## Seguridad y modelo de datos

Colecciones raíz `users`, `products`, `categories`, `movements`. Los documentos comerciales incluyen `ownerId` y todas sus consultas normales filtran por UID. Reglas en `firestore.rules`:

- Un usuario activo accede solamente a sus documentos; un administrador activo puede leer cuentas y datos comerciales.
- Un suspendido solo puede leer su propio perfil para mostrar el estado. No puede leer ni escribir productos, categorías o movimientos, ni reactivarse.
- Roles, email y fecha de alta no se modifican desde el cliente. No se permite borrar perfiles para volver a crearlos.
- Productos se archivan; movimientos no se editan ni eliminan. Reglas validan campos, tipos y valores no negativos; se deniega todo lo no autorizado.
- Las contraseñas se entregan exclusivamente a Firebase Authentication. Nunca se escriben en Firestore.

La configuración web de Firebase es pública por diseño y aparece en el bundle. **La protección depende de las reglas desplegadas**, no de ocultar esa configuración ni del control visual de React. `.env`, claves privadas, dependencias y datos temporales quedan excluidos de Git. Nunca agregues credenciales Admin SDK: ese SDK elude las reglas.

### Alcance de esta versión

Las categorías son etiquetas; al renombrar o eliminar una categoría, las etiquetas ya asignadas se conservan en los productos hasta editarlos. Los SKU se verifican en la interfaz; dos altas simultáneas podrían repetir un código. Las transacciones de la app sincronizan stock e historial, pero las reglas no fuerzan un vínculo contable entre cada cambio de cantidad y un movimiento: el propietario puede modificar sus propios datos con un cliente alternativo. No es un sistema de auditoría contable. Las listas se suscriben completas por cuenta; para inventarios grandes conviene incorporar paginación y límites antes de escalar. La recuperación de contraseña y el envío de emails deben verificarse con un proyecto real. No hay borrado de cuenta automático; lo gestiona el responsable de la instancia.

## Cuotas gratuitas y fuentes oficiales

Documentación consultada durante la implementación (2 de noviembre de 2026). Spark no requiere un medio de pago. Firestore ofrece una base gratuita por proyecto con 1 GiB, 50.000 lecturas/día, 20.000 escrituras/día y 20.000 eliminaciones/día. Hosting clásico incluye 10 GB almacenados y 10 GB de transferencia/mes. Los límites pueden cambiar: revisá las fuentes y el panel de uso. En Spark, al exceder cuotas puede interrumpirse el servicio; no cambies a Blaze para resolverlo sin evaluar costos. Authentication por email/contraseña está disponible sin habilitar facturación, con límites de uso y de envío de emails.

- [Planes y servicios](https://firebase.google.com/pricing)
- [Planes Spark y Blaze](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans)
- [Cuotas de Firestore](https://firebase.google.com/docs/firestore/quotas)
- [Cuotas de Hosting](https://firebase.google.com/docs/hosting/usage-quotas-pricing)
- [Authentication email y contraseña](https://firebase.google.com/docs/auth/web/password-auth)
- [Límites de Authentication](https://firebase.google.com/docs/auth/limits)
- [Reglas de seguridad](https://firebase.google.com/docs/firestore/security/rules-conditions)
- [Transacciones](https://firebase.google.com/docs/firestore/manage-data/transactions)
- [Publicar con Hosting](https://firebase.google.com/docs/hosting/quickstart)
- [Vite](https://vite.dev/guide/) y [Tailwind con Vite](https://tailwindcss.com/docs/installation/using-vite)

## GitHub

El repositorio local incluye el primer commit `feat: iniciar StockFlow con cuentas y control de stock`. Si la sesión de GitHub CLI está vencida, autenticá desde la terminal con el navegador; no pegues tokens en el chat:

```powershell
gh auth login --hostname github.com --git-protocol https --web
gh auth status
gh repo create stockflow --public --source=. --remote=origin --push
```

Ejecutá el último comando solo si no existe un remoto (`git remote -v`). Si `stockflow` ya existe en tu cuenta, inspeccionalo antes de conectarlo; no reemplaces un repositorio ni fuerces un push. No se necesitan secretos de GitHub para este despliegue manual.

## Licencia

MIT. Podés usar, modificar y distribuir esta aplicación bajo los términos de `LICENSE`.

## Verificación y dependencias

Se aplicó una actualización de Firebase CLI y se fijó una versión compatible corregida de `@grpc/grpc-js` mediante `overrides`. La auditoría de dependencias de producción no reporta vulnerabilidades. La CLI de Firebase conserva avisos moderados en dependencias de desarrollo; no se incluyen en el sitio publicado. No se aplicó `npm audit fix --force` porque propone retroceder versiones mayores y no garantiza resolverlos. Revisá `npm audit` antes de actualizar la herramienta. La comprobación visual en navegador depende de disponer de un navegador conectado al entorno.

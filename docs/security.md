# Seguridad y límites de confianza

[Índice](README.md) · [Modelo de datos](data-model.md) · [Validación](validation.md)

Esta descripción resulta de inspeccionar [firestore.rules](../firestore.rules), [main.jsx](../src/main.jsx), [data.js](../src/data.js), [config.js](../src/config.js), [images.js](../src/images.js) y [firebase.json](../firebase.json). No certifica una instancia desplegada ni sustituye una auditoría de seguridad.

## Autenticación y autorización

Firebase Authentication recibe email y contraseña mediante su SDK. La aplicación no guarda contraseñas en Firestore. El perfil `users/{uid}` contiene rol y estado, y las funciones de reglas `active()`, `admin()` y `own(data)` consultan ese perfil.

Un usuario suspendido puede leer su propio perfil para ver su estado, pero no acceder a documentos comerciales. Suspender es cambiar `users.status`: no deshabilita la identidad de Auth ni elimina la cuenta.

## Matriz de permisos de las reglas

| Recurso u operación | Propietario activo | Otro usuario activo | Administrador activo | Suspendido o anónimo |
| --- | --- | --- | --- | --- |
| Leer perfil propio | Sí | No aplica | Sí | Suspendido: sí; anónimo: no |
| Leer perfiles ajenos | No | No | Sí | No |
| Crear perfil propio | Solo `user`, `active`, email del token y fecha del servidor | No en nombre de otro | Mismas restricciones de alta propia | Usuario autenticado sin perfil: sí, con esas condiciones; anónimo: no |
| Editar perfil propio | Solo nombre, negocio y foto | No | Mismos campos propios | No |
| Cambiar estado de otro perfil | No | No | Solo `active` o `suspended` | No |
| Cambiar rol, email o fecha de perfil | No | No | No desde cliente | No |
| Borrar perfil | No | No | No | No |
| Leer productos, categorías y movimientos | Propios | No | Propios y ajenos | No |
| Crear o actualizar productos | Propios y válidos | No | Propios; sin permiso especial sobre ajenos | No |
| Borrar productos | No | No | No | No |
| Crear, actualizar o borrar categorías | Propias; crear/actualizar exige esquema válido | No | Propias; sin permiso especial sobre ajenas | No |
| Crear movimientos | Propios y válidos | No | Propios; sin permiso especial sobre ajenos | No |
| Actualizar o borrar movimientos | No | No | No | No |

Los permisos son los del SDK cliente bajo estas reglas. Una herramienta administrativa con credenciales privilegiadas tiene un límite de confianza diferente.

## Controles implementados

**Aislamiento de inventarios.** Las consultas normales filtran `ownerId` por UID. Las reglas autorizan en función del propietario y estado; no confían en un filtro visual. La prueba de aislamiento intenta consultar una colección comercial completa como usuario común y espera rechazo.

**Esquemas acotados.** Las reglas limitan claves, tipos, longitudes y rangos numéricos. Los propietarios de productos y categorías no se cambian al actualizar; la fecha de alta del producto permanece fija.

**Control de roles.** Un perfil nuevo se crea como `user` activo. Ningún cliente puede cambiar roles. El panel administrativo modifica únicamente el estado de otras cuentas.

**Historial.** Las reglas rechazan editar o borrar movimientos. El cliente usa transacciones para registrar stock e historial de manera atómica.

**Imágenes.** El cliente acepta tres MIME y un máximo de 8 MiB, decodifica y reexporta con canvas; no conserva el archivo original como carga. Las reglas aceptan solo vacío o data URL JPEG acotado. La expresión regular no prueba que el contenido sea un JPEG decodificable. No hay subida a Firebase Storage.

**CSV.** `csv` delimita y escapa celdas, e introduce un apóstrofo en cadenas que pueden iniciar una fórmula. Esta protección cubre la transformación implementada y sus pruebas; no constituye una garantía para todo programa de planillas.

**Hosting.** La configuración declara `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` y `X-Frame-Options: DENY`. No se verificó que esa configuración esté desplegada.

## Límites que no deben presentarse como garantías

| Límite observado | Consecuencia |
| --- | --- |
| Las reglas no vinculan un cambio de cantidad a un movimiento ni validan su aritmética | Un propietario con otro cliente puede alterar stock sin historial equivalente; no es auditoría contable |
| `productId` no se verifica contra el producto en reglas | Un movimiento válido según esquema puede referenciar un producto inexistente o ajeno |
| SKU y nombres de categoría únicos se comprueban en la interfaz | No hay exclusión de duplicados frente a concurrencia o clientes alternativos |
| Registro Auth y perfil son escrituras separadas | Puede existir una identidad sin perfil; el cliente ofrece completar datos |
| Lecturas completas sin paginación | El crecimiento y las miniaturas elevan volumen de lectura y transferencia |
| Administrador activo puede leer todos los datos de cuentas e inventarios | La privacidad no implica ocultamiento al responsable del servicio |
| Sin flujo implementado de verificación de email, MFA, App Check o borrado automático de cuenta | No atribuir esas protecciones a esta versión |
| Sin configuración de CSP en `firebase.json` | No afirmar que el repositorio la establece |
| No se inspeccionó Firebase Console | Se desconoce el estado real de reglas desplegadas, dominios autorizados y políticas de la instancia |

## Datos y operación responsable

La vista Privacidad declara email, nombre, negocio, alta, estado, inventario, categorías, movimientos y fotos; informa el acceso administrativo y el alojamiento en Firebase. No incluye un contacto fijo ni un procedimiento automatizado de eliminación.

La configuración web que usa `src/firebase.js` se incorpora al frontend: ocultarla no reemplaza las reglas. No se deben incorporar credenciales privadas ni cuentas de servicio al cliente. Para describir el entorno real, un responsable tendría que verificar reglas y configuración desplegadas con acceso autorizado. Esta entrega no las modifica.

Los [tests de reglas](../tests/rules.test.js) cubren casos de aislamiento, escalada, suspensión, registro e imágenes. Fueron leídos, pero no ejecutados en esta revisión. Consultá [Validación](validation.md) para no confundir cobertura existente con resultados obtenidos.


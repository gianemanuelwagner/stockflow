# Manual de usuario

[Índice](README.md) · [Flujos](user-flows.md)

Este manual describe los controles de [src/main.jsx](../src/main.jsx) en la versión documentada. Los ejemplos son ficticios. Para guardar datos reales necesitás una instancia configurada de Firebase y una cuenta activa.

## 1. Entrar o probar la demo

En la pantalla de acceso elegí **Crear una cuenta**, completá nombre, negocio, email y contraseña de al menos seis caracteres y pulsá **Crear cuenta**. Para una cuenta existente, ingresá email y contraseña y pulsá **Ingresar**.

Si aparece **Completá tu perfil**, completá nombre y negocio y elegí **Guardar perfil**: la identidad de acceso ya existe, pero falta el documento del negocio.

Para recuperar el acceso, elegí **Olvidé mi contraseña**, ingresá el email y pulsá **Enviar instrucciones**. La aplicación muestra una confirmación genérica cuando se completa la solicitud. La entrega del correo depende de Firebase y no se comprueba desde esta pantalla.

**Explorar demo de ejemplo** permite experimentar sin crear una cuenta. Incluye productos ficticios y un aviso de demo. Los cambios, incluidas fotos, se pierden al recargar; no la uses para conservar inventario real.

## 2. Leer el resumen

| Indicador | Qué cuenta |
| --- | --- |
| Productos activos | Productos que no están archivados |
| Valor del inventario | Suma de costo × cantidad de productos activos, en ARS |
| Stock bajo | Productos activos con cantidad menor o igual al mínimo |
| Movimientos recientes | Hasta cinco, ordenados por fecha del movimiento descendente |

El valor de inventario usa costo, no precio de venta. La alerta incluye la igualdad: con 5 unidades y mínimo 5 aparece stock bajo. Los indicadores se calculan sobre productos activos completos, sin aplicar los filtros de la tabla.

## 3. Crear y editar productos

1. Abrí **Productos** y pulsá **Nuevo producto**.
2. Completá **Nombre del producto** y **Código / SKU**.
3. Elegí una categoría o dejá **Sin categoría**; la descripción es opcional.
4. Ingresá costo, venta, stock mínimo y cantidad inicial. Se admiten valores no negativos y formularios con paso 0,01.
5. Si querés, usá **Elegir imagen del producto** y revisá la vista previa.
6. Pulsá **Guardar**. En Firebase, el alta registra también un movimiento `inicial`, incluso si la cantidad es cero.

El código/SKU no puede repetirse entre los productos cargados de tu cuenta, incluidos los archivados. Esta comprobación de pantalla no garantiza unicidad frente a altas simultáneas.

Para editar, usá el botón de lápiz de la fila o tarjeta. Podés cambiar datos e imagen; la cantidad no se edita allí: se modifica mediante un movimiento. Los importes se muestran en pesos argentinos.

## 4. Buscar, filtrar y exportar

En Productos, buscá por nombre o código y usá el selector de categoría. La búsqueda no distingue mayúsculas. La casilla **Archivados** cambia entre productos activos y archivados; no muestra ambos grupos juntos.

**Exportar CSV** descarga `productos.csv` con todos los productos cargados del inventario consultado, incluidos archivados, aunque haya filtros aplicados. No incluye imágenes ni historial. Usa separador punto y coma, BOM UTF-8 y comillas escapadas; neutraliza valores que podrían interpretarse como fórmulas en una planilla.

## 5. Archivar o restaurar

Usá **Archivar producto** para retirarlo de los activos. No elimina el producto ni borra su stock o historial. Marcá **Archivados** para encontrarlo y usá **Restaurar producto** para devolverlo a los activos.

Un archivado no aparece en el selector de nuevos movimientos. Restaurarlo conserva su cantidad anterior. Archivar y restaurar no crean movimientos.

## 6. Registrar entradas, salidas y ajustes

1. Abrí **Movimientos** y elegí **Registrar movimiento**.
2. Seleccioná un producto activo.
3. Elegí el tipo, ingresá cantidad, fecha y motivo.
4. Pulsá **Guardar** y revisá la columna **ANTES → DESPUÉS**.

| Objetivo | Tipo y cantidad | Resultado desde 10 unidades |
| --- | --- | --- |
| Recibir 4 unidades | Entrada, 4 | 14 |
| Retirar 4 unidades | Salida, 4 | 6 |
| Corregir el conteo a 4 | Ajuste, 4 | 4 |
| Dejar el conteo en cero | Ajuste, 0 | 0 |

Entrada y salida exigen cantidad mayor que cero. Una salida superior al disponible se rechaza. El motivo es obligatorio. Los movimientos se consultan, pero no se editan ni borran desde la aplicación. Si cometiste un error, registrá un nuevo movimiento con el motivo de la corrección.

## 7. Organizar categorías

Abrí **Categorías**, pulsá **Nueva categoría**, ingresá un nombre y guardá. **Renombrar** cambia el nombre del registro. El botón de eliminar borra la categoría.

Las categorías funcionan como etiquetas: renombrarlas o eliminarlas no cambia las etiquetas que ya tienen los productos. Para actualizar esas etiquetas, editá cada producto. Una etiqueta antigua puede seguir apareciendo en el filtro mientras esté asignada a algún producto.

## 8. Cambiar perfil e imágenes

Pulsá el avatar del encabezado para abrir **Mi perfil**. Podés modificar nombre, negocio y foto. **Quitar imagen** limpia la selección; pulsá **Guardar** para persistir el cambio.

El selector admite JPG, PNG y WebP de hasta 8 MiB. La aplicación genera una miniatura JPEG, de hasta 384 píxeles en su lado mayor y hasta 64.000 caracteres. El original no se guarda. Si no puede optimizarse, elegí otra imagen. Mientras se prepara, el guardado queda deshabilitado.

## 9. Administrar cuentas

Solo una cuenta con rol `admin` ve **Administración**. El panel muestra cuentas registradas y activas, y permite:

- **Consultar**: abrir productos y movimientos de la cuenta elegida en modo lectura. Usá **Volver a mi negocio** para salir de esa consulta.
- **Suspender / Reactivar**: cambiar el estado de otra cuenta. No borra sus datos ni su identidad de acceso.

El panel no cambia roles ni permite auto suspensión. La asignación inicial del rol requiere gestión fuera de esta interfaz. El administrador puede leer inventarios ajenos; esa posibilidad también se informa en **Privacidad**.

## 10. Resolver problemas

| Mensaje o situación | Acción |
| --- | --- |
| Falta conectar Firebase | Usá la demo o pedí al responsable que complete la configuración |
| Email o contraseña no coinciden | Revisá los datos o usá recuperación |
| Cuenta suspendida | Contactá al administrador de la instancia |
| No tenés acceso | Puede ser suspensión o reglas no desplegadas; pedí revisión al responsable |
| No pudimos conectar | Revisá tu conexión y reintentá la operación |
| Se alcanzó la cuota gratuita | La aplicación recibió `resource-exhausted`; el responsable debe revisar el servicio |
| No hay productos para mostrar | Revisá búsqueda, categoría y casilla Archivados |
| Recargar vuelve a Resumen | Productos, Movimientos y Categorías comparten la URL `/` |

Usá **Cerrar sesión** al terminar. La interfaz no incluye borrado automático de cuenta, cambio de email ni importación CSV. Para corrección o eliminación de datos, contactá al responsable de la instancia, como indica la pantalla Privacidad.


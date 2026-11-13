# StockFlow · Documentación técnica

Caso de documentación de software para portfolio de **Technical AI Writer**. Audiencia: usuarios de pequeños negocios, desarrolladores y revisores técnicos.

**Versión documentada:** `0.1.0` en el commit [130533d](https://github.com/gianemanuelwagner/stockflow/commit/130533de658b7700f9003509362b262d3b378c0f).  
**Revisión documental:** 12 de noviembre de 2026.  
**Método:** lectura estática del código, reglas y pruebas del repositorio. La configuración desplegada y los servicios de producción no fueron inspeccionados.

## Recorridos de lectura

| Necesidad | Documento |
| --- | --- |
| Comprender componentes, dependencias y persistencia | [Arquitectura](architecture.md) |
| Seguir registro, inventario y administración | [Flujos de usuario](user-flows.md) |
| Consultar colecciones, campos y relaciones | [Modelo de Firestore](data-model.md) |
| Operar la aplicación paso a paso | [Manual de usuario](user-guide.md) |
| Evaluar permisos, validaciones y límites | [Seguridad](security.md) |
| Revisar método, prompts y trazabilidad | [Documentación asistida por IA](ai-documentation-process.md) |
| Reproducir controles y conocer su alcance | [Validación](validation.md) |

## Alcance comprobado

StockFlow es una SPA de inventario en español: cuentas con email y contraseña, productos, categorías, movimientos, CSV, miniaturas y administración de cuentas. Cada usuario posee su inventario mediante `ownerId`; el código no implementa miembros de equipo compartiendo un negocio.

La aplicación usa **JavaScript**, React 19, Vite 7, Tailwind CSS 4 y el SDK web de Firebase. Las versiones indicadas corresponden a los rangos declarados en [package.json](../package.json), no a una auditoría de versiones instaladas.

Firebase Authentication autentica; Firestore conserva perfiles y documentos comerciales; Firebase Hosting sirve `dist`. No se implementan Functions, Firebase Storage, API REST propia ni SSR. La demo usa estado React en memoria.

## Convenciones editoriales

- **Implementado:** se identifica el archivo y, cuando corresponde, la función o bloque responsable.
- **Límite:** comportamiento que el código no garantiza; no representa una funcionalidad pendiente ya aprobada.
- **Ejemplo:** datos ficticios usados para explicar una operación.
- **Verificación pendiente:** requiere ejecutar la aplicación, emuladores o inspeccionar la instancia real.

Esta entrega incorpora exclusivamente Markdown en `docs/` y un enlace desde el README principal. No cambia la aplicación, las reglas, las dependencias ni la configuración de despliegue.


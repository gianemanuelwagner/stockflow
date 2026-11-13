# Proceso de documentación asistida por IA

[Índice](README.md) · [Evidencia de validación](validation.md)

## Objetivo y criterio de calidad

Transformar el código de StockFlow en documentación útil para usuarios y revisores técnicos, sin inventar funcionalidades ni cambiar el software. Este caso muestra análisis de fuentes, adaptación a audiencias, diagramación, control de afirmaciones y transparencia sobre el uso de IA.

La IA participó en la lectura, síntesis y redacción de esta entrega. La revisión humana del propietario queda pendiente en el pull request; no se atribuye una aprobación humana que todavía no ocurrió.

## Flujo seguido en esta entrega

1. **Fijar la fuente.** Identificar la rama `master` y el commit `130533de658b7700f9003509362b262d3b378c0f`. Abrir el repositorio en el navegador de Work y complementar la lectura con los archivos completos de la conexión de GitHub.
2. **Inventariar responsabilidades.** Leer interfaz, acceso a datos, configuración, preparación de imágenes, reglas y pruebas. No usar memorias de conversaciones ni una propuesta de funcionalidades como evidencia técnica.
3. **Contrastar capas.** Seguir cada operación desde el formulario hasta la escritura y las reglas. Documentar diferencias entre cliente, autorización y demo.
4. **Organizar por audiencia.** Separar arquitectura y diccionario de campos del manual operativo. Mantener los nombres de controles que muestra el código.
5. **Redactar y diagramar.** Elaborar Mermaid de arquitectura, estados, registro, movimientos, administración y relaciones de datos.
6. **Validar afirmaciones.** Revisar cada documento contra símbolos o bloques de código; ejecutar las pruebas de dominio e imágenes disponibles sin servicios remotos; registrar pruebas no ejecutadas.
7. **Publicar para revisión.** Crear una rama documental y PR. El propietario puede revisar exactitud, claridad y representación de su trabajo antes de integrar.

## Matriz de trazabilidad

| Afirmación documental | Evidencia primaria | Comprobación o límite |
| --- | --- | --- |
| El ajuste fija el saldo final | [config.js](../src/config.js), `nextStock` | [domain.test.js](../tests/domain.test.js), ajuste a cero |
| Stock e historial se escriben juntos desde la app | [data.js](../src/data.js), `saveProduct` y `moveStock` | Revisión estática; no hay prueba de concurrencia ejecutada |
| Las reglas no fuerzan correspondencia contable | [firestore.rules](../firestore.rules), `products` y `movements` | No usan validación cruzada de producto y movimiento |
| Exportar ignora filtros de la tabla | [main.jsx](../src/main.jsx), `csv(products)` frente a `visible` | Revisión del manejador de Exportar CSV |
| Las categorías son texto, no FK | [data.js](../src/data.js), `saveCategory`; [main.jsx](../src/main.jsx), formularios | Renombrar/eliminar no recorre productos |
| Imágenes en documentos, sin Storage | [images.js](../src/images.js), `prepareImage`; [main.jsx](../src/main.jsx), `submitModal` | `photo` / `image` enviados con el documento |
| Administrador consulta inventario ajeno | [main.jsx](../src/main.jsx), `selected`, `uid`, `readOnly` | Reglas permiten lectura administrativa; no escritura comercial ajena |
| Suspensión no elimina identidad Auth | [main.jsx](../src/main.jsx), actualización de `status` | No llama a una API de eliminación o deshabilitación de Auth |
| Demo efímera con datos ficticios | [main.jsx](../src/main.jsx), `startDemo` y ramas `demo` | Estado React; no almacenamiento persistente de demo |

## Prompts reutilizables

Los siguientes prompts son **plantillas para repetir el proceso**. No se presentan como una transcripción literal de esta sesión.

### Extracción de hechos

> Analizá los archivos y el commit suministrados. Para cada operación, identificá formulario, función, consulta o escritura, regla aplicable y resultado. Citá el archivo y símbolo. Si falta evidencia, marcá “no comprobado”. No infieras funciones desde el nombre de una dependencia.

### Redacción para usuarios

> Convertí los flujos comprobados en instrucciones en español rioplatense. Usá los nombres exactos de botones. Explicá entrada, salida y ajuste con ejemplos ficticios. Separá demo de datos persistentes. No incluyas pasos que la interfaz no permite.

### Revisión técnica adversarial

> Contrastá el borrador con el código. Buscá afirmaciones absolutas sobre seguridad, integridad, unicidad, privacidad y persistencia. Distinguí controles de interfaz, reglas y configuración desplegada desconocida. Señalá cada afirmación sin evidencia y proponé una formulación verificable.

### Diagramación

> Generá Mermaid a partir de los flujos verificados. Diferenciá componentes de ejecución, estado de interfaz y relaciones lógicas. No inventes servidores, endpoints, tablas SQL, claves foráneas ni servicios Firebase que no se utilizan.

## Control editorial y revisión humana

La revisión debe comprobar que cada paso sea ejecutable en la interfaz de la versión indicada; que los ejemplos no parezcan datos reales; que las flechas de los diagramas representen llamadas o relaciones existentes; y que los límites permanezcan visibles.

Antes de aprobar, el propietario debe revisar especialmente la matriz de permisos, la explicación de categorías, el alcance de exportación CSV y la diferencia entre atomicidad del cliente y garantías de reglas. El texto no afirma certificaciones, resultados comerciales ni experiencia laboral obtenidos por crear esta documentación.

## Mantenimiento

Ante cambios en formularios o navegación, revisar manual y flujos. Ante cambios en `data.js` o `config.js`, revisar arquitectura y ejemplos de stock/CSV. Ante cambios en reglas, revisar esquema y seguridad. Ante cambios en pruebas, actualizar resultados solo después de ejecutarlas.

Actualizar el commit de referencia y la fecha de revisión cuando se vuelva a contrastar el conjunto. Si una afirmación no puede mantenerse, retirarla o marcar la incertidumbre; no conservarla por coherencia con un borrador generado.


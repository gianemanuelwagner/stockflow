# Validación de esta entrega

[Índice](README.md) · [Proceso asistido por IA](ai-documentation-process.md)

## Fuente y alcance

Se documentó el commit `130533de658b7700f9003509362b262d3b378c0f`, versión declarada `0.1.0`. La revisión se realizó el **12 de noviembre de 2026**.

Se leyeron los archivos completos de interfaz, configuración Firebase, acceso a datos, cálculo de stock/CSV, selector y preparación de imágenes, reglas, configuración de Hosting/Vite, manifiesto de dependencias y las tres suites de pruebas existentes. El navegador de Work se utilizó para inspeccionar el repositorio y revisar la publicación.

## Evidencia y resultados

| Control | Resultado de esta revisión |
| --- | --- |
| Revisión estática de flujos, diccionario y permisos | Contrastados con archivos y símbolos enlazados |
| Pruebas existentes de dominio e imágenes | **4 aprobadas, 0 fallidas, 0 omitidas** |
| Pruebas de reglas con Firestore Emulator | Leídas; **no ejecutadas** |
| Compilación de la aplicación | No ejecutada; no hubo cambios de aplicación |
| Autenticación, emails e inventario en producción | No probados |
| Compresión de imágenes en navegador | Algoritmo leído; no probado de extremo a extremo |
| Revisión humana | Pendiente en el pull request |

Se ejecutaron copias sin cambios de los módulos y pruebas correspondientes al commit fuente, con el comando:

```sh
node --test tests/domain.test.js tests/images.test.js
```

Casos aprobados: entradas/salidas/ajuste a cero; CSV con comillas y neutralización de fórmulas; fracciones y límites de stock; rechazo de MIME no admitido y archivos mayores al límite antes de decodificar. La última prueba no valida redimensionamiento ni calidad visual.

## Cómo reproducir las pruebas existentes

Desde una copia del repositorio con dependencias instaladas:

```sh
npm ci
npm test
npm run test:rules
```

Estos son pasos de reproducción, no un registro de comandos ejecutados en esta entrega. `npm test` ejecuta `tests/*.test.js` y omite los casos de reglas si no existe `FIRESTORE_EMULATOR_HOST`. `npm run test:rules` inicia el emulador y ejecuta `tests/rules.test.js` sobre `demo-stockflow`; requiere los prerrequisitos de Firebase CLI y Java. Un resultado con casos omitidos no demuestra que las reglas pasaron.

Las pruebas de reglas existentes cubren aislamiento por propietario, consultas, lectura administrativa, bloqueo de escalada, suspensión/reactivación, alta de perfiles, categorías, movimientos e imágenes. No constituyen una prueba de integridad contable: las reglas no implementan esa garantía.

## Lista de revisión del PR

- Confirmar que el diff contiene exclusivamente Markdown y el enlace documental del README.
- Comprobar navegación relativa entre documentos y referencias a fuentes.
- Revisar que GitHub renderice los diagramas Mermaid.
- Verificar que manual y ejemplos coincidan con los controles de la aplicación.
- Mantener explícitas las pruebas no ejecutadas y el desconocimiento de la configuración de producción.

No se desplegaron servicios ni se cambiaron reglas, dependencias o funcionalidades.


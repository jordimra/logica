# Diagnóstico inicial — Generador de Puzles Lógicos (Logic Puzzle Generator)

> **Fase 1 de la adaptación a OpenSpec.** Este documento captura el estado real del proyecto y la línea base de comportamiento observable **antes** de modificarlo. No es una auditoría exhaustiva ni certifica que el comportamiento observado sea correcto.

## 1. Fecha, alcance y limitaciones de la inspección

- **Fecha:** 2026-11-17.
- **Alcance:** repositorio `B:\proyectos\programar\Asistido\openspec\logica` (rama `main`), 5 ficheros de código/documentación, histórico git (3 commits) y andamiaje OpenSpec local.
- **Método:** lectura estática de todo el código fuente (100 % de los ficheros), `git status`/`log`/`remote`, comprobación de herramienta PHP local.
- **Limitaciones:**
  - **PHP no está instalado en este equipo** (comando `php` no reconocido). No se ha podido ejecutar el servidor ni generar el HTML real; la verificación dinámica queda pendiente (ver §7 y T-tests).
  - Sin ejecución, los hallazgos de comportamiento JS se apoyan en **trazado estático** y se marcan como tales.
  - No hay tests ni CI previos; no existe línea base automatizada de la que partir.

## 2. Arquitectura y componentes

Aplicación web **sin dependencias ni base de datos**: PHP solo genera la plantilla HTML; toda la lógica de negocio vive en el navegador.

| Fichero | Tamaño aprox. | Rol |
|---|---|---|
| `logic.php` | 39 líneas | Lee `$_GET['mode']` (`3x4` por defecto) y calcula `$numCats`, `$numItems`, `$rowOrder`, `$colOrder`, `$totalVisualCols`. **No valida** el valor de `mode` (cualquier valor ajeno a los 4 casos cae a la configuración 3x4, pero la variable se conserva en crudo). |
| `index.php` | 180 líneas | `require 'logic.php'` y plantilla HTML: tabla INTRO (categorías/ítems editables), tabla LÓGICA (zonas de celdas generadas por bucles PHP según `$rowOrder`/`colOrder`), tabla RESULTADOS, y bloque `<script>` con `CONFIG` (numCats, numItems, mode, catNames fijos `A..E`). |
| `script.js` | 455 líneas | Toda la lógica: toggle de celdas (vacío→❌→🔵), autocruce de fila/columna, inferencia transitiva (`infer`/`findMatch`/`setRel`/`getCoords`), tabla de resultados, resaltado de conflictos (`checkHighlights`), undo (pila de 50 estados, `Ctrl+Z`), import/export JSON, limpieza por grupo/etiqueta/zona. |
| `styles.css` | 173 líneas | Estilos de tarjetas, tablas, celdas, avisos visuales. Sin lógica. |
| `README.md` | 39 líneas | Documentación de usuario (ver §4). |

**Topología de zonas** (zonas = pares de categorías que se comparan entre sí):
- `3x4` / `4x4` / `5x4` (numCats=4): 6 zonas → (A,B), (A,C), (A,D), (D,B), (D,C), (C,B). `numItems` = 3/4/5 respectivamente.
- `5x5` (numCats=5, "variable E"): 10 zonas → (A,B..E), (E,B..D), (D,B..C), (C,B). `numItems` = 5.
- `getCoords()` (`script.js:286-303`) cubre exactamente esos pares por modo; pares no cubiertos devuelven `null` y se ignoran.

**Flujo de un click simple:** `toggleCell` → temporizador de 250 ms (para no chocar con doble click) → `applyState` → si 🔵: `autoCross` (❌ al resto de la fila y columna de la zona) + `infer` (inferencia transitiva) → `updateResultsTable` → `checkHighlights`.

## 3. Comportamientos observados y fuentes

Clasificación: **Hecho** (evidencia verificable) · **Inferencia** · **Desconocido** · **Defecto observado** · **Decisión pendiente**.

| # | Tipo | Hallazgo | Evidencia |
|---|---|---|---|
| H1 | Hecho — **confirmado en ejecución (2026-11-17)** | El PHP no valida `mode`; el valor crudo de `$_GET['mode']` se ecoea **sin escapado** en `<title>` y dentro de una cadena de `<script>` (`mode: '<?php echo $mode; ?>'`). Permite romper el contexto HTML/JS con `?mode=</title>...`. XSS reflejado (requiere que el usuario haga clic en un enlace preparado). Evidencia: `GET /index.php?mode=%22%3E%3Cscript%3E...` refleja el payload sin escapar en `<title>`. | `logic.php:5`, `index.php:7`, `index.php:174`; respuesta HTTP 2026-11-17 |
| H2 | Defecto observado — **confirmado empíricamente (2026-11-17, T1 ejecutado)** | **Recursión infinita en la inferencia transitiva.** Al formar un triángulo (p. ej. `A1=B1` y `A1=C1`), la inferencia crea `B1=C1` y al re-aplicar estados sobre celdas ya circuladas `infer`→`setRel`→`applyState`→`infer` cicla sin fijar punto fijo: `RangeError: Maximum call stack size exceeded`. Consecuencia observable: error sin capturar, y `updateResultsTable` **no se ejecuta** (la tabla de resultados queda sin actualizar). Es el caso de uso básico que el README anuncia como característica ("Lógica Transitiva Automática"). | Trazo de `script.js:221-303` (`applyState`, `infer`, `setRel`, `findMatch`) sobre 3x4: `infer(0,0,1,0)` ↔ `infer(2,0,1,0)` en ciclo. Sin guardas de profundidad, sin `visited`, sin memoización. **Evidencia empírica (2026-11-17, T1 ejecutado con Playwright contra `php -S localhost:8000`):** tras colocar 🔵 en (A,B) r0c0 y (A,C) r0c0 → (B,C) r0c0 se marca solo (transitividad funciona), pero la consola lanza `RangeError: Maximum call stack size exceeded` (pila: `applyState:231 → infer:255 → setRel:278 → applyState:230` en ciclo) y `res_val_C_0` queda vacío porque `updateResultsTable` no se ejecuta. |
| H3 | Defecto observado (menor) | Clicks rápidos en celdas **distintas**: el temporizador pendiente de la celda anterior se anula (`if (clickTimer) clearTimeout(clickTimer)`), por lo que la primera marca se pierde si no transcurren 250 ms. | `script.js:198-220` (commit `c94ae5c` "Retardo para doble click") |
| H4 | Defecto observado (menor) | `Ctrl+Z` intercepta el undo del navegador **incluso dentro de campos de texto** (`e.preventDefault()` incondicional): no se puede deshacer la edición de los nombres de categorías/ítems. | `script.js:62-67` |
| H5 | Defecto observado (menor) | Cambiar el selector de modo hace `form.submit()` (GET) → recarga completa → **se pierden sin aviso** todas las marcas del tablero, los textos y la descripción no exportados. | `index.php:16-23` |
| H6 | Defecto observado (menor) | Inconsistencia de confirmaciones: doble click sobre una etiqueta (`handleCleanLabel`) limpia todo un grupo **sin confirmación**, mientras que `cleanCategory` y `cleanZone`/`resetLogic` sí piden confirmación. | `script.js:332-343` vs `script.js:322-336` |
| H7 | Hecho | Sin tests, sin CI, sin fichero de dependencias ni lock file. Git: 3 commits (`b5481f7` first, `0b34543` Undo, `c94ae5c` Retardo para doble click), `main` sincronizada con `origin` (`https://github.com/jordimra/logica`). Ficheros sin versionar: `.agents/` y `openspec/`. | `git log/status/remote` |
| H8 | Hecho | `README.md` está **truncado**: termina a mitad del bloque de código (línea 39, `php -S localhost:8000`) sin cerrar ``` ```, sin la sección "Opción B". Referencia `screenshot.png` que no existe en el repositorio. | `README.md` (39 líneas, 1891 B) |
| H9 | Inferencia | Los modos `4x4`/`5x4` reutilizan la topología de zonas de `3x4` (solo cambia `numItems`); `5x5` añade la categoría E con 4 zonas extra. Coherente, pero sin cobertura de prueba. | `logic.php:15-35`, `index.php:109-113` |
| H10 | Hecho | El export JSON solo guarda modo, nombres, ítems y descripción; **no** guarda el estado del tablero (❌/🔵), pese a que el README dice "Guarda tus plantillas **o progresos**". | `script.js:86-119` vs `README.md:26` |
| H11 | Desconocido | Entorno real de ejecución del usuario (¿PHP en otra máquina? ¿XAMPP/WAMP?) — no verificable desde aquí. | `php` no instalado localmente |
| H12 | Decisión pendiente | El defecto H2 es **observado en el código**, pero el README lo describe como característica deseada: ¿se trata como bug a corregir en la adaptación, o como requisito a reformular? Requiere aprobación humana (ver §8). | `README.md:19` vs H2 |

## 4. Estado de documentación, pruebas y OpenSpec

- **Documentación:** solo `README.md` (incompleto, H8). Sin `docs/` previo, sin manual, sin changelog.
- **Pruebas:** ninguna (no hay directorio `tests/`, ni framework, ni script `npm`, ni CI).
- **OpenSpec:** `openspec/config.yaml` con `schema: spec-driven` y **sin** reglas ni contexto personalizado (todo comentado). `openspec/specs/` vacía (solo `.gitkeep`), `openspec/changes/` vacía. Andamiaje **sin commitear** (H7) → riesgo de pérdida.
- **Instrucciones de agente:** `.agents/skills/` con 6 skills OpenSpec (apply, archive, explore, propose, sync, update-change).

## 5. Riesgos

No existe matriz de severidad aprobada → se documentan **probabilidad** e **impacto** por separado (escala B/M/A) y la severidad queda sin asignar.

| ID | Escenario | Componente | Evidencia | Prob. | Impacto | Mitigación propuesta | Verificación |
|---|---|---|---|---|---|---|---|
| R1 | Recursión infinita al usar la inferencia transitiva (caso de uso principal) | `script.js` (`infer`/`setRel`/`applyState`) | H2 (trazado) | **Alta** (ocurre con 2 clicks) | **Medio** (error sin capturar, resultados sin actualizar; el tablero queda en estado ya aplicado) | Confirmar empíricamente (T1) y proponer change de corrección en Fase 3 (guarda de profundidad / iteración a punto fijo) | T1 en entorno aislado |
| R2 | XSS reflejado vía `?mode=` (enlace malicioso) | `index.php` / `logic.php` | H1 | **Baja** (requiere clic en enlace preparado; no hay cuentas ni datos sensibles en servidor) | **Medio** (JS arbitrario en contexto de la página) | Validar `mode` en servidor (whitelist) y/o `htmlspecialchars` | Prueba con `?mode=%22%3E...` (T8) |
| R3 | Regresión sin línea base: cualquier cambio no tiene tests que lo respalden | Todo el repo | H7 | **Alta** | **Medio** | Tests de caracterización de la Fase 1/2 como línea base (T1–T10) | Suite reproducible antes/después de cambios |
| R4 | No se puede ejecutar la app en esta máquina (sin PHP) → verificación dinámica bloqueada | Entorno | H11 | **Alta** (de hecho) | **Medio** (frena la adaptación) | Decisiones D1 (ver §8): instalar PHP, o caracterizar la lógica JS en Node (jsdom) + playwright opcional | Entorno elegido ejecuta T1 |
| R5 | Pérdida de trabajo sin aviso al cambiar modo o al recargar | `index.php` (selector) | H5 | **Media** | **Medio** (pérdida de progreso no exportado) | Confirmar antes de recargar, o auto-guardado local | Manual (T9) |
| R6 | Pérdida de marcas con clicks rápidos; undo global que roba `Ctrl+Z` a los inputs | `script.js` | H3, H4 | **Media** / **Media** | **Bajo** (re-click / edición manual) | Revisar al corregir R1 (mismo módulo) | Manual |
| R7 | El export no cubre el "progreso" que el README promete → los usuarios no pueden guardar su trabajo en curso | `script.js` (`exportData`) | H10 | **Media** | **Medio** (mismo síntoma que R5) | Decision D2: corregir export o corregir README | T10 |
| R8 | Andamiaje OpenSpec sin commitear → pérdida de configuración/specs | `openspec/`, `.agents/` | H7 | **Baja** | **Bajo/Medio** | Commitear tras aprobación de esta fase | `git status` limpio |

**Nota:** la ausencia de evidencia de un riesgo (p. ej. inyección en el flujo de import) no implica que no exista; el import JSON asigna valores por `.value`/`.innerText` (no `innerHTML`), lo que lo hace inocuo *por ahora* (H: `script.js:141-159`), pero está sin testeado.

## 6. Inventario priorizado de tests de caracterización (PROPUESTOS, no creados)

**Definición:** estos tests capturan el comportamiento **tal como se observa hoy**; no certifican que sea correcto (p. ej. T1 está pensado para *confirmar* el defecto H2 y registrarlo como línea base).

Entorno propuesto: Node + `jsdom` con la tabla LÓGICA generada por un pequeño script (o el HTML real si se instala PHP). Dependencias a aislar: reloj (`CLICK_DELAY=250` → stub de `setTimeout` o valor 0 vía flag de test), `sessionStorage`, `FileReader`, `alert`/`confirm` (stubs determinísticos), `URL.createObjectURL`.

| ID | Prioridad | Comportamiento | Entrada/condición | Salida esperada (a observar) | Riesgo cubierto |
|---|---|---|---|---|---|
| T1 | **P0** | Inferencia transitiva: triángulo | Modo 3x4; click 🔵 en (A,B) fila0-item0 y en (A,C) fila0-item0 | (a) (B,C) se marca 🔵 automáticamente; (b) **observar si lanza `RangeError`** (H2) y qué queda en el DOM | R1 |
| T2 | P0 | Ciclo vacío→❌→🔵→vacío | Clicks sucesivos en una celda | Clases `opt-cross`/`opt-circle` según (est+1)%3; ❌ en celdas sin 🔵 nunca se sobreescribe | R3 |
| T3 | P0 | Autocruce al colocar 🔵 | 🔵 en (A,B) r0c0 | El resto de la fila 0 y columna 0 de la zona (A,B) → ❌; 🔵 existentes no se tocan | R3 |
| T4 | P1 | `getCoords` por modo | Todas las combinaciones (i,j) de categorías en 3x4 y 5x5 | Mapeo zona ↔ zona existente; `null` para pares sin zona | R3 |
| T5 | P1 | Undo | Secuencia: 3 cambios + `undo()`×3; pila > 50 estados | Restauración exacta de clases; `Ctrl+Z` (evento sintético); límite `MAX_HISTORY=50` descarta el más antiguo | R6 |
| T6 | P1 | Import/export JSON (modo igual) | Fixture JSON válido | Nombres/ítems/descripción poblados; `historyStack` reiniciado; alerta de éxito | R7 |
| T7 | P1 | Import con modo distinto | Fixture `mode: 5x5` sobre página 3x4 | `confirm` → `sessionStorage.pendingImport` + `location.search` recargado; al recargar, se puebla (stub de `window.onload`) | R7 |
| T8 | P2 | XSS vía `mode` (PHP) | `?mode=%22%3Ealert(1)` (requiere PHP) | Registro de si el valor se refleja sin escapado (H1) | R2 |
| T9 | P2 | Pérdida de estado al cambiar modo | Marcas en tablero + cambio de selector | Documentar la pérdida (H5) y el aviso (o su ausencia) | R5 |
| T10 | P2 | Contenido del export | Tablero con marcas + export | Registrar que el estado ❌/🔵 **no** se incluye (H10) | R7 |

## 7. Cómo ejecutar la app y las pruebas

- **App (requerido por README):** `php -S localhost:8000` desde la raíz del proyecto → `http://localhost:8000/index.php` (modo por defecto `3x4`; `?mode=4x4|5x4|5x5`). **Bloqueado hoy:** PHP no está instalado en este equipo (H11). Alternativas a valorar en D1: instalar PHP localmente; o servir solo el HTML estático generado + `script.js` con `playwright` para pruebas de UI; o aislar la lógica JS en Node (jsdom) para T1–T7 (sin PHP).
- **Pruebas existentes:** **no existen**. No hay comando de test. La línea base se construirá en la Fase 2 con T1–T10 (propuestos aquí).
- **Datos/entorno:** sin base de datos; el único estado persistente es manual (JSON exportado) y `sessionStorage.pendingImport` (import entre modos). Sin servicios externos, sin reloj relevante salvo `CLICK_DELAY`.

## 8. Incertidumbres, contradicciones y decisiones pendientes

| ID | Tipo | Descripción | Bloqueante para la Fase 2? |
|---|---|---|---|
| D1 | Decisión pendiente | **Entorno de verificación:** (a) instalar PHP y probar la app real (recomendado, evidencia máxima); (b) Node+jsdom solo para la lógica JS + playwright opcional para UI. R4 la hace crítica. | Sí (define cómo se ejecuta la línea base) |
| D2 | Decisión pendiente | **H2/H10: defecto vs requisito.** La "transitividad" se anuncia en el README pero su implementación actual entra en recursión infinita (H2), y el "progreso" exportable (H10) no existe. ¿Se corre en la adaptación (changes en Fase 3) o se documenta como estado aceptado? | No (se puede especificar el comportamiento actual y corregir después), pero conviene decidirlo antes de la Fase 3 |
| D3 | Incertidumbre | Entorno de producción real del usuario (H11). Afecta solo a despliegue, no a la lógica. | No |
| D4 | Decisión pendiente | Commitar `.agents/` y `openspec/` tras aprobar esta fase (R8). | No |
| C1 | Contradicción documentada | README: "Importar/Exportar: guarda plantillas **o progresos**" vs export que omite el tablero (H10). | — |
| C2 | Contradicción documentada | README anuncia la transitividad como característica (línea 19) vs implementación que falla en su caso de uso típico (H2). | — |

## 9. Plan para las fases siguientes

1. **Fase 2 (setup):** decidir D1; elegir y montar el runner de tests (Node+jsdom o PHP); documentar en OpenSpec (`openspec/config.yaml`: contexto y reglas en español) cómo ejecutar la línea base; commitear andamiaje (D4).
2. **Fase 3 (specs):** especificar el comportamiento **observado** (T1–T10 como referencia), separando explícitamente requisitos confirmados de defectos (H2, H10 según D2); capturar las capabilities: tablero e interacción, inferencia transitiva, ayudas visuales, undo, import/export, modos de tamaño.
3. **Fase 4 (workflow):** cambios OpenSpec con tests de caracterización antes/después; cambios candidatos a plantear: corrección R1 (recursión), R2 (validación/escape de `mode`), R5/R7 (pérdida de estado y export de progreso) — cada uno como change independiente si D2 lo aprueba.
4. **Fase 5 (validación):** comparar línea base con resultados post-cambio, cerrar evidencias.

**Criterio de salida de la Fase 1:** este documento existe, todos los hallazgos relevantes citan evidencia, y los comportamientos observados están separados de los requisitos. **Pendiente de aprobación humana antes de iniciar la Fase 2.**

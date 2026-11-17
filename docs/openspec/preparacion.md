# Fase 2 — Preparación de OpenSpec

> **Fecha:** 2026-11-17 · **Entrada:** `docs/openspec/diagnostico-inicial.md` (Fase 1 aprobada por el usuario, decisiones D1/D2/D4) · **Objetivo:** preparar la configuración OpenSpec y las condiciones para ejecutar la línea base de caracterización **sin modificar la funcionalidad del producto**.

## 1. Versión de OpenSpec y evidencia de verificación

- **CLI instalada:** `openspec --version` → **2.1.0** (comprobado en la sesión de trabajo, 2026-11-17).
- **Validación de proyecto:** `openspec list` → "No active changes found"; `openspec list --specs` → "No specs found" (coherente con `openspec/specs/` y `openspec/changes/` vacíos).
- **Esquema:** `schema: spec-driven` (definido en `openspec/config.yaml`).
- **Skills OpenSpec presentes** en `.agents/skills/` (apply, archive, explore, propose, sync, update-change) y `.agents/skills/.openspec-target` = `opencode`.

## 2. Configuración e instrucciones creadas o modificadas

| Fichero | Cambio | Justificación |
|---|---|---|
| `openspec/config.yaml` | Añadidas `context:` y `rules:` (propuesta/tareas/specs) en español: stack sin dependencias/BD, comando de servidor, convención `tests/characterization/` + `tests/fixtures/`, obligación de tests antes/después, y de distinguir observado vs. requisito. Se conservó el bloque de comentarios de plantilla original. | Convenciones no inferibles del código (config de entorno y flujo de tests) |
| `.gitignore` | **No modificado** (creado por el usuario el 2026-11-17 a las 19:06; ignora `.agents/`, editores y temporales). Se respeta como instrucción del usuario: `.agents/` queda **fuera** del versionado. | Decisiones de versionado del usuario |
| `docs/openspec/diagnostico-inicial.md` | Edición mínima: H1 y H2 marcados como **confirmados empíricamente** con la evidencia de ejecución del 2026-11-17 (sin borrar información). | Actualización de la línea base |

No se creó `AGENTS.md` de proyecto (existe una AGENTS.md global del usuario) ni se añadieron instrucciones de agente adicionales: lo mínimo suficiente.

## 3. Decisiones aprobadas y pendientes

| ID | Decisión (aprobada por el usuario, 2026-11-17) | Estado |
|---|---|---|
| D1 | **PHP local** como entorno de verificación. | **Aplicado:** PHP **8.4.27 NTS** (Visual C++ 2022 x64) instalado vía `winget install PHP.PHP.NTS.8.4`; PATH de usuario actualizado (PATH efectivo en esta sesión: `C:\Users\jordimra\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.NTS.8.4_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe`). |
| D2 | **H2 y H10 son defectos a corregir antes de seguir** (no comportamiento aceptado). | Registrada: en la Fase 3 se especificarán como requisitos a corregir en changes independientes (R1: recursión; R7: export de progreso). El resto del comportamiento observado se especifica como línea base. |
| D4 | Commitar andamiaje tras la Fase 1. | **Aplicado con matiz:** el `.gitignore` del usuario excluye `.agents/`; se commitean `.gitignore`, `openspec/` y `docs/` (ver §5). |
| D3 | Entorno de producción real del usuario. | **Pendiente** (no bloquea; solo afecta a despliegue). |

## 4. Archivos afectados

- `openspec/config.yaml` — modificada (contexto y reglas; sin tocar `schema`).
- `docs/openspec/preparacion.md` — nuevo (este documento).
- `docs/openspec/diagnostico-inicial.md` — actualización de evidencia H1/H2 (sin cambios de contenido sustantivo).
- **Sin cambios:** `index.php`, `logic.php`, `script.js`, `styles.css`, `README.md` (verificado por `git status`/`git diff --stat`: los únicos cambios son `?? .gitignore`, `?? docs/`, `?? openspec/` + edición del config OpenSpec, ninguno de producto).

## 5. Comandos de validación ejecutados y resultados

| # | Comando / acción | Resultado |
|---|---|---|
| V1 | `openspec --version` | `2.1.0` |
| V2 | `openspec list` / `openspec list --specs` (antes y después de editar `config.yaml`) | "No active changes found" / "No specs found" → config parseable y sin cambios activos |
| V3 | `winget install PHP.PHP.NTS.8.4` | Instalación correcta (hash verificado); `php -v` → PHP 8.4.27 (NTS x64) |
| V4 | Servidor: `php -S localhost:8000` desde la raíz (shell en background, PID 20428) | **Corriendo** |
| V5 | `GET http://localhost:8000/index.php` | 200; se sirven las 3 tarjetas (INTRODUCCIÓN/LÓGICA/RESULTADOS), selector de modos y tabla 3x4 (`cell_0_1_0_0` presente) |
| V6 | `GET /index.php?mode=%22%3E%3Cscript%3Ealert(1)%3C%2Fscript%3E` | Payload reflejado **sin escapar** en `<title>` → **H1/XSS confirmado** (R2) |
| V7 | T1 (P0) con Playwright: 🔵 en (A,B) r0c0 y (A,C) r0c0 en 3x4 | (B,C) r0c0 **inferido** (`cell_2_1_0_0=O`); consola: **`RangeError: Maximum call stack size exceeded`** en el ciclo `applyState:231→infer:255→setRel:278→applyState:230`; `res_val_C_0` vacío (tabla de resultados no actualizada) → **H2 confirmado** (R1) |
| V8 | `git diff --stat` | Sin ficheros de producto modificados |

**Servidor en background:** `sh_1eab3e1e90011L6TL0iq3OpxCO` (PID 20428). Para detenerlo: `Stop-Process -Id 20428` o cerrar la shell en background. Para reiniciar: `& "C:\Users\jordimra\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.NTS.8.4_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe" -S localhost:8000` desde la raíz.

## 6. Cómo ejecutar las pruebas existentes y la línea base de caracterización

- **Pruebas existentes:** **no existen** (ningún framework, suite ni comando de test en el repositorio). **No se declara ninguna línea base ejecutable todavía** (restricción de la fase).
- **Línea base (plan aprobado en Fase 1, T1–T10):** se implementará en `tests/characterization/` durante la Fase 4, **antes** del primer change. Convención fijada en `openspec/config.yaml`:
  - **Entorno:** servidor PHP local (`php -S localhost:8000`) + Playwright (driver existente del entorno OpenCode); fixtures JSON en `tests/fixtures/`.
  - **Ejecución típica (a documentar con detalle en Fase 4):** arrancar servidor → `node tests/characterization/<suite>.mjs` → reportes en `docs/openspec/evidencia/`.
  - **Aislamiento:** cada test recarga la página (estado limpio); dependencias a stubear si se usa jsdom: reloj (`CLICK_DELAY=250`), `sessionStorage`, `alert`/`confirm`, `FileReader`.
  - **Nota T1:** ya se ejecutó **una vez** manualmente (V7) como evidencia de diagnóstico; su versión automatizada formará parte de la suite. La observación (RangeError + resultados sin actualizar) es la **línea base del defecto**: tras la corrección (D2), el comportamiento esperado **cambiará** y la suite se actualizará con evidencia nueva; no se editan los resultados esperados para coincidir con una implementación futura.

## 7. Ubicación y estado de tests, fixtures y resultados

| Recurso | Ubicación (convención) | Estado |
|---|---|---|
| Tests de caracterización | `tests/characterization/` | **Propuestos (T1–T10), no creados** |
| Fixtures JSON (import/export) | `tests/fixtures/` | No creados |
| Evidencia de resultados | `docs/openspec/evidencia/` | Parcial: H1 y H2 documentados en `diagnostico-inicial.md` (V6/V7) |
| Suite de producto | — | No existe |

## 8. Limitaciones, riesgos y condiciones para la Fase 3

- **Línea base no ejecutable todavía:** los tests T1–T10 existen solo como plan; la Fase 4 debe crearlos y ejecutarlos **antes** de tocar `script.js`/`index.php`.
- **Servidor en background** durante la sesión (V8): si la sesión se cierra, hay que reiniciar con el comando del §5.
- **PATH:** las shells heredadas de esta sesión no ven `php` en el PATH; usar la ruta completa del §5 o abrir una shell nueva.
- **R2 (XSS)** sigue vivo en el producto (no mitigar en esta fase, restricción); su corrección es un change de Fase 3/4 tras D2.
- **D2 aprobada:** H2 y H10 se tratan como defectos → la Fase 3 debe producir specs que (a) capturen el comportamiento observado restante y (b) especifiquen el comportamiento **corregido** deseado para la transitividad (p. ej.: inferencia a punto fijo sin recursión infinita, resultados siempre actualizados) y para el export de progreso; cada decisión de diseño (algoritmo de inferencia, esquema del JSON de export) requerirá aprobación.
- **Condición de salida cumplida:** `docs/openspec/preparacion.md` existe; `config.yaml` validada; sin cambios de producto. **Esperando aprobación humana antes de la Fase 3.**

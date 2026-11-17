# Proposal — confirm-before-mode-reload (CHG-6)

## Why

Defecto R5 (confirmado por T9 de la suite): cambiar el modo desde el selector `<select name="mode" onchange="this.form.submit()">` **recarga la página de inmediato** (navegación GET) y el trabajo no exportado (marcas ❌/🔵, textos de categorías/ítems) **se pierde sin aviso**. Es la última puerta de la cola CHG.

Requisito confirmado por **IC-1** (aprobado 2026-11-17): "Confirmar antes de recargar al cambiar de modo". La spec `board-modes` ya contiene el requisito "Confirmación antes de recargar al cambiar de modo" con los escenarios de línea base y requeridos.

## What Changes

- **`index.php` (1 línea):** `onchange="this.form.submit()"` → `onchange="confirmModeChange(this)"` (el resto del selector y las opciones no cambian; el modo sigue viajando por GET al confirmar).
- **`script.js` (función nueva `confirmModeChange(sel)`):**
  - Si `sel.value === CONFIG.mode` → sin acción (no se cambia nada).
  - Si hay cambio: `confirm("¿Cambiar al modo X? Se perderá el progreso no exportado.")`.
    - **Confirmar** → `sel.form.submit()` (recarga en el nuevo modo; el progreso no exportado se pierde, como el usuario acaba de aceptar).
    - **Cancelar** → `sel.value = CONFIG.mode` (el selector vuelve al modo actual; **no** recarga, el tablero y los textos permanecen intactos).
- **Test T9** (`tests/characterization/run.mjs`): se actualiza a la línea base corregida (cambio intencional aprobado por el delta): (a) al **cancelar** la confirmación el modo sigue siendo el original y la marca se conserva (sin recarga); (b) al **confirmar** la recarga ocurre y el modo cambia. Se verifica que la confirmación se solicitó (contador de `__diag`). Los valores anteriores (recarga inmediata sin aviso) se conservan en la evidencia.
- Sin cambios en `logic.php`, `styles.css`, ni en el flujo de import/export (T7 sigue siendo `window.location.search`, no el selector).

## Criterios de aceptación

1. **CA1:** T9 corregido (cancelar): se pidió confirmación, el modo no cambia y la marca se conserva (sin recarga).
2. **CA2:** T9 corregido (confirmar): la recarga ocurre y el modo cambia al seleccionado.
3. **CA3:** T7 (import de otro modo) y T4 (topología por modo) idénticos a la línea base.
4. **CA4:** T1, T1b, T2, T2b, T3, T5, T5b, T6, T8, T10 y T11 idénticos a la línea base.
5. **CA5:** `git diff` limitado a `index.php`, `script.js` y `tests/characterization/run.mjs`.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `board-modes`: se modifica "Confirmación antes de recargar al cambiar de modo" (el escenario de línea base del defecto pasa a histórico; se añaden los escenarios de cancelar y de confirmar; el requisito pasa de "pendiente en CHG-6" a implementado).

## Impact

- **Código:** `index.php` (1 línea), `script.js` (función ~10 líneas).
- **Riesgo:** la restauración del `select` al cancelar debe evitar un segundo `change` (asignar `.value` no dispara `onchange` en navegadores estándar). Mitigación: T9 verifica el modo resultante tras cancelar.
- **Nota de UX:** la confirmación se muestra aunque no haya marcas (consistencia simple; el mensaje advierte la pérdida potencial). No se añade lógica condicional de "solo si hay progreso" para mantener el cambio mínimo y predecible.

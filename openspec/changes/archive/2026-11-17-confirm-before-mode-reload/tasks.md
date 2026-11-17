# Tasks — confirm-before-mode-reload (CHG-6)

## Línea base

- [x] Ejecutar `npm run test:characterization` ANTES del cambio y conservar el reporte en `docs/openspec/evidencia/confirm-before-mode-reload/antes.md` (14 tests, 0 derivas; T9 con defecto R5 registrado).

## Implementación (solo index.php, script.js y el test T9)

- [x] `index.php`: `onchange="this.form.submit()"` → `onchange="confirmModeChange(this)"`.
- [x] `script.js`: función `confirmModeChange(sel)` según `design.md` (sin cambio → sin acción; confirmar → `form.submit()`; cancelar → `sel.value = CONFIG.mode`).
- [x] Actualizar el test T9 a la línea base corregida (cambio intencional aprobado por el delta): (a) cancelar → confirmación pedida + modo y marca intactos; (b) confirmar → recarga al modo nuevo. Valores anteriores en `antes.md`.

## Verificación

- [x] Ejecutar la suite DESPUÉS (14 tests, 0 derivas); `docs/openspec/evidencia/confirm-before-mode-reload/despues.md` con la comparación por test: T9 cambio intencional documentado; T4/T7 guardas; resto idénticos.
- [x] `openspec validate confirm-before-mode-reload` OK y `git diff` revisado: solo `index.php`, `script.js` y `tests/characterization/run.mjs`.

## Criterios de aceptación

- [x] CA1: T9 (cancelar): confirmación pedida, modo y marca intactos.
- [x] CA2: T9 (confirmar): recarga al modo nuevo.
- [x] CA3: T7 (import otro modo) y T4 (topología) idénticos a la línea base.
- [x] CA4: resto de tests idénticos a la línea base.
- [x] CA5: diff limitado a `index.php`, `script.js` y `run.mjs`.

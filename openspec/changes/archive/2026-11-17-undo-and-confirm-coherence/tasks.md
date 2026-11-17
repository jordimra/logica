# Tasks — undo-and-confirm-coherence (CHG-5)

## Línea base

- [x] Ejecutar `npm run test:characterization` ANTES del cambio y conservar el reporte en `docs/openspec/evidencia/undo-and-confirm-coherence/antes.md` (13 tests, 0 derivas; H4/H6 en línea base).

## Implementación (solo script.js y tests)

- [x] H4: helper `isTextEditable(el)` + el handler de Ctrl+Z ignora el atajo cuando `document.activeElement` es un campo de texto editable (undo nativo); fuera de campos de texto, invariante.
- [x] H6: `cleanZone` pide confirmación "¿Limpiar zona?" (tras cancelar los clicks pendientes de la zona, antes de `saveHistory`); `handleCleanLabel` pide confirmación "¿Limpiar ítem?" antes de limpiar.
- [x] Añadir T5b: H4 (Ctrl+Z en input → undo nativo + tablero intacto; fuera del input → undo del tablero) y H6 (zona y ítem: confirmación, cancelar → sin cambios, confirmar → se limpia). (Corrección de test documentada en `despues.md`: `fill('')` previo al input para hacer determinista el undo nativo.)

## Verificación

- [x] Ejecutar la suite DESPUÉS (14 tests, 0 derivas); `docs/openspec/evidencia/undo-and-confirm-coherence/despues.md` con la comparación por test (T5b nuevo; T5/T2b guardas intactos; resto idénticos).
- [x] `openspec validate undo-and-confirm-coherence` OK y `git diff` revisado: solo `script.js` y `tests/characterization/run.mjs`.

## Criterios de aceptación

- [x] CA1: T5b H4 (Ctrl+Z respeta los inputs de texto: undo nativo + tablero intacto; fuera del input, undo del tablero).
- [x] CA2: T5b H6 (confirmaciones en zona y ítem; cancelar → sin cambios; confirmar → se limpia).
- [x] CA3: T5 y T2b idénticos a la línea base.
- [x] CA4: T1, T1b, T2, T3, T4 y T6–T11 idénticos a la línea base.
- [x] CA5: diff limitado a `script.js` y `run.mjs`.

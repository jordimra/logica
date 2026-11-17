# Proposal — undo-and-confirm-coherence (CHG-5)

## Why

Dos defectos menores de coherencia (PD-3, aprobado 2026-11-17: "Unificar: Ctrl+Z respeta inputs de texto (H4) y confirmaciones coherentes en limpiezas (H6)"):

- **H4:** el handler de teclado hace `e.preventDefault()` **incondicional** ante Ctrl+Z (`script.js:64-69`): con el foco dentro de un campo de texto (nombres de categorías/ítems, enunciado), Ctrl+Z deshace una operación del **tablero** en vez del texto del input. No se puede deshacer la edición de los textos.
- **H6:** inconsistencia de confirmaciones en las limpiezas destructivas: `resetLogic` ("Limpiar tablero") y `cleanCategory` (doble click en cabecera de categoría) piden confirmación; `cleanZone` (doble click en zona) y `handleCleanLabel` (doble click en etiqueta de ítem) **no** la piden. (Nota: el diagnóstico indicaba que `cleanZone` la pedía — verificado en el código: no la pide; la inconsistencia real afecta a `cleanZone` y `handleCleanLabel`.)

## What Changes

- **`script.js` — H4:** el handler de Ctrl+Z/Cmd+Z ignora el atajo cuando el elemento activo es un campo de texto editable (`INPUT` de tipo texto, `TEXTAREA` o `contentEditable`); el navegador ejecuta entonces su undo nativo sobre el texto. Fuera de campos de texto, el comportamiento es el actual (undo del tablero).
- **`script.js` — H6:** `cleanZone` y `handleCleanLabel` piden confirmación antes de limpiar (mensajes "¿Limpiar zona?" / "¿Limpiar ítem?"), coherentes con `resetLogic`/`cleanCategory`. Si el usuario cancela, el tablero no se modifica. En `cleanZone`, la cancelación de los clicks pendientes de la zona (CHG-4) sigue aplicándose al detectar el doble click (la cancelación de la confirmación deja la zona sin cambios).
- **Tests:** nuevo **T5b** (aceptación): H4 (Ctrl+Z dentro de un input → undo nativo y tablero intacto; Ctrl+Z fuera → undo del tablero) y H6 (doble click en zona y en etiqueta de ítem piden confirmación; cancelar → sin cambios; confirmar → se limpia). T5 (undo + límite de historial) se mantiene como guarda.
- **Spec `board-interaction`:** se corrige el requisito de "Limpieza de un grupo de categoría…" para el doble click en etiqueta de **ítem** (ahora con confirmación) y el de "Limpieza de una zona con doble click" (ahora con confirmación); se **añade** el requisito de la cabecera de categoría (`cleanCategory`), operación existente que no estaba especificada (comportamiento observado, sin cambio de código).
- Sin cambios en `index.php`, `logic.php`, `styles.css`, ni en la semántica de las limpiezas (`force`/`resetCell` intactos: la limpieza de zona no toca círculos; la de grupo/ítem sí los quita — comportamientos de siempre, fuera de alcance de PD-3).

## Criterios de aceptación

1. **CA1 (H4):** T5b: con foco en un input de texto, Ctrl+Z no deshace el tablero (y el undo nativo del texto funciona); con foco fuera, Ctrl+Z deshace el tablero como antes.
2. **CA2 (H6):** T5b: doble click en zona y en etiqueta de ítem piden confirmación; al cancelar el tablero no cambia; al confirmar se limpia.
3. **CA3:** T5 (undo y límite de historial) y T2b (desambiguación doble click) idénticos a la línea base.
4. **CA4:** T1, T1b, T2, T3, T4 y T6–T11 idénticos a la línea base.
5. **CA5:** `git diff` limitado a `script.js` y `tests/characterization/run.mjs`.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `undo-history`: se modifica "El atajo Ctrl+Z no interfiere con la edición de textos" (el defecto H4 pasa a ser el comportamiento exigido; escenario histórico conservado).
- `board-interaction`: se modifican "Limpieza de una zona con doble click" y "Limpieza de un grupo de categoría con doble click en su etiqueta" (confirmación; cancelación explícita) y se añade "Limpieza de un grupo completo de categoría con doble click en su cabecera" (operación existente, documentada).

## Impact

- **Código:** `script.js` (~25 líneas: handler de teclado + 2 confirmaciones + helper `isTextEditable`).
- **Riesgo:** (a) T2b y cualquier doble click programado dependen de la confirmación → el stub de `__diag` la aprueba por defecto (`confirmResults = true`), T2b inalterado; (b) el undo nativo depende del navegador → T5b lo verifica en Chromium real (evidencia de ejecución).

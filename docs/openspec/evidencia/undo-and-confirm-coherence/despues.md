# Comparación antes/después — undo-and-confirm-coherence (CHG-5)

> Fecha: 2026-11-17 · Comandos: `npm run test:characterization` (node v26.5.0, Chromium cacheado, servidor PHP 8.4 NTS en `localhost:8000`).
> Antes: `antes.md` (= reporte `baseline-2026-11-17T20-34-56-076Z.md`, 13 tests, código pre-cambio) · Después: `baseline-2026-11-17T20-38-30-997Z.md` (14 tests, código corregido).

## Comparación por test

| Test | Antes | Después | Diferencia | Clasificación |
|---|---|---|---|---|
| T1 Triángulo | OK (CHG-1) | Idéntico | No | Sin regresión |
| T1b Estrellas 3x4/5x5 | OK (CHG-1) | Idéntico | No | Sin regresión |
| T2 Clicks rápidos | OK (CHG-4) | Idéntico | No | Sin regresión |
| T2b Doble click / zona | OK (CHG-4) | Idéntico (el stub `__diag` aprueba la confirmación por defecto → T2b inalterado) | No | Sin regresión (guarda) |
| T3 Autocruce | OK-observado | Idéntico | No | Sin regresión |
| T4 Zonas | OK-observado | Idéntico | No | Sin regresión |
| T5 Undo + límite | OK-observado | Idéntico (Ctrl+Z con foco en body sigue deshaciendo el tablero) | No | Sin regresión (guarda) |
| T5b Ctrl+Z en inputs + confirmaciones | (no existía) | OK: **H4** — con foco en input, Ctrl+Z ejecuta el undo nativo del texto (una Z eliminada) y el tablero no se deshace; fuera del input, Ctrl+Z deshace el tablero. **H6** — doble click en zona y en etiqueta de ítem piden confirmación; cancelar → sin cambios; confirmar → se limpia | Nueva (aceptación CHG-5, CA1/CA2) | Cambio aprobado |
| T6 Import mismo modo | OK-observado | Idéntico | No | Sin regresión |
| T7 Import otro modo | OK-observado | Idéntico | No | Sin regresión |
| T8 Parámetro `mode` | OK (CHG-3) | Idéntico | No | Sin regresión |
| T9 Cambio de modo | BASELINE-DEFECTO (R5) | Idéntico (fuera de alcance) | No | Pendiente CHG-6 |
| T10 Export con board | OK (CHG-2) | Idéntico | No | Sin regresión |
| T11 Round-trip | OK (CHG-2) | Idéntico | No | Sin regresión |

**Resultado:** 14 tests, 0 con derivas inesperadas. T5b: nueva (aceptación). T5/T2b guardas intactos. Resto: idénticos a la línea base (CA4).

## Implementación

- **H4** (`script.js`): helper `isTextEditable(el)`; el handler de Ctrl+Z/Cmd+Z **no interviene** (ni `preventDefault` ni `undo`) cuando `document.activeElement` es un campo de texto editable (`INPUT` texto, `TEXTAREA`, `contentEditable`). Inputs no-texto (`file`, `checkbox`…) siguen delegando en el undo del tablero.
- **H6** (`script.js`): `cleanZone` pide confirmación "¿Limpiar zona?" (tras cancelar los clicks pendientes de la zona y antes de `saveHistory` — no se guarda historial de operaciones canceladas); `handleCleanLabel` pide confirmación "¿Limpiar ítem?".
- **Nota de precisión (vs diagnóstico):** H6 afirmaba que `cleanZone` ya pedía confirmación; verificado en el código que **no** la pide — la inconsistencia real afectaba a `cleanZone` y `handleCleanLabel` (ambos corregidos). `resetLogic`/`cleanCategory` ya la pedían (inalterados).
- Semánticas de limpieza sin cambios: `cleanZone` (vía `force`) no modifica círculos; `cleanLabel`/`cleanCategory` (vía `resetCell`) sí los quitan (comportamientos de siempre, fuera de alcance de PD-3).

## Diferencias investigadas

1. **T5b (nuevo):** apoyado por el delta aprobado (`undo-history` + `board-interaction`).
2. **Falsa expectativa inicial del test (transitoria, documentada):** la primera ejecución de T5b esperaba `value === 'Z'` tras el undo nativo, pero el input `cat_0_name` trae el valor por defecto `"A"` (observado `"ZA"`: el texto tecleado se insertó al inicio y el undo eliminó una Z — el undo nativo funcionaba). Corrección del test: `fill('#cat_0_name','')` previo para hacer la assertion determinista. Sin cambio de producto.

## Verificación

- `openspec validate undo-and-confirm-coherence`: (ver resultado en el cierre del change).
- `git diff`: solo `script.js` y `tests/characterization/run.mjs` (CA5).

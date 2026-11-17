# Comparación antes/después — fix-inference-recursion (CHG-1)

> Fecha: 2026-11-17 · Comandos: `npm run test:characterization` (node v26.5.0, Chromium cacheado, servidor PHP 8.4 NTS en `localhost:8000`).
> Antes: `antes.md` (= reporte `baseline-2026-11-17T19-48-08-623Z.md`, código pre-cambio) · Después: `baseline-2026-11-17T19-51-30-694Z.md` (código corregido).

## Comparación por test

| Test | Antes | Después | Diferencia | Clasificación |
|---|---|---|---|---|
| T1 Triángulo | BASELINE-DEFECTO: `(B,C)` inferido + `RangeError: Maximum call stack size exceeded` + `res_val_C_0` vacío | OK: `(B,C)` inferido, **sin error**, `res_val_B_0`=`B1`, `res_val_C_0`=`C1` | **Sí — cambio intencional aprobado** (delta de CHG-1: requisito "La inferencia termina…") | Cambio aprobado |
| T1b Estrellas 3x4/5x5 | (no existía) | OK: 3 pares inferidos en 3x4 y 6 pares en 5x5, sin errores, resultados completos | Nueva (aceptación CHG-1, CA2) | Cambio aprobado |
| T2 Ciclo + clicks rápidos | OK/BASELINE-DEFECTO (H3) | Idéntico | No | Sin regresión |
| T3 Autocruce | OK-observado | Idéntico | No | Sin regresión |
| T4 Zonas | OK-observado | Idéntico | No | Sin regresión |
| T5 Undo | OK-observado | Idéntico | No | Sin regresión |
| T6 Import mismo modo | OK-observado | Idéntico | No | Sin regresión |
| T7 Import otro modo | OK-observado | Idéntico | No | Sin regresión |
| T8 XSS `mode` | BASELINE-DEFECTO (R2) | Idéntico (fuera del alcance de CHG-1) | No | Pendiente CHG-3 |
| T9 Cambio de modo | BASELINE-DEFECTO (R5) | Idéntico (fuera de alcance) | No | Pendiente CHG-6 |
| T10 Export | BASELINE-DEFECTO (H10) | Idéntico (fuera de alcance) | No | Pendiente CHG-2 |

**Resultado:** 11 tests, 0 con derivas inesperadas. CA3 cumplido (T2–T10 idénticos a la línea base de CHG-0).

## Diferencias investigadas

1. **T1 (cambio intencional):** apoyado por el delta aprobado (`specs/transitive-inference/spec.md`) y los criterios de aceptación de la propuesta. Los valores anteriores se conservan en `antes.md`.
2. **Deriva transitoria durante el desarrollo (documentada, no es del producto):** en una ejecución intermedia, T3 y T1b fallaron porque el refactor encolaba la entrada con el orden de argumentos `(gRow, gCol, r, c)` en vez del orden original de `infer` `(gRow, r, gCol, c)`, produciendo una inferencia falsa en (A,B) r1c0. Diagnóstico por instrumentación de `findMatch`/`push` (el `updateResultsTable` también invoca `findMatch`, lo que enmascaró el origen en la primera traza). Corrección: una línea (orden de la entrada en cola). La ejecución final verifica T3 idéntico a la línea base.

## Verificación

- `openspec validate fix-inference-recursion`: (ver resultado en el cierre del change).
- `git diff`: solo `script.js` y `tests/characterization/run.mjs` (CA4).

# Proposal — fix-inference-recursion (CHG-1)

## Why

Defecto H2 (R1, confirmado dos veces: V7 Fase 2 y T1 de la suite): la inferencia transitiva entra en **recursión infinita** (`applyState → infer → setRel → applyState`) cuando la propagación re-procesa celdas que ya eran círculos. Consecuencia: `RangeError: Maximum call stack size exceeded` en consola y la tabla RESULTADOS no se actualiza tras la marca que desborda la pila. Es el caso de uso básico que el README anuncia como característica. Requisito confirmado por D2 (2026-11-17): "La inferencia termina y la tabla de resultados queda siempre actualizada".

## What Changes

- **Solo `script.js`** (la inferencia): sustituir la recursión `infer`/`setRel` por **propagación iterativa a punto fijo** con cola de celdas recién circuladas (diseño en `design.md`). Las celdas ya círculo no se re-procesan (deduplicación por cambio de estado). `autoCross` y el resto del tablero no cambian.
- **Test T1** (`tests/characterization/run.mjs`): actualizar sus expectativas a la línea base corregida (cambio intencional aprobado por este delta): sin `RangeError`, `res_val_C_0` = `C1`. Se añade un escenario de cadena multi-paso en 5x5 (aceptación). Los valores anteriores se conservan en la evidencia de CHG-0.
- Sin cambios en `index.php`, `logic.php`, `styles.css`, fixtures ni esquema JSON.

## Criterios de aceptación

1. Triángulo 3x4: `(B,C) r0c0` inferido, **sin error en consola**, `res_val_B_0`=`B1` y `res_val_C_0`=`C1`.
2. Cadena 5x5 (A=B, B=C, C=D mismo ítem): todos los pares inferidos hasta punto fijo, sin errores, resultados completos.
3. Los 9 tests restantes de la suite producen **idéntico** resultado que la línea base de CHG-0 (sin derivas fuera de T1).
4. `git diff` solo toca `script.js` y `tests/characterization/run.mjs`.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `transitive-inference`: se modifica el requisito "La inferencia termina y la tabla de resultados queda siempre actualizada" (el escenario de línea base del defecto pasa a ser el comportamiento exigido; se añade escenario de cadena multi-paso).

## Impact

- **Código:** `script.js` (~40 líneas en el bloque infer/ setRel/applyState).
- **Riesgo:** la propagación iterativa debe ser semánticamente idéntica a la recursiva actual para todo lo que hoy funciona (T1 parte 1, T3, resultados). Mitigación: suite completa antes/después y comparación por test.

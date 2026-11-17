# Tasks — fix-inference-recursion (CHG-1)

## Línea base

- [x] Ejecutar `npm run test:characterization` ANTES del cambio y conservar el reporte en `docs/openspec/evidencia/fix-inference-recursion/antes.md` (10 tests, 0 derivas, T1 con defecto H2 registrado).

## Implementación (solo script.js y el test T1)

- [x] Refactorizar la inferencia: `infer`/`setRel` → `runInference()` + `addCircleSafe()` + `inferQueue` según `design.md`; `applyState(2)` encola en vez de recursar; el handler de click drena la cola una vez. (Corrección en desarrollo: la entrada en cola usa el orden de argumentos original `infer(gRow, r, gCol, c)`; ver `despues.md` "Deriva transitoria".)
- [x] Actualizar el test T1 a la línea base corregida (cambio intencional aprobado por el delta): sin `RangeError`, `res_val_B_0`=`B1`, `res_val_C_0`=`C1`. Valores anteriores conservados en `antes.md`.
- [x] Añadir T1b: estrella 3x4 (A0=B0, A0=C0, A0=D0 → 3 pares inferidos sin error) y estrella 5x5 (4 círculos de A → 6 pares inferidos sin error).

## Verificación

- [x] Ejecutar la suite DESPUÉS; `docs/openspec/evidencia/fix-inference-recursion/despues.md` con la comparación por test: T1/T1b cambio intencional documentado; T2–T10 idénticos (11 tests, 0 derivas).
- [x] `openspec validate fix-inference-recursion` OK y `git diff` revisado: solo `script.js` y `tests/characterization/run.mjs`.

## Criterios de aceptación

- [x] CA1: triángulo 3x4 sin error y resultados completos (B1/C1).
- [x] CA2: estrellas multi-paso (3x4 y 5x5) sin error y con todos los pares inferidos.
- [x] CA3: T2–T10 idénticos a la línea base de CHG-0.
- [x] CA4: diff limitado a `script.js` y `run.mjs`.

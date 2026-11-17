# Design — fix-inference-recursion (CHG-1)

## Causa raíz

`applyState(zona,2)` → `infer()` → `setRel()` → `applyState(zona,2)` **aunque la celda objetivo ya fuera círculo**: re-add del círculo existente re-dispara `infer` sin `visited`, sin límite de profundidad ni condición de cambio de estado. En un triángulo consistente el ciclo `infer(0,0,1,0) ↔ infer(2,0,1,0)` no tiene punto fijo → `RangeError` (evidencia: T1, CHG-0).

## Opciones

| Opción | Valoración |
|---|---|
| **A. Propagación iterativa a punto fijo (cola de celdas recién circuladas)** — **elegida** | Terminación garantizada (dedup por cambio de estado); misma semántica de `findMatch`/`autoCross`; ~40 líneas; bajo riesgo |
| B. Recursión con límite de profundidad | No garantiza propagación completa (corte arbitrario); mantiene la semántica frágil. Descartada |
| C. Solver de restricciones completo | Sobredimensionado; riesgo de regresión alto para el alcance. Descartada |

## Diseño (opción A)

Estado nuevo: `inferQueue` (lista de `[gr, r, gc, c]` — zona y coordenada del círculo **recién añadido**).

1. `applyState(gr, gc, r, c, 2)`: igual que hoy **salvo** que en lugar de llamar `infer(...)` recursivo, hace `inferQueue.push([gr, r, gc, c])`. (El estado 1/vacío no cambia nada.)
2. `runInference()`: drena la cola; para cada `(c1,i1,c2,i2)` y cada `c3` distinto de `c1,c2`:
   - `m3 = findMatch(c1,i1,c3)` → si existe, `addCircleSafe(c2, i2, c3, m3)`
   - `m3 = findMatch(c2,i2,c3)` → si existe, `addCircleSafe(c1, i1, c3, m3)`
   (mismo orden y mismas llamadas que el `infer` actual).
3. `addCircleSafe(ca, ia, cb, ib)`: `co = getCoords(ca,cb)`; si no existe zona, nada. Calcula `(r,c)` con el `swapped` actual; **si la celda ya es círculo → return** (dedup, el corazón de la terminación); si no, `applyState(co.gr, co.gc, r, c, 2)` (que la encola).
4. Punto de entrada: el handler de click llama `applyState(...)` y después `runInference()` (una sola vez por acción de usuario). `infer` y `setRel` se eliminan.

**Terminación:** durante el drenado una celda solo se encola al pasar a círculo; un círculo no se quita durante el drenado → transiciones acotadas por el nº de celdas → la cola se vacía.

**Semántica preservada:** `findMatch`, `autoCross`, `force` (no toca círculos) y el ciclo de estados del usuario son intactos. La regla de propagación es monótona y conmutativa en el resultado final (punto fijo único), así que el orden de procesado no cambia el estado final, solo el intermedio. `updateResultsTable()` se ejecuta en cada `applyState` (más frecuente, idempotente y barata) → tras el drenado los resultados están siempre actualizados.

**Sin retracts (igual que hoy):** borrar un círculo no quita inferencias previas; no se cambia este comportamiento.

## Riesgos y mitigaciones

- Diferencias de orden en cascadas largas → punto fijo único (monotonía); verificado con el escenario de estrella (T1b).
- Rendimiento: peor caso O(celdas × zonas × items) por marca; con 5x5 (250 celdas) es insignificante.
- Regresión en lo que hoy funciona → suite completa antes/después (T2–T10 idénticos).

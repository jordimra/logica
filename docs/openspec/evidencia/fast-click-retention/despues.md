# Comparación antes/después — fast-click-retention (CHG-4)

> Fecha: 2026-11-17 · Comandos: `npm run test:characterization` (node v26.5.0, Chromium cacheado, servidor PHP 8.4 NTS en `localhost:8000`).
> Antes: `antes.md` (= reporte `baseline-2026-11-17T20-16-35-961Z.md`, 12 tests, código pre-cambio) · Después: `baseline-2026-11-17T20-19-58-019Z.md` (13 tests, código corregido).

## Comparación por test

| Test | Antes | Después | Diferencia | Clasificación |
|---|---|---|---|---|
| T1 Triángulo | OK (CHG-1) | Idéntico | No | Sin regresión |
| T1b Estrellas 3x4/5x5 | OK (CHG-1) | Idéntico | No | Sin regresión |
| T2 Ciclo + clicks rápidos | BASELINE-DEFECTO (H3): el click en X (t0) se cancelaba; solo Y registrado | OK: ciclo lento invariable (❌→🔵→vacío) y **ambos** clicks rápidos (X a t0, Y a t0+100) registrados | **Sí — cambio intencional aprobado** (delta de CHG-4: requisito "Demora de 250 ms para desambiguar click simple de doble click") | Cambio aprobado |
| T2b Doble click / desambiguación | (no existía) | OK: doble click limpia cruces y cancela las acciones pendientes de la zona (sin marca residual); las acciones de otras zonas no se cancelan; círculos no modificados por la limpieza (comportamiento de siempre) | Nueva (aceptación CHG-4, CA2 + regresión de desambiguación) | Cambio aprobado |
| T3 Autocruce | OK-observado | Idéntico | No | Sin regresión |
| T4 Zonas | OK-observado | Idéntico | No | Sin regresión |
| T5 Undo | OK-observado | Idéntico | No | Sin regresión |
| T6 Import mismo modo | OK-observado | Idéntico | No | Sin regresión |
| T7 Import otro modo | OK-observado | Idéntico | No | Sin regresión |
| T8 Parámetro `mode` | OK (CHG-3) | Idéntico | No | Sin regresión |
| T9 Cambio de modo | BASELINE-DEFECTO (R5) | Idéntico (fuera de alcance) | No | Pendiente CHG-6 |
| T10 Export con board | OK (CHG-2) | Idéntico | No | Sin regresión |
| T11 Round-trip | OK (CHG-2) | Idéntico | No | Sin regresión |

**Resultado:** 13 tests, 0 con derivas inesperadas. T2: H3 corregido (cambio intencional documentado). T2b: nueva (regresión de desambiguación + cancelación por zona). Resto: idénticos a la línea base (CA3).

## Implementación

- `script.js`: `clickTimer` global (única) sustituido por `clickQueue` (Map `id de celda → {gr, gc, r, c, timer}`):
  - `toggleCell`: click en la misma celda reemplaza la acción pendiente (último gana, como en el baseline); click en otra celda **no cancela nada** (H3 corregido). El estado se lee en el momento de ejecutar (como antes).
  - `cleanZone(gr, gc)`: cancela solo las entradas de esa zona (coherente con el requisito "…cancelar cualquier click simple pendiente **sobre ella**"; el código anterior cancelaba la única acción global, incluso de otra zona).
- Semánticas completas antes/después en `design.md` (tabla).

## Diferencias investigadas

1. **T2b (cambio intencional):** apoyado por el delta aprobado.
2. **Hallazgo documentado (sin cambio de comportamiento):** el requisito de la spec "Limpieza de una zona con doble click" (Fase 3) decía "vaciar todas las celdas", pero la implementación **no modifica los círculos** (la primitiva `force` retorna si la celda contiene círculo; `cleanZone` solo usa `force`). En la primera ejecución de T2b la assertion esperaba "zona vacía" y falló (círculo observado). Verificado contra el código baseline: es el comportamiento de siempre, fuera del alcance de PD-2. El delta corrige el requisito para documentar el comportamiento real; T2b asertiona el comportamiento observado (cruces limpiados, círculo intacto). Si se desea que el doble click elimine también círculos, será un change nuevo.
3. La primera ejecución intermedia de T2b (con la assertion incorrecta) no modificó el producto; la corrección fue solo del test, y la ejecución final verifica 13/13.

## Verificación

- `openspec validate fast-click-retention`: (ver resultado en el cierre del change).
- `git diff`: solo `script.js` y `tests/characterization/run.mjs` (CA4).

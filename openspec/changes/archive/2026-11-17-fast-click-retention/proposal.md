# Proposal — fast-click-retention (CHG-4)

## Why

Defecto H3 (R3, confirmado por T2 de la suite): `toggleCell` usa un único `clickTimer` global y **cualquier** click nuevo cancela la acción pendiente, aunque sea sobre otra celda. Resultado: dos clicks rápidos en celdas distintas **pierden la primera marca** (el `clearTimeout` de `toggleCell` anula la acción de X cuando llega el click en Y, 100 ms después). El retardo de 250 ms existe para desambiguar click simple de doble click (`ondblclick="cleanZone(...)"`, `index.php:122`), pero la cancelación es demasiado amplia.

Requisito confirmado por **PD-2** (aprobado 2026-11-17): "Corregir pérdida de marca con clicks rápidos (diseño: pila de acciones en cola en lugar de cancelación)". La spec `board-interaction` contiene el requisito "Demora de 250 ms para desambiguar click simple de doble click" con el escenario de línea base del defecto.

## What Changes

- **`script.js` (solo el manejo de clicks):**
  - Sustituir el `clickTimer` global por **`clickQueue`** (Map celda → acción pendiente con su timer):
    - Click en **otra** celda → no toca las acciones pendientes de otras celdas (cada celda drena su propia acción a los 250 ms). **Corrige H3.**
    - Click repetido en la **misma** celda → reemplaza la acción pendiente de esa celda (último click gana; conserva la desambiguación simple/doble del baseline).
  - `cleanZone(gr, gc)`: cancela las acciones pendientes **solo de esa zona** (coherente con el requisito existente "…y cancelar cualquier click simple pendiente **sobre ella**"; el código anterior cancelaba la única acción global, incluso de otra zona).
- **Test T2** (`tests/characterization/run.mjs`): actualizar la parte de clicks rápidos a la línea base corregida (cambio intencional aprobado por el delta): los dos clicks (X y Y, 100 ms de intervalo) quedan registrados. La parte del ciclo lento (3 clicks espaciados) es invariante.
- **Test T2b (nuevo):** regresión de desambiguación: (a) doble click en zona marcada → zona vacía; (b) click rápido + doble click en la misma zona (dentro de la ventana) → sin marca residual; (c) click rápido en (A,B) + doble click en otra zona (A,C) → la acción de (A,B) se ejecuta (las acciones de otras zonas ya no se cancelan).
- Sin cambios en `index.php`, `logic.php`, `styles.css`, ni en la lógica de estados (`applyState`/`autoCross`/inferencia/undo).

## Criterios de aceptación

1. **CA1:** T2 corregido: clicks rápidos en celdas distintas (100 ms) → ambas marcas registradas; ciclo lento invariable (vacío → ❌ → 🔵 → vacío).
2. **CA2:** T2b: doble click sigue limpiando la zona marcada; las acciones pendientes de esa zona se cancelan (sin marca residual); las acciones de otras zonas no se cancelan.
3. **CA3:** T1, T1b, T3–T11 idénticos a la línea base.
4. **CA4:** `git diff` limitado a `script.js` y `tests/characterization/run.mjs`.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `board-interaction`: se modifica "Demora de 250 ms para desambiguar click simple de doble click" (la cancelación global se sustituye por cola por celda; el escenario de línea base del defecto pasa a ser el comportamiento exigido; se añaden escenarios de misma celda y de cancelación por zona).

## Impact

- **Código:** `script.js` (~20 líneas en `toggleCell`/`cleanZone` + declaración).
- **Cambio de comportamiento documentado:** (1) clicks rápidos en celdas distintas ya no pierden la primera marca (H3 corregido); (2) un doble click en una zona ya no cancela acciones pendientes de **otras** zonas (el baseline cancelaba la única acción global). Ambas consecuencias son el objetivo de PD-2 y coherentes con los requisitos de la spec.
- **Riesgo:** la desambiguación doble click podría degradarse → mitigado por T2b (regresión explícita) y por mantener el reemplazo de la acción pendiente en la misma celda (último click gana, como en el baseline).
- **Hallazgo (sin cambio de comportamiento):** el requisito "Limpieza de una zona con doble click" de la spec (Fase 3) decía "vaciar todas las celdas", pero la implementación no modifica los **círculos** (`force` los deja intactos). El doble click limpia cruces y cancela acciones pendientes de la zona; los círculos permanecen. Fuera del alcance de CHG-4; el delta corrige el requisito para documentar el comportamiento real (ver `design.md` § Hallazgo).

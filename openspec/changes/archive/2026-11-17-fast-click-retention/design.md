# Design — fast-click-retention (CHG-4)

## Causa raíz

`clickTimer` es **único y global** (`script.js:5`):

- `toggleCell` hace `clearTimeout(clickTimer)` ante **cualquier** click nuevo → una acción pendiente de la celda X se anula si el siguiente click (aunque sea en Y) llega antes de los 250 ms (H3, T2).
- `cleanZone` (doble click) también cancela ese mismo timer global — correcto para su zona, pero como solo puede existir una acción a la vez, la cancelación es indiscriminada respecto a otras zonas.

El retardo existe porque la celda tiene `onclick` (toggle) **y** `ondblclick` (cleanZone, `index.php:122`): el doble click dispara 2 clicks + 1 dblclick, y sin retardo el toggle ejecutaría antes de la limpieza.

## Opciones

| Opción | Valoración |
|---|---|
| **A. Cola de acciones por celda (Map) — elegida (PD-2: "pila de acciones en cola en lugar de cancelación")** | Cada celda tiene su propia acción pendiente; un click en otra celda no la toca (H3 corregido). Misma celda: reemplazo (último click gana) → desambiguación doble click intacta. ~20 líneas, sin tocar `applyState`/`autoCross`/undo |
| B. Reducir `CLICK_DELAY` a 0 (clicks inmediatos) | Rompe la desambiguación con `cleanZone` (el toggle ejecutarse antes que el dblclick) |
| C. Usar el evento `detail` / `preventDefault` de click | Depende de detalles del navegador y sigue con cancelación global; más riesgo que A |

## Implementación

Estado nuevo: `const clickQueue = new Map()` — clave: `id` de celda (`cell_<gr>_<gc>_<r>_<c>`); valor: `{ gr, gc, r, c, timer }`. Se sustituye la declaración de `clickTimer` (cabeza de `script.js`, comentario incluido).

**`toggleCell(gr, gc, r, c)`:**
1. `id = cell_gr_gc_r_c`.
2. Si `clickQueue.has(id)`: `clearTimeout` del timer de esa celda y `delete` (mismo que el baseline para la misma celda: último click gana).
3. `clickQueue.set(id, { gr, gc, r, c, timer: setTimeout(() => { clickQueue.delete(id); saveHistory(); leer estado actual de la celda; applyState(gr, gc, r, c, (st+1)%3); runInference(); }, CLICK_DELAY) })`.
   - El estado se lee **en el momento de ejecutar** (igual que el baseline): la secuencia de ciclos por celda no cambia.

**`cleanZone(gr, gc)`:**
1. Iterar `[...clickQueue]`; para cada entrada con `gr`/`gc` coincidentes: `clearTimeout` + `delete` (cancelación acotada a la zona, coherente con el requisito "…cancelar cualquier click simple pendiente **sobre ella**").
2. Resto sin cambios: `saveHistory()`, `force(gr, gc, r, c, 0)` para las 9 celdas, `updateResultsTable()`.

## Semánticas (tablas)

| Secuencia | Baseline | Después |
|---|---|---|
| Click lento (>250 ms) | toggle a los 250 ms | igual |
| 3 clicks lentos (ciclo) | vacío→❌→🔵→vacío | igual |
| Click X a t0, click Y a t0+100 (H3) | X cancelado, solo Y | **X a t250 y Y a t350 (ambos registrados)** |
| Click X a t0, click X a t0+100 (misma celda) | 1 toggle (último gana) | igual (reemplazo en la cola) |
| Doble click en zona (2 clicks + dblclick) | cleanZone cancela el toggle pendiente; cruces limpiados, **círculos no se tocan** (`force` no modifica círculos) | igual (cleanZone cancela las entradas de la zona; semántica de `force` sin cambios) |
| Click X(a t0) en zona Z1, doble click en zona Z2 a t0+50 | toggle de X cancelado (timer global) → X no se marca | **toggle de X se ejecuta** (cancelación acotada a Z2) |

**Historial:** cada acción ejecutada hace `saveHistory` como hoy; con H3 corregido hay una entrada más por click rápido (coherente: cada acción aplicada se puede deshacer). T5 (undo) usa clicks lentos → invariante.

## Riesgos y mitigaciones

- Regresión en la desambiguación doble click → T2b la cubre explícitamente (3 escenarios).
- Orden de ejecución de acciones colindantes: cada timer drena de forma independiente (FIFO por tiempo de click); `applyState` es idempotente por celda y `updateResultsTable` se ejecuta en cada aplicación → estado final independiente del orden.
- Celda eliminada del DOM (cambio de modo): el handler lee `getElementById` en la ejecución y `return` si no existe (igual que el baseline).

## Hallazgo (sin cambio de comportamiento)

Durante la ejecución de T2b se verificó que el requisito de la spec "Limpieza de una zona con doble click" (Fase 3) describía "vaciar **todas** las celdas", pero la implementación no modifica los **círculos** (la primitiva `force` retorna antes si la celda contiene círculo; `cleanZone` usa solo `force`). El doble click limpia cruces y cancela las acciones pendientes de la zona; los círculos permanecen. CHG-4 no cambia esta semántica (fuera de alcance de PD-2); el delta corrige el requisito para documentar el comportamiento real observado. Si se desea que el doble click también elimine círculos, será un change nuevo con decisión propia.

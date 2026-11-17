# Tasks — fast-click-retention (CHG-4)

## Línea base

- [x] Ejecutar `npm run test:characterization` ANTES del cambio y conservar el reporte en `docs/openspec/evidencia/fast-click-retention/antes.md` (12 tests, 0 derivas; T2 con defecto H3 registrado).

## Implementación (solo script.js y tests)

- [x] Sustituir `clickTimer` global por `clickQueue` (Map celda → `{gr, gc, r, c, timer}`) según `design.md`:
  - [x] `toggleCell`: click en la misma celda reemplaza la acción pendiente (último gana); click en otra celda no cancela nada.
  - [x] `cleanZone`: cancela solo las entradas de la zona `(gr, gc)`; resto sin cambios.
  - [x] Comentario de cabecera actualizado.
- [x] Actualizar el test T2 a la línea base corregida (cambio intencional aprobado por el delta): los dos clicks rápidos (X a t0, Y a t0+100) quedan registrados; ciclo lento invariable. Valores anteriores en `antes.md`.
- [x] Añadir T2b: regresión de desambiguación (doble click limpia cruces y cancela acciones pendientes de la zona; acciones de otras zonas no se cancelan; círculos no modificados — hallazgo documentado en `despues.md`).

## Verificación

- [x] Ejecutar la suite DESPUÉS (13 tests, 0 derivas); `docs/openspec/evidencia/fast-click-retention/despues.md` con la comparación por test: T2/T2b cambio intencional documentado; T1, T1b, T3–T11 idénticos.
- [x] `openspec validate fast-click-retention` OK y `git diff` revisado: solo `script.js` y `tests/characterization/run.mjs`.

## Criterios de aceptación

- [x] CA1: T2 corregido (clicks rápidos en celdas distintas: ambas marcas; ciclo lento invariable).
- [x] CA2: T2b (desambiguación doble click intacta + cancelación acotada a la zona + hallazgo de círculos documentado).
- [x] CA3: T1, T1b, T3–T11 idénticos a la línea base.
- [x] CA4: diff limitado a `script.js` y `run.mjs`.

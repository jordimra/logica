# Tasks — spec-text-hygiene

## Deltas

- [x] Escribir los 4 deltas de spec (board-modes ×2, board-interaction ×2, undo-history ×1, data-import-export ×1) con los 7 requisitos comprimidos y escenarios intactos.
- [x] `openspec validate spec-text-hygiene` → válido, 0 warnings.

## Verificación

- [x] Ejecutar `npm run test:characterization` (prueba de invariante, sin código tocado) → 14/14, 0 derivas; reporte conservado en `docs/openspec/evidencia/spec-text-hygiene/invariante.md`.
- [x] Tras archive: `openspec validate` de las 6 specs principales → 0 warnings; `git diff` limitado a ficheros de `openspec/` y la evidencia.

## Criterios de aceptación

- [x] CA1: 0 warnings en las 6 specs tras el archive (ver verificación final de campaña).
- [x] CA2: los 7 requisitos conservan nombre, escenarios (nombres y contenido) y semántica SHALL (garantizado por el validador del delta).
- [x] CA3: suite 14/14, 0 derivas.
- [x] CA4: sin código de producto en el diff.

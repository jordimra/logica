# Proposal — spec-text-hygiene

## Why

La verificación final de la campaña dejó **7 warnings** de `openspec validate` (requisito >500 caracteres) en 4 specs principales: `board-modes` (2), `board-interaction` (2), `undo-history` (1), `data-import-export` (1). Origen: las líneas `_Estado: …` que los deltas de CHG-2/3/4/5/6 añadieron al archivar (procedencia + rutas de evidencia completas) encimaron el umbral sobre el body del requisito. No son errores — las specs siguen válidas — pero se corrigen antes de cerrar la campaña para que la línea base de validación quede limpia.

## What Changes

- **Solo texto de specs** (4 specs, 7 requisitos): se comprime el body del requisito (conservando todos los SHALL) y la línea `_Estado:` pasa a formato compacto (`confirmado por <decisión>; implementado por <CHG>. Evidencia: <ruta>/`).
- **Los escenarios no cambian**: nombres y contenido idénticos (el validador lo exige para MODIFIED y es la garantía de que no hay cambio semántico).
- **Sin cambios de producto**: `script.js`, `index.php`, `logic.php`, `styles.css` y tests no se tocan; la suite se ejecuta una vez como prueba de invariante (14/14 esperados).

## Criterios de aceptación

1. **CA1:** `openspec validate` sobre las 6 specs principales → **0 warnings**.
2. **CA2:** Los 7 requisitos conservan nombre, todos sus escenarios (nombres y contenido) y la semántica de los SHALL (comprobado por el validador del delta y revisión).
3. **CA3:** Suite `npm run test:characterization` → 14/14, 0 derivas (invariante: sin código tocado).
4. **CA4:** `git diff` limitado a ficheros de `openspec/` (deltas de este change).

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `board-modes`: "El servidor valida y escapa el parámetro `mode`" y "Confirmación antes de recargar al cambiar de modo" (solo compresión de texto).
- `board-interaction`: "Demora de 250 ms para desambiguar click simple de doble click" y "Limpieza de una zona con doble click" (solo compresión de texto).
- `undo-history`: "El atajo Ctrl+Z no interfiere con la edición de textos" (solo compresión de texto).
- `data-import-export`: "Exportación de la plantilla y del progreso" (solo compresión de texto).

## Impact

- **Código:** ninguno.
- **Riesgo:** ninguno funcional (sin producto); el riesgo es puramente documental — mitigado por CA2 (escenarios intactos) y CA1 (validación limpia).

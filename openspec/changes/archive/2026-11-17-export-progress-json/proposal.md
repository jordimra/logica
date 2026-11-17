# Proposal — export-progress-json (CHG-2)

## Why

Defecto H10 (R7, confirmado por T10 de la suite): la exportación JSON incluye modo, categorías, ítems y descripción pero **no el estado del tablero**, pese a que el README promete "Guarda tus plantillas **o progresos**". Requisito confirmado por D2 (2026-11-17): "Exportación de la plantilla y del progreso". El esquema del JSON extendido fue aprobado por delegación (PD-4) y documentado en `docs/openspec/flujo-de-trabajo.md` §6.

## What Changes

- **`script.js` (solo export/import):**
  - `exportData`: añade `version: 2` y `board` (mapa zona `"<gr>_<gc>"` → celda `"<r>_<c>"` → estado `1`=❌/`2`=🔵; celdas vacías omitidas). Nombre de archivo sin cambios.
  - `populateData`: si el archivo tiene `board` y modo compatible, restaura las marcas **tal cual** (clases directas) sin re-disparar autocruce/inferencia (evita cascadas y semántica nueva), y recalcula resultados con `syncData()`. Zonas o coordenadas inexistentes en el modo actual se ignoran.
  - **Compatibilidad v1:** archivos sin `version`/`board` se importan exactamente como hoy.
- **Tests:** T10 se actualiza a la línea base corregida (export incluye `board`); nuevo T11 round-trip (marcas → export → import → mismo estado + resultados); T6 (fixture v1) se mantiene como prueba de compatibilidad.
- Sin cambios en `index.php`, `logic.php`, `styles.css`.

## Criterios de aceptación

1. T10: el JSON exportado incluye `version: 2` y `board` con las marcas exactas (círculo + autocruces).
2. T11 round-trip: tras importar el propio export, el tablero restaura ❌/🔵 idénticos y la tabla de resultados se calcula sobre ellos; sin errores en consola.
3. T6 (v1) y T7 (otro modo) idénticos a la línea base (compatibilidad).
4. Los 8 tests restantes idénticos a la línea base.
5. `git diff` solo toca `script.js` y `tests/characterization/run.mjs`.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `data-import-export`: se modifica "Exportación de la plantilla y del progreso" (el escenario de línea base del defecto pasa a histórico; se añade escenario de compatibilidad v1).

## Impact

- **Código:** `script.js` (~35 líneas en `exportData`/`populateData`).
- **Riesgo:** import de `board` malformado → mitigado con validación defensiva (regex de claves, límites por `numItems`, `getElementById` nulo → ignorar). El flujo `pendingImport` (otro modo) no cambia: la restauración solo ocurre con modo coincidente.

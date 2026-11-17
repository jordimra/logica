# Tasks — export-progress-json (CHG-2)

## Línea base

- [x] Ejecutar `npm run test:characterization` ANTES del cambio y conservar el reporte en `docs/openspec/evidencia/export-progress-json/antes.md` (11 tests, 0 derivas; T10 con defecto H10 registrado).

## Implementación (solo script.js y tests)

- [x] `exportData`: añadir `version: 2` y `board` (mapa zona→celda→estado 1/2, celdas vacías omitidas) según `design.md`.
- [x] `populateData`: restaurar `board` con modo coincidente (clases directas, sin autocruce/inferencia), con validación defensiva (regex, límites, zonas inexistentes ignoradas); v1 sin cambios.
- [x] Actualizar T10 a la línea base corregida (export incluye `version: 2` y `board` con las marcas exactas: círculo + autocruces + omisión de vacías). Valores anteriores en `antes.md`.
- [x] Añadir T11: round-trip (marcar → export → fixture temporal → nueva página → importar → mismo estado ❌/🔵 + resultados + alerta, sin errores).

## Verificación

- [x] Ejecutar la suite DESPUÉS (12 tests, 0 derivas); `docs/openspec/evidencia/export-progress-json/despues.md` con la comparación: T10/T11 cambio intencional documentado; T1–T9 idénticos (T6 v1 y T7 otro modo como guardas de compatibilidad).
- [x] `openspec validate export-progress-json` OK y `git diff` revisado: `script.js` y `tests/characterization/run.mjs` (producto) + `.gitignore` (fixture temporal de T11).

## Criterios de aceptación

- [x] CA1: T10 verifica `version: 2` + `board` correcto (círculo=2, autocruces=1, vacías omitidas).
- [x] CA2: T11 round-trip fiel (marcas ❌/🔵 + resultados B1/C1 + sin errores + alerta de éxito).
- [x] CA3: T6 (v1) y T7 (otro modo) idénticos a la línea base.
- [x] CA4: T1, T1b y T2–T5 idénticos a la línea base.
- [x] CA5: diff limitado a `script.js`, `run.mjs` y `.gitignore` (infraestructura de tests).

# Proposal — characterization-suite (CHG-0)

## Why

El diagnóstico (Fase 1) planificó los tests de caracterización T1–T10 pero ninguno fue creado; la línea base **no es ejecutable** (hallazgo F-1 de la Fase 5). Todos los cambios de producto posteriores (CHG-1…CHG-6) dependen de una línea base automatizada que capture el comportamiento actual (incluidos los defectos H2, H10, R2, H3, H4 y R5 documentados como línea base) para poder comparar antes/después.

## What Changes

- **Solo herramientas de test; CERO cambios de producto** (`index.php`, `logic.php`, `script.js`, `styles.css` no se tocan).
- Nuevo runner Node `tests/characterization/run.mjs` que:
  - Arranca el servidor `php -S localhost:8000` (PHP 8.4 NTS, ruta completa documentada) y lo detiene al terminar.
  - Ejecuta T1–T10 + la prueba de XSS contra `http://localhost:8000` con Playwright (Chromium cacheado localmente; `playwright-core` como devDependency).
  - Cada test: página nueva, acciones deterministas (esperas > 300 ms para el retardo de 250 ms de la app), observación de DOM/consola/JSON y registro del resultado **tal como se observa** (los defectos se registran como `BASELINE-DEFECTO`, no como fallos).
  - Genera reporte Markdown con evidencia en `docs/openspec/evidencia/characterization-suite/`.
- Fixtures JSON sintéticos en `tests/fixtures/` (T6, T7).
- `package.json` (devDependencies únicamente; la app sigue sin dependencias) y `node_modules/` excluido del versionado.
- Stub deterministas: `alert`/`confirm` (registro en memoria), `URL.createObjectURL` (captura del Blob exportado).

## Criterios de aceptación

1. `npm run test:characterization` ejecuta los 11 tests de forma reproducible (mismo resultado en 2 ejecuciones consecutivas).
2. El reporte de evidencia registra por test: comando, entorno, entrada, salida observada y clasificación (OK-observado / BASELINE-DEFECTO).
3. La línea base coincide con la evidencia manual de las Fases 2 y 5 (T1: círculo inferido + `RangeError` + `res_val_C_0` vacío; XSS: payload sin escapar en `<title>`).
4. Ningún fichero de producto es modificado (`git diff` limpio de producto tras la ejecución).

## Capabilities

### New Capabilities

(ninguna — es tooling de test)

### Modified Capabilities

(ninguna — no hay cambios de requisitos; `skip_specs: true`)

## Impact

- **Código de producto:** ninguno.
- **Herramientas:** `package.json`, `node_modules/` (ignorado), `tests/characterization/run.mjs`, `tests/fixtures/*.json`.
- **Dependencias:** `playwright-core` (solo desarrollo; Chromium ya cacheado en el entorno, sin descargas).
- **Riesgo:** la suite lee y escribe solo en `http://localhost:8000` con datos sintéticos; sin efectos irreversibles ni datos reales.

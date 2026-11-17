# Tasks — characterization-suite (CHG-0)

## Implementación

- [x] Preparar entorno: `package.json` (dev-only, `playwright-core`), `node_modules/` en `.gitignore`, Chromium cacheado (`chromium-1254`) sin descargas. Evidencia: `npm install` → "added 1 package".
- [x] Crear runner `tests/characterization/run.mjs` (arranca/detiene servidor PHP si no hay uno, 10 tests T1–T10 + XSS como T8, reporte Markdown). Ajustes durante la creación (bugs del test, no del producto): `p.page.evaluate`, expectativa de undo (restaura el estado previo, cruz), header de categoría 0 en `rh_cat_0`, stub de `URL.createObjectURL`, valor bruto vs. etiqueta capitalizada.
- [x] Crear fixtures sintéticos `tests/fixtures/import-3x4.json` e `import-5x5.json`.
- [x] Ejecutar la suite 2 veces consecutivas (reproducibilidad). Evidencia: `baseline-2026-11-17T19-42-43-740Z.md` y `baseline-2026-11-17T19-42-57-746Z.md` — ambas "10 tests, 0 con derivas", exit 0.
- [x] Verificar coincidencia con la evidencia manual de las Fases 2/5: T1 → `(B,C) r0c0=O` + `RangeError: Maximum call stack size exceeded` + `res_val_C_0` vacío; T8 → payload reflejado sin escapar en `<title>`. Identico a V6/V7 (Fase 2) y E1/E2 (Fase 5).
- [x] Validar el change (`openspec validate characterization-suite` → "is valid", `skip_specs` aceptado) y confirmar `git status` sin ficheros de producto modificados.

## Criterios de aceptación

- [x] CA1: `npm run test:characterization` ejecuta los 10 tests de forma reproducible (2 ejecuciones consecutivas idénticas, exit 0).
- [x] CA2: reporte de evidencia con clasificación por test (OK-observado / BASELINE-DEFECTO) en `docs/openspec/evidencia/characterization-suite/`.
- [x] CA3: línea base coincide con la evidencia manual previa (Fases 2/5) — T1 y T8 idénticos.
- [x] CA4: cero cambios de producto tras la ejecución (`git status`: solo `.gitignore`, `package.json`, `package-lock.json`, `tests/`, evidencia y el change).

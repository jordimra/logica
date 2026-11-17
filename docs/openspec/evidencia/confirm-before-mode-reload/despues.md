# Comparación antes/después — confirm-before-mode-reload (CHG-6)

> Fecha: 2026-11-17 · Comandos: `npm run test:characterization` (node v26.5.0, Chromium cacheado, servidor PHP 8.4 NTS en `localhost:8000`).
> Antes: `antes.md` (= reporte `baseline-2026-11-17T20-40-17-533Z.md`, 14 tests, código pre-cambio) · Después: `baseline-2026-11-17T20-42-15-629Z.md` (14 tests, código corregido).

## Comparación por test

| Test | Antes | Después | Diferencia | Clasificación |
|---|---|---|---|---|
| T1 Triángulo | OK (CHG-1) | Idéntico | No | Sin regresión |
| T1b Estrellas 3x4/5x5 | OK (CHG-1) | Idéntico | No | Sin regresión |
| T2 Clicks rápidos | OK (CHG-4) | Idéntico | No | Sin regresión |
| T2b Doble click / zona | OK (CHG-4) | Idéntico | No | Sin regresión |
| T3 Autocruce | OK-observado | Idéntico | No | Sin regresión |
| T4 Topología de zonas | OK-observado | Idéntico (guarda: modos válidos inalterados) | No | Sin regresión (guarda) |
| T5 Undo + límite | OK-observado | Idéntico | No | Sin regresión |
| T5b Ctrl+Z + confirmaciones | OK (CHG-5) | Idéntico | No | Sin regresión |
| T6 Import mismo modo | OK-observado | Idéntico | No | Sin regresión |
| T7 Import otro modo (recarga) | OK-observado | Idéntico (el flujo de import no pasa por el selector; sin confirmación añadida) | No | Sin regresión (guarda) |
| T8 Parámetro `mode` | OK (CHG-3) | Idéntico | No | Sin regresión |
| T9 Cambio de modo | BASELINE-DEFECTO (R5): recarga inmediata, marcas perdidas, sin aviso | OK: (a) **cancelar** → confirmación pedida, modo sigue `3x4` y la marca se conserva (sin recarga); (b) **confirmar** → recarga a `4x4` (progreso no exportado perdido, aceptado) | **Sí — cambio intencional aprobado** (delta de CHG-6: requisito "Confirmación antes de recargar al cambiar de modo") | Cambio aprobado |
| T10 Export con board | OK (CHG-2) | Idéntico | No | Sin regresión |
| T11 Round-trip | OK (CHG-2) | Idéntico | No | Sin regresión |

**Resultado:** 14 tests, 0 con derivas inesperadas. T9: R5 corregido (cambio intencional documentado). T4/T7 guardas intactos. Resto: idénticos a la línea base (CA3/CA4).

**Conclusión de la suite: los 5 defectos de línea base (H2, H3, H4/H6, R2, R5, H10 — T1, T2, T8, T9, T10) quedan corregidos y verificados; la suite completa pasa 14/14 sin BASELINE-DEFECTO.**

## Implementación

- `index.php`: `onchange="this.form.submit()"` → `onchange="confirmModeChange(this)"` (1 línea).
- `script.js`: `confirmModeChange(sel)`: mismo modo → sin acción; confirmar → `sel.form.submit()`; cancelar → `sel.value = CONFIG.mode` (restauración sin segundo `change` ni recarga).
- El flujo de import de otro modo (T7) no pasa por el selector → invariante.

## Verificación

- `openspec validate confirm-before-mode-reload`: (ver resultado en el cierre del change).
- `git diff`: `index.php` + `script.js` + `tests/characterization/run.mjs` (CA5).

# Comparación antes/después — export-progress-json (CHG-2)

> Fecha: 2026-11-17 · Comandos: `npm run test:characterization` (node v26.5.0, Chromium cacheado, servidor PHP 8.4 NTS en `localhost:8000`).
> Antes: `antes.md` (= reporte `baseline-2026-11-17T19-58-59-946Z.md`, 11 tests, código pre-cambio) · Después: `baseline-2026-11-17T20-00-51-304Z.md` (12 tests, código corregido).

## Comparación por test

| Test | Antes | Después | Diferencia | Clasificación |
|---|---|---|---|---|
| T1 Triángulo | OK (CHG-1) | Idéntico | No | Sin regresión |
| T1b Estrellas 3x4/5x5 | OK (CHG-1) | Idéntico | No | Sin regresión |
| T2 Ciclo + clicks rápidos | BASELINE-DEFECTO (H3) | Idéntico | No | Pendiente CHG-4 |
| T3 Autocruce | OK-observado | Idéntico | No | Sin regresión |
| T4 Zonas | OK-observado | Idéntico | No | Sin regresión |
| T5 Undo | OK-observado | Idéntico | No | Sin regresión |
| T6 Import mismo modo (v1) | OK-observado | Idéntico (fixture v1 sin `board` sigue importando solo textos) | No | Sin regresión (compatibilidad) |
| T7 Import otro modo | OK-observado | Idéntico | No | Sin regresión |
| T8 XSS `mode` | BASELINE-DEFECTO (R2) | Idéntico (fuera de alcance) | No | Pendiente CHG-3 |
| T9 Cambio de modo | BASELINE-DEFECTO (R5) | Idéntico (fuera de alcance) | No | Pendiente CHG-6 |
| T10 Export | BASELINE-DEFECTO (H10): JSON sin estado del tablero | OK: `version: 2` + `board` con círculo (A,B) r0c0=2, autocruces r0c1/r1c0=1, celdas vacías omitidas | **Sí — cambio intencional aprobado** (delta de CHG-2: requisito "Exportación de la plantilla y del progreso") | Cambio aprobado |
| T11 Round-trip | (no existía) | OK: marcas ❌/🔵 restauradas (incluida la inferida (B,C) r0c0), resultados `B1`/`C1` calculados, sin errores, alerta de éxito | Nueva (aceptación CHG-2, CA2) | Cambio aprobado |

**Resultado:** 12 tests, 0 con derivas inesperadas. T10/T11: cambios intencionales documentados (delta aprobado). T1–T9: idénticos a la línea base (CA3/CA4).

## Verificación

- `exportData`: añade `version: 2` y `board` (mapa zona `"gr_gc"` → celda `"r_c"` → 1/2; celdas vacías omitidas). Sin cambios en el resto del payload ni en el nombre de archivo.
- `populateData`: restaura `board` solo si `data.board && data.mode === CONFIG.mode`, con clases directas (sin autocruce/inferencia) y validación defensiva (regex de claves, `r`/`c < numItems`, zona inexistente → ignorar). `syncData()` recalcula resultados y ayudas visuales. v1 sin cambios (T6 como guarda).
- T11 escribe `tests/fixtures/roundtrip-3x4.json` (fixture temporal, ignorado por `.gitignore` extendido) y lo importa en una página nueva vía `setInputFiles`.
- `openspec validate export-progress-json`: (ver resultado en el cierre del change).
- `git diff`: `script.js` + `tests/characterization/run.mjs` (CA5) y `.gitignore` (añade `tests/fixtures/roundtrip-*.json`; infraestructura de tests para el fixture temporal de T11, sin impacto de producto).

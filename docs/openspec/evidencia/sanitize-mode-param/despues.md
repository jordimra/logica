# Comparación antes/después — sanitize-mode-param (CHG-3)

> Fecha: 2026-11-17 · Comandos: `npm run test:characterization` (node v26.5.0, Chromium cacheado, servidor PHP 8.4 NTS en `localhost:8000`).
> Antes: `antes.md` (= reporte `baseline-2026-11-17T20-06-25-990Z.md`, 12 tests, código pre-cambio) · Después: `baseline-2026-11-17T20-08-46-141Z.md` (12 tests, código corregido).
> Verificación previa: `php -l logic.php` y `php -l index.php` → sin errores de sintaxis.

## Comparación por test

| Test | Antes | Después | Diferencia | Clasificación |
|---|---|---|---|---|
| T1 Triángulo | OK (CHG-1) | Idéntico | No | Sin regresión |
| T1b Estrellas 3x4/5x5 | OK (CHG-1) | Idéntico (5x5 sigue funcionando: modo válido no alterado) | No | Sin regresión (guarda CA2) |
| T2 Ciclo + clicks rápidos | BASELINE-DEFECTO (H3) | Idéntico | No | Pendiente CHG-4 |
| T3 Autocruce | OK-observado | Idéntico | No | Sin regresión |
| T4 Topología de zonas | OK-observado (4 modos válidos) | Idéntico | No | Sin regresión (guarda CA2) |
| T5 Undo | OK-observado | Idéntico | No | Sin regresión |
| T6 Import mismo modo | OK-observado | Idéntico | No | Sin regresión |
| T7 Import otro modo (recarga `?mode=4x4`) | OK-observado | Idéntico (recarga con modo válido intacta) | No | Sin regresión (guarda CA2) |
| T8 Parámetro `mode` | BASELINE-DEFECTO (R2): payload `"><script>alert(1)</script>` reflejado crudo en `<title>` | OK: payload **no reflejado** en HTML; `CONFIG.mode === '3x4'` y tablero 3x4 renderizado **sin errores de consola** (punto de inyección JS cubierto); modo inválido simple normalizado a `3x4` | **Sí — cambio intencional aprobado** (delta de CHG-3: requisito "El servidor valida y escapa el parámetro `mode`") | Cambio aprobado |
| T9 Cambio de modo | BASELINE-DEFECTO (R5) | Idéntico (fuera de alcance) | No | Pendiente CHG-6 |
| T10 Export con board | OK (CHG-2) | Idéntico | No | Sin regresión |
| T11 Round-trip | OK (CHG-2) | Idéntico | No | Sin regresión |

**Resultado:** 12 tests, 0 con derivas inesperadas. T8: cambio intencional documentado (delta aprobado). Resto: idénticos a la línea base (CA3).

## Verificación

- **`logic.php`:** whitelist estricta `in_array($mode, ['3x4','4x4','5x4','5x5'], true)` → cualquier otro valor (vacío, `?mode[]`, mayúsculas, payload) se normaliza a `'3x4'` en la fuente.
- **`index.php`:** `htmlspecialchars($mode, ENT_QUOTES, 'UTF-8')` en los dos ecos (`<title>` y literal JS `CONFIG.mode`) — defensa en profundidad (PD-1); no-op garantizado tras la whitelist.
- **Cambio de comportamiento documentado:** `?mode=` (vacío) y valores como `3X4` pasan de `CONFIG.mode` vacío/`3X4` (layout 3x4, incoherente) a `3x4` en todos los sitios (tabla completa en `design.md`).
- `openspec validate sanitize-mode-param`: (ver resultado en el cierre del change).
- `git diff`: `logic.php` + `index.php` + `tests/characterization/run.mjs` (CA4).

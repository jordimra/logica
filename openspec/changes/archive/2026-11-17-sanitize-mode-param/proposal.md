# Proposal — sanitize-mode-param (CHG-3)

## Why

Defecto R2 (XSS reflejado, confirmado por T8 de la suite y por las ejecuciones V6/Fase 5): `logic.php` lee `$_GET['mode']` sin validar (`$mode = $_GET['mode'] ?? '3x4'`) y `index.php` ecoea el valor crudo en dos puntos de inyección:

1. **HTML:** `<title>… - <?php echo $mode; ?></title>` (`index.php:7`) — el payload `"><script>alert(1)</script>` se refleja sin escapar (evidencia T8 baseline).
2. **JS:** `mode: '<?php echo $mode; ?>'` (`index.php:174`) — inyección en literal de JavaScript: un payload como `x';alert(1);//` ejecuta código arbitrario y rompe la configuración (`CONFIG.mode`). Más grave que el XSS HTML y no cubierto por el test actual.

Requisito confirmado por **PD-1** (aprobado 2026-11-17): "Corregir XSS de `mode` (whitelist en servidor + escape)". La spec principal `board-modes` ya contiene el requisito "El servidor valida y escapa el parámetro `mode`" con los escenarios de línea base y requerido.

## What Changes

- **`logic.php` (una sola línea funcional):** whitelist estricta — si `mode` no está en `['3x4','4x4','5x4','5x5']` (incluido vacío y valores `?mode[]` de tipo array), se normaliza a `'3x4'`. Al normalizar en la fuente, todos los usos posteriores (switch, comparaciones del selector, ecos) reciben solo literales seguros.
- **`index.php` (dos líneas):** `htmlspecialchars($mode, ENT_QUOTES, 'UTF-8')` en los dos ecos (`<title>` y literal `CONFIG.mode`) — defensa en profundidad exigida por PD-1; con la whitelist es un no-op garantizado, y protege si la whitelist se elimina en el futuro.
- **Test T8** (`tests/characterization/run.mjs`): se actualiza a la línea base corregida (cambio intencional aprobado por este delta): (a) el payload **no** se refleja en el HTML; (b) la página carga con `CONFIG.mode === '3x4'` y **sin errores de consola** (cubre el punto de inyección JS); (c) modo inválido simple (`modo-inexistente`) normalizado a `3x4`. Los valores anteriores se conservan en la evidencia.
- Sin cambios en `script.js`, renderizado del tablero ni comportamiento de modos válidos.

## Criterios de aceptación

1. **CA1:** T8 corregido: payload no reflejado en HTML; `CONFIG.mode` normalizado a `3x4` (payload e inválido simple) con tablero 3x4 renderizado y sin errores en consola.
2. **CA2:** Los modos válidos no cambian: T4 (topología), T7 (import otro modo, recarga `?mode=4x4`) y T1b (5x5) idénticos a la línea base.
3. **CA3:** Los 10 tests restantes idénticos a la línea base.
4. **CA4:** `git diff` limitado a `logic.php`, `index.php` y `tests/characterization/run.mjs`.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `board-modes`: se modifica "El servidor valida y escapa el parámetro `mode`" (el escenario de línea base del defecto pasa a histórico; se añaden escenarios de modo inválido normalizado y de modo válido no alterado).

## Impact

- **Código:** `logic.php` (~4 líneas), `index.php` (2 ecos).
- **Cambio de comportamiento documentado:** `?mode=` (vacío) o valores como `3X4` (mayúsculas) pasan de renderizar la cuadrícula 3x4 con `CONFIG.mode` vacío/`3X4` a normalizar a `3x4` en todos los sitios (título, selector, `CONFIG`). Mejora de coherencia, sin efecto en modos válidos.
- **Riesgo:** ninguno apreciable — la whitelist contiene exactamente los 4 valores del selector; guardas T4/T7/T1b.

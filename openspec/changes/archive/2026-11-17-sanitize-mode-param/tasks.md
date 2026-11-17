# Tasks — sanitize-mode-param (CHG-3)

## Línea base

- [x] Ejecutar `npm run test:characterization` ANTES del cambio y conservar el reporte en `docs/openspec/evidencia/sanitize-mode-param/antes.md` (12 tests, 0 derivas; T8 con defecto R2 registrado).

## Implementación (solo logic.php, index.php y el test T8)

- [x] `logic.php`: whitelist estricta `in_array($mode, ['3x4','4x4','5x4','5x5'], true)` con normalización a `'3x4'` según `design.md`.
- [x] `index.php`: `htmlspecialchars($mode, ENT_QUOTES, 'UTF-8')` en los dos ecos (`<title>` y literal `CONFIG.mode`) — defensa en profundidad (PD-1). `php -l` sin errores.
- [x] Actualizar el test T8 a la línea base corregida (cambio intencional aprobado por el delta): payload no reflejado en HTML; `CONFIG.mode === '3x4'` + tablero renderizado + sin errores de consola (payload e inválido simple). Valores anteriores en `antes.md`.

## Verificación

- [x] Ejecutar la suite DESPUÉS (12 tests, 0 derivas); `docs/openspec/evidencia/sanitize-mode-param/despues.md` con la comparación por test: T8 cambio intencional documentado; T1, T1b, T2–T7 y T9–T11 idénticos.
- [x] `openspec validate sanitize-mode-param` OK y `git diff` revisado: solo `logic.php`, `index.php` y `tests/characterization/run.mjs`.

## Criterios de aceptación

- [x] CA1: T8 corregido (payload no reflejado; `CONFIG.mode` normalizado a `3x4`; sin errores de consola).
- [x] CA2: modos válidos sin cambios (T4, T7 y T1b idénticos a la línea base).
- [x] CA3: resto de tests idénticos a la línea base.
- [x] CA4: diff limitado a `logic.php`, `index.php` y `run.mjs`.

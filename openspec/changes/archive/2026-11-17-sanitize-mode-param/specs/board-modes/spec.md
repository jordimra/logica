# Spec Delta — board-modes

## MODIFIED Requirements

### Requirement: El servidor valida y escapa el parámetro `mode`
El servidor SHALL validar `mode` contra la lista de modos admitidos (`3x4`, `4x4`, `5x4`, `5x5`) y normalizar cualquier otro valor (incluido vacío o de tipo no esperado) al modo por defecto `3x4`, y SHALL escapar los valores antes de ecoearlos en la página; como consecuencia, ningún valor externo SHALL reflejarse sin escapar en el título, el selector ni el literal de configuración JS.
_Estado: requisito confirmado por PD-1 (2026-11-17); implementado por CHG-3 (whitelist en `logic.php` + escape en `index.php`, ver `design.md`). La línea base del defecto anterior (R2) queda conservada como evidencia en `docs/openspec/evidencia/sanitize-mode-param/antes.md` y en la suite de caracterización (CHG-0)._

#### Scenario: Intento de inyección vía parámetro (línea base del defecto)
- **WHEN** (histórico, código pre-CHG-3) se carga `/index.php?mode=%22%3E%3Cscript%3Ealert(1)%3C%2Fscript%3E`
- **THEN** el payload se refleja sin escapar en el `<title>` (documento histórico, no comportamiento exigido; evidencia conservada: baseline de CHG-0 y `antes.md`, test T8)

#### Scenario: Comportamiento requerido tras la corrección (CHG-3)
- **WHEN** se carga `/index.php?mode=%22%3E%3Cscript%3Ealert(1)%3C%2Fscript%3E` o cualquier valor no admitido
- **THEN** el servidor normaliza el valor a `3x4`, el payload no aparece en la página (título, selector ni literal de configuración JS) y la aplicación se carga sin errores de consola

#### Scenario: Modo inválido simple normalizado al por defecto
- **WHEN** se carga `/index.php?mode=modo-inexistente`
- **THEN** la página renderiza la cuadrícula `3x4`, el selector marca `3x4 (Original)` y el modo de configuración (`CONFIG.mode`) es `3x4`

#### Scenario: Modo válido no alterado por la validación
- **WHEN** se carga `/index.php?mode=4x4`
- **THEN** el modo de configuración (`CONFIG.mode`) es `4x4` y la página renderiza 4 categorías × 4 ítems, sin errores de consola

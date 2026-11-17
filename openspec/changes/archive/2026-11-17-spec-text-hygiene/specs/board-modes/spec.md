# Spec Delta — board-modes

## MODIFIED Requirements

### Requirement: El servidor valida y escapa el parámetro `mode`
El servidor SHALL validar `mode` contra la lista de modos admitidos (`3x4`, `4x4`, `5x4`, `5x5`) y normalizar cualquier otro valor al modo por defecto `3x4`, y SHALL escapar los valores antes de ecoearlos en la página (título, selector y literal de configuración JS).
_Estado: confirmado por PD-1; implementado por CHG-3. Evidencia: `docs/openspec/evidencia/sanitize-mode-param/`._

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

### Requirement: Confirmación antes de recargar al cambiar de modo
Al cambiar el modo desde el selector, el sistema SHALL solicitar confirmación al usuario antes de recargar la página; si la cancela, el selector SHALL volver al modo actual y la página SHALL mantener el modo y el estado actuales sin recargar.
_Estado: confirmado por IC-1; implementado por CHG-6. Evidencia: `docs/openspec/evidencia/confirm-before-mode-reload/`._

#### Scenario: Línea base del defecto (comportamiento actual)
- **WHEN** (histórico, código pre-CHG-6) el usuario tiene marcas y textos sin exportar y cambia el modo desde el selector
- **THEN** la página recarga de inmediato en el nuevo modo y el trabajo no exportado se pierde (documento histórico, no comportamiento exigido; evidencia: `antes.md`, test T9)

#### Scenario: Comportamiento requerido tras la corrección (CHG-6)
- **WHEN** el usuario cambia el modo y cancela la confirmación
- **THEN** la página no recarga, el selector vuelve al modo actual y el estado del tablero y los textos permanecen intactos

#### Scenario: Confirmar el cambio de modo
- **WHEN** el usuario cambia el modo y confirma
- **THEN** la página recarga en el nuevo modo (el progreso no exportado se pierde, decisión aceptada por el usuario)

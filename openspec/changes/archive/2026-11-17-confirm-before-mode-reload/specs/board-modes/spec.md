# Spec Delta — board-modes

## MODIFIED Requirements

### Requirement: Confirmación antes de recargar al cambiar de modo
Al cambiar el modo desde el selector, el sistema SHALL solicitar confirmación al usuario antes de recargar la página; si el usuario la cancela, el selector SHALL volver al modo actual y la página SHALL mantener el modo y el estado actuales sin recargar.
_Estado: requisito confirmado por IC-1 (2026-11-17); implementado por CHG-6 (confirmación en cliente `confirmModeChange`, ver `design.md`). La línea base del defecto anterior (R5) queda conservada como evidencia en `docs/openspec/evidencia/confirm-before-mode-reload/antes.md` y en la suite de caracterización (CHG-0)._

#### Scenario: Línea base del defecto (comportamiento actual)
- **WHEN** (histórico, código pre-CHG-6) el usuario tiene marcas y textos sin exportar y cambia el modo desde el selector
- **THEN** la página recarga de inmediato en el nuevo modo y el trabajo no exportado se pierde (documento histórico, no comportamiento exigido; evidencia: `antes.md`, test T9)

#### Scenario: Comportamiento requerido tras la corrección (CHG-6)
- **WHEN** el usuario cambia el modo y cancela la confirmación
- **THEN** la página no recarga, el selector vuelve al modo actual y el estado del tablero y los textos permanecen intactos

#### Scenario: Confirmar el cambio de modo
- **WHEN** el usuario cambia el modo y confirma
- **THEN** la página recarga en el nuevo modo (el progreso no exportado se pierde, decisión aceptada por el usuario)

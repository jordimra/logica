# Spec Delta — board-interaction

## MODIFIED Requirements

### Requirement: Limpieza de una zona con doble click
Un doble click sobre una zona del tablero SHALL solicitar confirmación antes de vaciar las celdas con cruz de esa zona y cancelar cualquier click simple pendiente sobre ella. Los círculos existentes de la zona NO se modifican por la limpieza (la primitiva de limpieza no toca celdas con círculo — comportamiento observado y conservado). Si el usuario cancela, la zona no se modifica.
_Estado: corrección CHG-5 (PD-3: confirmaciones coherentes; ver `design.md`). La línea base anterior (doble click sin confirmación) queda conservada en `docs/openspec/evidencia/undo-and-confirm-coherence/antes.md`._

#### Scenario: Doble click en una zona
- **WHEN** el usuario hace doble click sobre la zona (A,B) que contiene cruces y confirma la limpieza
- **THEN** los cruces de la zona quedan vacíos, el círculo r0c0 (si existiera) permanece, los resultados se recalculan y cualquier click simple pendiente de esa zona se cancela

#### Scenario: Cancelar la limpieza de zona
- **WHEN** el usuario hace doble click sobre una zona con marcas y responde No a la confirmación
- **THEN** la zona permanece exactamente como estaba (sin limpieza ni cambios)

### Requirement: Limpieza de un grupo de categoría con doble click en su etiqueta
Un doble click sobre la etiqueta de un ítem de una categoría (fila o columna) SHALL solicitar confirmación antes de vaciar las celdas correspondientes a ese ítem en todas las zonas donde la categoría participa (como fila o como columna). Si el usuario cancela, el tablero no se modifica.
_Estado: corrección CHG-5 (PD-3: confirmaciones coherentes; la línea base "sin diálogo de confirmación" queda conservada en `docs/openspec/evidencia/undo-and-confirm-coherence/antes.md`)._

#### Scenario: Doble click en la etiqueta de B (ítem 1)
- **WHEN** el usuario hace doble click sobre la etiqueta del ítem 1 de la categoría B y confirma la limpieza
- **THEN** se vacían las celdas de la fila/columna del ítem 1 en las zonas (A,B) y (B,C)… (todas las zonas que contienen B)

#### Scenario: Cancelar la limpieza de grupo de ítem
- **WHEN** el usuario hace doble click sobre la etiqueta de un ítem y responde No a la confirmación
- **THEN** el tablero no cambia (las celdas de ese ítem permanecen)

## ADDED Requirements

### Requirement: Limpieza de un grupo completo de categoría con doble click en su cabecera
Un doble click sobre la cabecera de una categoría (etiqueta de fila o columna de la categoría) SHALL solicitar confirmación; al confirmarse, el sistema SHALL vaciar todas las celdas de todos los ítems de esa categoría en las zonas donde participa. Si el usuario cancela, el tablero no se modifica.
_Estado: comportamiento observado documentado por CHG-5 (`cleanCategory` existía antes sin estar especificada; sin cambio de código). Caracterización: T5b._

#### Scenario: Doble click en la cabecera de B
- **WHEN** el usuario hace doble click sobre la cabecera de la categoría B y confirma
- **THEN** se vacían las celdas de todos los ítems de B en las zonas donde B participa y el estado previo queda en el historial (deshacible con Ctrl+Z)
